import { commandStatus } from './protocol.js';

const sessions = new Map();
let socket;
let settings;
let reconnectTimer;
function setConnectionState(connectionState) {
  chrome.storage.local.set({ connectionState }).catch(() => undefined);
  if (chrome.action?.setBadgeText) {
    if (connectionState === 'connected') {
      chrome.action.setBadgeText({ text: 'ON' }).catch(() => undefined);
      chrome.action.setBadgeBackgroundColor({ color: '#10B981' }).catch(() => undefined);
    } else if (connectionState === 'connecting') {
      chrome.action.setBadgeText({ text: '…' }).catch(() => undefined);
      chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' }).catch(() => undefined);
    } else if (connectionState === 'rejected') {
      chrome.action.setBadgeText({ text: '!' }).catch(() => undefined);
      chrome.action.setBadgeBackgroundColor({ color: '#EF4444' }).catch(() => undefined);
    } else {
      chrome.action.setBadgeText({ text: '' }).catch(() => undefined);
    }
  }
}

async function getSettings() {
  if (!settings) settings = (await chrome.storage.local.get(['port', 'token']));
  return settings;
}
function targetId(sender) { return `chrome:${sender.tab.windowId}:${sender.tab.id}:${sender.frameId}`; }
function send(message) { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message)); }
function sendOn(candidate, message) { if (socket === candidate && candidate.readyState === WebSocket.OPEN) candidate.send(JSON.stringify(message)); }
function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => { reconnectTimer = undefined; connect(); }, 2_000);
}
function rehydrateMedia() {
  // Existing content scripts also heartbeat, covering subframes and worker restarts.
  chrome.tabs.query({}).then((tabs) => tabs.forEach((tab) => {
    if (tab.id) chrome.tabs.sendMessage(tab.id, { type: 'beacon-media-snapshot-query' }).catch(() => undefined);
  })).catch(() => undefined);
}
async function connect() {
  const { port, token } = await getSettings();
  if (!Number.isInteger(port) || typeof token !== 'string' || !token) return;
  setConnectionState('connecting');
  if (socket) { socket.onclose = null; socket.close(); }
  const candidate = new WebSocket(`ws://127.0.0.1:${port}`);
  socket = candidate;
  candidate.onopen = () => { if (socket === candidate) candidate.send(JSON.stringify({ type: 'pair', token })); };
  candidate.onmessage = async ({ data }) => {
    if (socket !== candidate) return;
    let message; try { message = JSON.parse(data); } catch { return; }
    if (message.type === 'paired') { setConnectionState('connected'); for (const session of sessions.values()) sendOn(candidate, { type: 'media-session', session }); rehydrateMedia(); return; }
    if (message.type !== 'command' || !sessions.has(message.targetId)) return;
    const session = sessions.get(message.targetId);
    try {
      const result = await chrome.tabs.sendMessage(session.tabId, { type: 'beacon-media-command', command: message.command, value: message.value }, { frameId: session.frameId });
      sendOn(candidate, { type: 'command-result', requestId: message.requestId, targetId: message.targetId, status: commandStatus(result?.status) });
    } catch { sendOn(candidate, { type: 'command-result', requestId: message.requestId, targetId: message.targetId, status: 'target-gone' }); }
  };
  candidate.onerror = () => { if (socket === candidate) candidate.close(); };
  candidate.onclose = (event) => { if (socket !== candidate) return; socket = undefined; setConnectionState(event.code === 1008 ? 'rejected' : 'disconnected'); scheduleReconnect(); };
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message.type === 'beacon-pair') {
    if (!Number.isInteger(message.port) || message.port < 1 || message.port > 65535 || typeof message.token !== 'string' || message.token.length < 32) { respond({ ok: false }); return; }
    settings = { port: message.port, token: message.token }; chrome.storage.local.set(settings).then(connect); respond({ ok: true }); return;
  }
  if (message.type === 'beacon-observe' && sender.tab && Number.isInteger(sender.frameId)) {
    // The top frame owns the player for the supported hosts. Allowing every
    // ad/embed frame creates transient, competing sessions and reconnect churn.
    if (sender.frameId !== 0) return;
    const id = targetId(sender);
    const snapshot = message.snapshot;
    if (!snapshot || typeof snapshot !== 'object') return;
    let origin; try { origin = sender.url ? new URL(sender.url).origin : undefined; } catch { origin = undefined; }
    // Opaque subframes are not controllable targets. Dropping them prevents a
    // transient frame from poisoning the paired WebSocket connection.
    if (!origin || !/^https?:$/.test(new URL(origin).protocol)) return;
    const session = { targetId: id, windowId: sender.tab.windowId, tabId: sender.tab.id, frameId: sender.frameId, origin, title: String(snapshot.title || sender.tab.title || '').slice(0, 1024), artist: typeof snapshot.artist === 'string' ? snapshot.artist.slice(0, 1024) : undefined, artworkUrl: typeof snapshot.artworkUrl === 'string' ? snapshot.artworkUrl.slice(0, 4096) : undefined, isPlaying: snapshot.isPlaying === true, position: Number.isFinite(snapshot.position) ? snapshot.position : undefined, duration: Number.isFinite(snapshot.duration) ? snapshot.duration : undefined, volume: Number.isFinite(snapshot.volume) ? snapshot.volume : undefined, activityAt: Number.isSafeInteger(snapshot.activityAt) ? snapshot.activityAt : undefined, isActiveTab: sender.tab.active === true, isFrontmost: sender.tab.active === true && sender.tab.windowId === chrome.windows.WINDOW_ID_CURRENT, capabilities: { playPause: snapshot.hasMedia === true, next: false, previous: false, setVolume: snapshot.hasMedia === true } };
    sessions.set(id, session); send({ type: 'media-session', session });
  }
  if (message.type === 'beacon-session-removed' && sender.tab && Number.isInteger(sender.frameId)) { const id = targetId(sender); sessions.delete(id); send({ type: 'session-removed', targetId: id }); }
  if (message.type === 'beacon-enable-active-tab') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => tab?.id && chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] })).then(() => respond({ ok: true })).catch(() => respond({ ok: false }));
    return true;
  }
  if (message.type === 'beacon-get-status') {
    getSettings().then(async (saved) => {
      const { connectionState } = await chrome.storage.local.get(['connectionState']);
      const activeSession = [...sessions.values()].find((s) => s.isPlaying) || [...sessions.values()][0];
      respond({
        connectionState: connectionState || 'disconnected',
        port: saved?.port,
        token: saved?.token,
        activeSession,
        sessionCount: sessions.size,
      });
    }).catch(() => respond({ connectionState: 'disconnected' }));
    return true;
  }
  if (message.type === 'beacon-unpair') {
    settings = undefined;
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = undefined; }
    if (socket) { socket.onclose = null; socket.close(); socket = undefined; }
    chrome.storage.local.remove(['port', 'token', 'connectionState']).then(() => {
      setConnectionState('disconnected');
      respond({ ok: true });
    }).catch(() => respond({ ok: false }));
    return true;
  }
  if (message.type === 'beacon-popup-command') {
    const session = [...sessions.values()].find((s) => s.isPlaying) || [...sessions.values()][0];
    if (!session) { respond({ ok: false }); return true; }
    chrome.tabs.sendMessage(session.tabId, { type: 'beacon-media-command', command: message.command, value: message.value }, { frameId: session.frameId })
      .then((res) => respond({ ok: true, result: res }))
      .catch(() => respond({ ok: false }));
    return true;
  }
});
chrome.tabs.onRemoved.addListener((tabId) => { for (const [id, session] of sessions) if (session.tabId === tabId) { sessions.delete(id); send({ type: 'session-removed', targetId: id }); } });
chrome.runtime.onStartup.addListener(() => { rehydrateMedia(); connect(); });
connect();
