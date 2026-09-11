import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import { WebSocketServer, type RawData, type WebSocket } from 'ws';

const MAX_MESSAGE_BYTES = 32 * 1024;
const COMMAND_TIMEOUT_MS = 3_000;
const TARGET_ID = /^chrome:\d+:\d+:\d+$/;

export type BrowserMediaCommand = 'playPause' | 'next' | 'previous' | 'setVolume';
export type BrowserMediaCommandStatus = 'confirmed' | 'unsupported' | 'target-gone' | 'permission-denied' | 'failed';
export interface BrowserMediaCommandResult { status: BrowserMediaCommandStatus; targetId: string; }
export interface BrowserMediaSession {
  targetId: string; windowId: number; tabId: number; frameId: number; origin: string; title: string;
  artist?: string; artworkUrl?: string; isPlaying: boolean; position?: number; duration?: number; volume?: number;
  activityAt?: number; isFrontmost?: boolean; isActiveTab?: boolean;
  capabilities: Partial<Record<BrowserMediaCommand, boolean>>;
}
export type BrowserMediaBridgeMessage =
  | { type: 'pair'; token: string }
  | { type: 'media-session'; session: BrowserMediaSession }
  | { type: 'session-removed'; targetId: string }
  | { type: 'command-result'; requestId: string; targetId: string; status: BrowserMediaCommandStatus };
type OutboundMessage = { type: 'paired' } | { type: 'command'; requestId: string; targetId: string; command: BrowserMediaCommand; value?: number };
interface ClientState { socket: WebSocket; sessionIds: Set<string>; }
interface PendingCommand { targetId: string; resolve: (result: BrowserMediaCommandResult) => void; timer: NodeJS.Timeout; }
export type BrowserMediaSessionListener = (sessions: readonly BrowserMediaSession[]) => void;

/** Pure ownership bookkeeping. A target can belong to exactly one paired client. */
export class BrowserMediaSessionRegistry<Owner> {
  private readonly owners = new Map<string, Owner>();
  assign(targetId: string, owner: Owner): Owner | undefined { const prior = this.owners.get(targetId); this.owners.set(targetId, owner); return prior; }
  ownerOf(targetId: string): Owner | undefined { return this.owners.get(targetId); }
  removeIfOwned(targetId: string, owner: Owner): boolean { if (this.owners.get(targetId) !== owner) return false; this.owners.delete(targetId); return true; }
}

/** Small, pure validation seam: the bridge accepts JSON only, never page DOM or unbounded payloads. */
export function parseBrowserMediaBridgeMessage(input: string): BrowserMediaBridgeMessage | undefined {
  if (Buffer.byteLength(input, 'utf8') > MAX_MESSAGE_BYTES) return undefined;
  let value: unknown;
  try { value = JSON.parse(input); } catch { return undefined; }
  if (!isRecord(value) || typeof value.type !== 'string') return undefined;
  if (value.type === 'pair') return typeof value.token === 'string' && value.token.length <= 256 ? { type: 'pair', token: value.token } : undefined;
  if (value.type === 'session-removed') return isTargetId(value.targetId) ? { type: 'session-removed', targetId: value.targetId } : undefined;
  if (value.type === 'command-result') return isRequestId(value.requestId) && isTargetId(value.targetId) && isCommandStatus(value.status)
    ? { type: 'command-result', requestId: value.requestId, targetId: value.targetId, status: value.status } : undefined;
  if (value.type === 'media-session') { const session = parseSession(value.session); return session ? { type: 'media-session', session } : undefined; }
  return undefined;
}

/** Authenticated, loopback-only bridge for the opt-in Chrome media companion. */
export class BrowserMediaBridge {
  private readonly token = randomBytes(32).toString('base64url');
  private readonly server = new WebSocketServer({ host: '127.0.0.1', port: 0, maxPayload: MAX_MESSAGE_BYTES });
  private readonly ready: Promise<void>;
  private readonly clients = new Map<WebSocket, ClientState>();
  private readonly sessions = new Map<string, BrowserMediaSession>();
  private readonly owners = new BrowserMediaSessionRegistry<ClientState>();
  private readonly listeners = new Set<BrowserMediaSessionListener>();
  private readonly pending = new Map<string, PendingCommand>();
  private readonly commandChains = new Map<string, Promise<void>>();
  private port?: number;
  private stopped = false;

