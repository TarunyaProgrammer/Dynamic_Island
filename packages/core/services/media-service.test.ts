import { describe, expect, it, vi } from 'vitest';
import { MediaService, parseSystemOutputVolume, withSystemOutputVolume, type BrowserMediaBridgePort, type BrowserMediaSessionSnapshot } from './media-service';

class BridgeStub implements BrowserMediaBridgePort {
  private listener?: (sessions: readonly BrowserMediaSessionSnapshot[]) => void;
  nextResult: Awaited<ReturnType<BrowserMediaBridgePort['command']>> = { status: 'confirmed', targetId: 'chrome:1:2:0' };
  command = vi.fn(async (): Promise<Awaited<ReturnType<BrowserMediaBridgePort['command']>>> => this.nextResult);

  subscribeSessions(listener: (sessions: readonly BrowserMediaSessionSnapshot[]) => void): () => void {
    this.listener = listener;
    listener([]);
    return () => { this.listener = undefined; };
  }

  publish(...sessions: BrowserMediaSessionSnapshot[]): void {
    this.listener?.(sessions);
  }
}

const playingSession: BrowserMediaSessionSnapshot = {
  targetId: 'chrome:1:2:0', origin: 'https://music.example.test', title: 'Deep Work Mix', artist: 'Example Radio',
  isPlaying: true, position: 42.4, duration: 180, volume: 0.35,
  capabilities: { playPause: true, setVolume: true },
};

describe('MediaService browser companion integration', () => {
  it('keeps macOS Audio state while reflecting a system output-volume change', () => {
    expect(withSystemOutputVolume({
      title: 'No Media Playing', artist: 'macOS Audio', isPlaying: false,
      progressSeconds: 0, durationSeconds: 0, volume: 50,
    }, 72)).toMatchObject({ title: 'No Media Playing', artist: 'macOS Audio', volume: 72 });
  });

  it('accepts only valid macOS output-volume readings', () => {
    expect(parseSystemOutputVolume('73\n')).toBe(73);
    expect(parseSystemOutputVolume('101')).toBeUndefined();
    expect(parseSystemOutputVolume('not a number')).toBeUndefined();
  });

  it('maps a playing browser session into real media state', () => {
    const bridge = new BridgeStub();
    const service = new MediaService(undefined, bridge);

    bridge.publish(playingSession);

    expect(service.activeSource).toBe('Browser');
    expect(service.getState()).toMatchObject({
      title: 'Deep Work Mix', artist: 'Example Radio', isPlaying: true,
      progressSeconds: 42, durationSeconds: 180, volume: 50,
    });
    service.dispose();
  });

  it('carries browser artwork into the displayed media state', () => {
    const bridge = new BridgeStub();
    const service = new MediaService(undefined, bridge);

    bridge.publish({ ...playingSession, artworkUrl: 'https://images.example.test/cover.jpg' });

    expect(service.getState().artworkUrl).toBe('https://images.example.test/cover.jpg');
    service.dispose();
  });

  it('does not optimistically alter browser playback state when a command is rejected', async () => {
    const bridge = new BridgeStub();
    bridge.nextResult = { status: 'failed', targetId: playingSession.targetId };
    const service = new MediaService(undefined, bridge);
    bridge.publish(playingSession);

    await service.playPause();

    expect(bridge.command).toHaveBeenCalledWith(playingSession.targetId, 'playPause');
    expect(service.getState().isPlaying).toBe(true);
    service.dispose();
  });

  it('keeps a confirmed browser tab through heartbeat deliveries, then follows explicit active-tab intent', () => {
    const bridge = new BridgeStub();
    const service = new MediaService(undefined, bridge);
    const first = { ...playingSession, title: 'First tab', activityAt: 100, isActiveTab: false };
    const second = { ...playingSession, targetId: 'chrome:1:3:0', title: 'Second tab', activityAt: 200, isActiveTab: false };

    bridge.publish(first);
    bridge.publish(first, second);
    expect(service.getState().title).toBe('First tab');

    bridge.publish(first, { ...second, isActiveTab: true });
    expect(service.getState().title).toBe('Second tab');
    service.dispose();
  });
});
