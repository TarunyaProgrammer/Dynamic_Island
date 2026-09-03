import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCompanionController, CompanionSnapshot } from './companion-controller';

describe('companion controller', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('settles a greeting back to idle after its transient duration', () => {
    vi.useFakeTimers();
    const snapshots: CompanionSnapshot[] = [];
    const controller = createCompanionController((snapshot) => snapshots.push(snapshot));

    controller.transition('greeting');
    expect(controller.getSnapshot()).toEqual({ state: 'greeting' });
    vi.advanceTimersByTime(699);
    expect(controller.getSnapshot().state).toBe('greeting');
    vi.advanceTimersByTime(1);
    expect(controller.getSnapshot()).toEqual({ state: 'idle' });
    expect(snapshots.map((snapshot) => snapshot.state)).toEqual(['greeting', 'idle']);

    controller.dispose();
  });

  it('replaces the previous transient timeout instead of queueing it', () => {
    vi.useFakeTimers();
    const controller = createCompanionController(() => undefined);

    controller.transition('thinking');
    vi.advanceTimersByTime(500);
    controller.transition('celebrating', 'Done');
    vi.advanceTimersByTime(700);
    expect(controller.getSnapshot()).toEqual({ state: 'celebrating', message: 'Done' });
    vi.advanceTimersByTime(150);
    expect(controller.getSnapshot()).toEqual({ state: 'idle' });

    controller.dispose();
  });

  it('clears timers and ignores future transitions after disposal', () => {
    vi.useFakeTimers();
    const onStateChange = vi.fn();
    const controller = createCompanionController(onStateChange);

    controller.transition('celebrating');
    controller.dispose();
    vi.runAllTimers();
    controller.transition('error', 'Database unavailable');

    expect(onStateChange).toHaveBeenCalledTimes(1);
    expect(controller.getSnapshot()).toEqual({ state: 'celebrating' });
  });
});
