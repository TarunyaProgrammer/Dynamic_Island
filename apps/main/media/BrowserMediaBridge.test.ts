import { describe, expect, it } from 'vitest';
import { BrowserMediaSessionRegistry, parseBrowserMediaBridgeMessage } from './BrowserMediaBridge';

describe('BrowserMediaBridge', () => {
  it('accepts only exact, bounded browser session identities', () => {
    expect(parseBrowserMediaBridgeMessage(JSON.stringify({
      type: 'media-session',
      session: {
        targetId: 'chrome:3:12:0', windowId: 3, tabId: 12, frameId: 0,
        origin: 'https://open.spotify.com', title: 'A track', isPlaying: true,
        capabilities: { playPause: true, next: false },
      },
    }))).toMatchObject({ type: 'media-session', session: { targetId: 'chrome:3:12:0' } });
    expect(parseBrowserMediaBridgeMessage(JSON.stringify({
      type: 'media-session',
      session: { targetId: 'chrome:3:12:0', windowId: 3, tabId: 99, frameId: 0, origin: 'https://x.test', title: 'x', isPlaying: false, capabilities: {} },
    }))).toBeUndefined();
  });

  it('rejects malformed, unknown, and oversized protocol input', () => {
    expect(parseBrowserMediaBridgeMessage('{')).toBeUndefined();
    expect(parseBrowserMediaBridgeMessage(JSON.stringify({ type: 'command-result', requestId: 'short', targetId: 'chrome:1:2:0', status: 'confirmed' }))).toBeUndefined();
    expect(parseBrowserMediaBridgeMessage(JSON.stringify({ type: 'pair', token: 'x'.repeat(257) }))).toBeUndefined();
  });

  it('keeps a reassigned target owned by the new client when the old client disconnects', () => {
    const registry = new BrowserMediaSessionRegistry<object>();
    const oldClient = {};
    const newClient = {};
    expect(registry.assign('chrome:1:2:0', oldClient)).toBeUndefined();
    expect(registry.assign('chrome:1:2:0', newClient)).toBe(oldClient);
    expect(registry.removeIfOwned('chrome:1:2:0', oldClient)).toBe(false);
    expect(registry.ownerOf('chrome:1:2:0')).toBe(newClient);
    expect(registry.removeIfOwned('chrome:1:2:0', newClient)).toBe(true);
  });
});
