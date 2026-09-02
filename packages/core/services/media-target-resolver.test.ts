import { describe, expect, it } from 'vitest';
import { MediaTargetResolver } from './media-target-resolver';

describe('MediaTargetResolver', () => {
  it('keeps the confirmed YouTube tab when two Chrome tabs are playing', () => {
    const resolver = new MediaTargetResolver();
    resolver.confirm({ id: 'chrome:1:9:0', kind: 'browser', isPlaying: true, activityAt: 20 });

    expect(resolver.resolve([
      { id: 'chrome:1:9:0', kind: 'browser', isPlaying: true, activityAt: 20 },
      { id: 'chrome:2:3:0', kind: 'browser', isPlaying: true, activityAt: 21 },
    ])?.id).toBe('chrome:1:9:0');
  });

  it('selects a playing browser session over paused native Spotify', () => {
    const resolver = new MediaTargetResolver();

    expect(resolver.resolve([
      { id: 'spotify', kind: 'native', isPlaying: false, activityAt: 30 },
      { id: 'chrome:4:7:0', kind: 'browser', isPlaying: true, activityAt: 10 },
    ])?.id).toBe('chrome:4:7:0');
  });

  it('prefers a frontmost playing session when no target has been confirmed', () => {
    const resolver = new MediaTargetResolver();

    expect(resolver.resolve([
      { id: 'chrome:1:1:0', kind: 'browser', isPlaying: true, activityAt: 100 },
      { id: 'chrome:2:2:0', kind: 'browser', isPlaying: true, activityAt: 1, isFrontmost: true },
    ])?.id).toBe('chrome:2:2:0');
  });

  it('does not retain a confirmed target once it disappears', () => {
    const resolver = new MediaTargetResolver();
    resolver.confirm({ id: 'chrome:1:9:0', kind: 'browser', isPlaying: true, activityAt: 20 });

    expect(resolver.resolve([
      { id: 'chrome:2:3:0', kind: 'browser', isPlaying: true, activityAt: 21 },
    ])?.id).toBe('chrome:2:3:0');
  });

  it('uses a paused candidate only when no candidate is playing', () => {
    const resolver = new MediaTargetResolver();

    expect(resolver.resolve([
      { id: 'spotify', kind: 'native', isPlaying: false, activityAt: 30 },
      { id: 'chrome:4:7:0', kind: 'browser', isPlaying: false, activityAt: 10, isActiveTab: true },
    ])?.id).toBe('chrome:4:7:0');
  });
});
