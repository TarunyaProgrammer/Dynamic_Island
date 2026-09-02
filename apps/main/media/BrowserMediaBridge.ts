import { randomBytes } from 'node:crypto';
import { WebSocketServer } from 'ws';

export type BrowserMediaCommand = 'playPause' | 'next' | 'previous' | 'setVolume';
export type BrowserMediaCommandStatus = 'confirmed' | 'unsupported' | 'target-gone' | 'permission-denied' | 'failed';

export interface BrowserMediaCommandResult {
  status: BrowserMediaCommandStatus;
  targetId: string;
}

/** Local-only bridge for the opt-in Chrome media companion. */
export class BrowserMediaBridge {
  private readonly token = randomBytes(32).toString('base64url');
  private readonly server = new WebSocketServer({ host: '127.0.0.1', port: 0 });
  private readonly ready: Promise<void>;
  private port?: number;

  constructor() {
    this.ready = new Promise<void>((resolve, reject) => {
      this.server.once('listening', resolve);
      this.server.once('error', reject);
    });
    this.server.on('connection', (socket, request) => {
      const remote = request.socket.remoteAddress;
      if (remote !== '127.0.0.1' && remote !== '::1' && remote !== '::ffff:127.0.0.1') {
        socket.close(1008, 'Loopback connections only');
        return;
      }
      socket.once('message', (message) => {
        const pairing = this.parse(message.toString());
        if (pairing?.type !== 'pair' || pairing.token !== this.token) {
          socket.close(1008, 'Invalid pairing token');
        }
      });
    });
  }

  async start(): Promise<void> {
    await this.ready;
    const address = this.server.address();
    if (!address || typeof address === 'string') throw new Error('Bridge did not receive a TCP port');
    this.port = address.port;
  }

  connectionDetails(): { port: number } {
    if (!this.port) throw new Error('Bridge has not started');
    return { port: this.port };
  }

  pairingToken(): string {
    return this.token;
  }

  async command(targetId: string, _command: BrowserMediaCommand): Promise<BrowserMediaCommandResult> {
    return { status: 'target-gone', targetId };
  }

  async stop(): Promise<void> {
    for (const client of this.server.clients) client.terminate();
    await new Promise<void>((resolve, reject) => this.server.close((error) => error ? reject(error) : resolve()));
  }

  private parse(input: string): { type?: string; token?: string } | undefined {
    try {
      const parsed: unknown = JSON.parse(input);
      return typeof parsed === 'object' && parsed !== null ? parsed as { type?: string; token?: string } : undefined;
    } catch {
      return undefined;
    }
  }
}