  constructor() {
    this.ready = new Promise<void>((resolve, reject) => { this.server.once('listening', resolve); this.server.once('error', reject); });
    this.server.on('connection', (socket, request) => this.handleConnection(socket, request));
  }
  async start(): Promise<void> {
    if (this.stopped) throw new Error('Bridge has been stopped');
    await this.ready;
    const address = this.server.address();
    if (!address || typeof address === 'string') throw new Error('Bridge did not receive a TCP port');
    this.port = address.port;
  }
  connectionDetails(): { port: number } { if (!this.port) throw new Error('Bridge has not started'); return { port: this.port }; }
  pairingToken(): string { return this.token; }
  subscribeSessions(listener: BrowserMediaSessionListener): () => void { this.listeners.add(listener); listener([...this.sessions.values()]); return () => this.listeners.delete(listener); }
  async command(targetId: string, command: BrowserMediaCommand, value?: number): Promise<BrowserMediaCommandResult> {
    if (!isTargetId(targetId)) return { status: 'target-gone', targetId };
    const prior = this.commandChains.get(targetId) ?? Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const chain = prior.then(() => gate);
    this.commandChains.set(targetId, chain);
    await prior;
    try { return await this.sendCommand(targetId, command, value); }
    finally { release(); if (this.commandChains.get(targetId) === chain) this.commandChains.delete(targetId); }
  }
  async stop(): Promise<void> {
    if (this.stopped) return;
    this.stopped = true;
    for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.resolve({ status: 'target-gone', targetId: pending.targetId }); }
    this.pending.clear();
    for (const client of this.server.clients) client.terminate();
    await new Promise<void>((resolve, reject) => this.server.close((error) => error ? reject(error) : resolve()));
    this.clients.clear(); this.sessions.clear(); this.notifySessions();
  }
  private handleConnection(socket: WebSocket, request: IncomingMessage): void {
    const remote = request.socket.remoteAddress;
    if (remote !== '127.0.0.1' && remote !== '::1' && remote !== '::ffff:127.0.0.1') { socket.close(1008, 'Loopback connections only'); return; }
    const pairingTimer = setTimeout(() => socket.close(1008, 'Pairing timed out'), COMMAND_TIMEOUT_MS);
    // ws emits an error event even for failures before a client has paired.
    socket.on('error', () => { clearTimeout(pairingTimer); const client = this.clients.get(socket); if (client) this.removeClient(client); });
    socket.once('message', (data, isBinary) => {
      clearTimeout(pairingTimer);
      const pairing = !isBinary ? this.parseRaw(data) : undefined;
      if (pairing?.type !== 'pair' || !sameToken(pairing.token, this.token)) { socket.close(1008, 'Invalid pairing token'); return; }
      const client: ClientState = { socket, sessionIds: new Set() };
      this.clients.set(socket, client); this.send(socket, { type: 'paired' });
      socket.on('message', (next, binary) => this.handleMessage(client, next, binary));
      socket.once('close', () => this.removeClient(client));
    });
    socket.once('close', () => clearTimeout(pairingTimer));
  }
  private handleMessage(client: ClientState, raw: RawData, isBinary: boolean): void {
    const message = !isBinary ? this.parseRaw(raw) : undefined;
    // A page frame can disappear or become opaque while Chrome is reporting
    // media. Ignore that single invalid snapshot; never disconnect the paired
    // browser and throw away otherwise healthy media sessions.
    if (!message || message.type === 'pair') return;
    if (message.type === 'media-session') {
      const targetId = message.session.targetId;
      const previousOwner = this.owners.assign(targetId, client);
      if (previousOwner && previousOwner !== client) previousOwner.sessionIds.delete(targetId);
      this.sessions.set(targetId, message.session); client.sessionIds.add(targetId); this.notifySessions(); return;
    }
    if (message.type === 'session-removed') { client.sessionIds.delete(message.targetId); if (this.owners.removeIfOwned(message.targetId, client)) this.removeSession(message.targetId); return; }
    const pending = this.pending.get(message.requestId);
    if (pending && pending.targetId === message.targetId) { clearTimeout(pending.timer); this.pending.delete(message.requestId); pending.resolve({ status: message.status, targetId: message.targetId }); }
  }
  private async sendCommand(targetId: string, command: BrowserMediaCommand, value?: number): Promise<BrowserMediaCommandResult> {
    const session = this.sessions.get(targetId);
    if (!session) return { status: 'target-gone', targetId };
    if (!session.capabilities[command]) return { status: 'unsupported', targetId };
    const client = this.owners.ownerOf(targetId);
    if (!client || client.socket.readyState !== client.socket.OPEN) return { status: 'target-gone', targetId };
    const requestId = randomBytes(16).toString('base64url');
    return new Promise<BrowserMediaCommandResult>((resolve) => {
      const timer = setTimeout(() => { this.pending.delete(requestId); resolve({ status: 'failed', targetId }); }, COMMAND_TIMEOUT_MS);
      this.pending.set(requestId, { targetId, resolve, timer });
      this.send(client.socket, { type: 'command', requestId, targetId, command, ...(value === undefined ? {} : { value }) });
    });
  }
  private removeClient(client: ClientState): void {
    if (!this.clients.delete(client.socket)) return;
    for (const targetId of client.sessionIds) if (this.owners.removeIfOwned(targetId, client)) this.removeSession(targetId);
    for (const [requestId, pending] of this.pending) if (client.sessionIds.has(pending.targetId)) { clearTimeout(pending.timer); this.pending.delete(requestId); pending.resolve({ status: 'target-gone', targetId: pending.targetId }); }
  }
  private removeSession(targetId: string): void { if (this.sessions.delete(targetId)) this.notifySessions(); }
  private notifySessions(): void { const sessions = [...this.sessions.values()]; for (const listener of this.listeners) listener(sessions); }
  private parseRaw(raw: RawData): BrowserMediaBridgeMessage | undefined {
    if (typeof raw === 'string') return parseBrowserMediaBridgeMessage(raw);
    const bytes = Array.isArray(raw) ? Buffer.concat(raw) : raw instanceof ArrayBuffer ? Buffer.from(raw) : raw;
    return parseBrowserMediaBridgeMessage(bytes.toString('utf8'));
  }
  private send(socket: WebSocket, message: OutboundMessage): void { if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message)); }
}

