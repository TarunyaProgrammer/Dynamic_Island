// packages/core/activities/activity-engine.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityEngine } from './activity-engine';
import { LiveActivity } from '@shared/types';

describe('ActivityEngine', () => {
  let engine: ActivityEngine;

  beforeEach(() => {
    engine = new ActivityEngine();
  });

  it('should push and prioritize activities by weight', () => {
    const lowActivity: LiveActivity = {
      id: 'low-1',
      type: 'system',
      priority: 'low',
      title: 'Battery 85%',
      timestamp: '2026-09-01T12:00:00.000Z',
    };

    const criticalActivity: LiveActivity = {
      id: 'crit-1',
      type: 'timer',
      priority: 'critical',
      title: 'Sprint Finished',
      timestamp: '2026-09-01T12:00:01.000Z',
    };

    const normalActivity: LiveActivity = {
      id: 'norm-1',
      type: 'goal',
      priority: 'normal',
      title: 'GSoC Progress',
      timestamp: '2026-09-01T12:00:02.000Z',
    };

    engine.push(lowActivity);
    engine.push(criticalActivity);
    engine.push(normalActivity);

    const stack = engine.getStack();
    expect(stack.length).toBe(3);
    expect(stack[0].id).toBe('crit-1');
    expect(stack[1].id).toBe('norm-1');
    expect(stack[2].id).toBe('low-1');
    expect(engine.getTopActivity()?.id).toBe('crit-1');
  });

  it('should dismiss activities correctly', () => {
    const act: LiveActivity = {
      id: 'test-1',
      type: 'media',
      priority: 'normal',
      title: 'Song Title',
      timestamp: new Date().toISOString(),
    };

    engine.push(act);
    expect(engine.getStack().length).toBe(1);

    const dismissed = engine.dismiss('test-1');
    expect(dismissed).toBe(true);
    expect(engine.getStack().length).toBe(0);
  });
});
