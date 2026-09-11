import { describe, expect, it } from 'vitest';
import type { ProgressEvent } from '@shared/types';
import { hasProgressToday, recentProgressEvents } from './today-activity';

const event = (id: string, timestamp: string): ProgressEvent => ({
  id,
  goalId: 'goal-1',
  previousValue: 0,
  newValue: 1,
  delta: 1,
  resultingValue: 1,
  timestamp,
});

describe('recentProgressEvents', () => {
  it('shows the newest activity first without mutating the shared history', () => {
    const history = [
      event('oldest', '2026-09-09T08:00:00.000Z'),
      event('newest', '2026-09-11T08:00:00.000Z'),
      event('middle', '2026-09-10T08:00:00.000Z'),
    ];

    expect(recentProgressEvents(history, 2).map(({ id }) => id)).toEqual(['newest', 'middle']);
    expect(history.map(({ id }) => id)).toEqual(['oldest', 'newest', 'middle']);
  });

  it('recognizes local-day history without treating earlier activity as today', () => {
    const today = new Date(2026, 8, 11, 12);
    expect(hasProgressToday([event('yesterday', '2026-09-10T12:00:00.000Z')], today)).toBe(false);
    expect(hasProgressToday([event('today', '2026-09-11T12:00:00.000Z')], today)).toBe(true);
  });
});