function parseSession(value: unknown): BrowserMediaSession | undefined {
  if (!isRecord(value) || !isTargetId(value.targetId) || !isNonNegativeInt(value.windowId) || !isNonNegativeInt(value.tabId) || !isNonNegativeInt(value.frameId) || typeof value.origin !== 'string' || typeof value.title !== 'string' || typeof value.isPlaying !== 'boolean' || !isRecord(value.capabilities)) return undefined;
  if (value.targetId !== `chrome:${value.windowId}:${value.tabId}:${value.frameId}` || !isHttpUrl(value.origin) || value.origin.length > 2048 || value.title.length > 1024) return undefined;
  const capabilities: BrowserMediaSession['capabilities'] = {};
  for (const command of ['playPause', 'next', 'previous', 'setVolume'] as const) { if (value.capabilities[command] !== undefined && typeof value.capabilities[command] !== 'boolean') return undefined; if (typeof value.capabilities[command] === 'boolean') capabilities[command] = value.capabilities[command]; }
  const session: BrowserMediaSession = { targetId: value.targetId, windowId: value.windowId, tabId: value.tabId, frameId: value.frameId, origin: value.origin, title: value.title, isPlaying: value.isPlaying, capabilities };
  if (typeof value.artist === 'string' && value.artist.length <= 1024) session.artist = value.artist;
  if (typeof value.artworkUrl === 'string' && value.artworkUrl.length <= 4096 && isHttpUrl(value.artworkUrl)) session.artworkUrl = value.artworkUrl;
  for (const key of ['position', 'duration', 'volume'] as const) if (typeof value[key] === 'number' && Number.isFinite(value[key]) && value[key] >= 0) session[key] = value[key];
  if (typeof value.activityAt === 'number' && Number.isSafeInteger(value.activityAt) && value.activityAt >= 0) session.activityAt = value.activityAt;
  if (typeof value.isFrontmost === 'boolean') session.isFrontmost = value.isFrontmost;
  if (typeof value.isActiveTab === 'boolean') session.isActiveTab = value.isActiveTab;
  return session;
}
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function isTargetId(value: unknown): value is string { return typeof value === 'string' && TARGET_ID.test(value); }
function isRequestId(value: unknown): value is string { return typeof value === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(value); }
function isNonNegativeInt(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0; }
function isCommandStatus(value: unknown): value is BrowserMediaCommandStatus { return value === 'confirmed' || value === 'unsupported' || value === 'target-gone' || value === 'permission-denied' || value === 'failed'; }
function isHttpUrl(value: string): boolean { try { const protocol = new URL(value).protocol; return protocol === 'http:' || protocol === 'https:'; } catch { return false; } }
function sameToken(input: string, expected: string): boolean { const left = Buffer.from(input); const right = Buffer.from(expected); return left.length === right.length && timingSafeEqual(left, right); }
