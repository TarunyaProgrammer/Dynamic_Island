// packages/core/services/habit-evaluator.test.ts
import { describe, it, expect } from 'vitest';
import { HabitEvaluator } from './habit-evaluator';
import { CheckIn } from '@shared/types';

function makeCheckIn(date: string, state: CheckIn['state'] = 'completed', value = 1): CheckIn {
  return { id: date, goalId: 'g1', date, state, value, timestamp: `${date}T10:00:00.000Z` };
}

describe('HabitEvaluator', () => {
  it('counts completed sessions in the current week', () => {
    // Assume today is Wed 2024-01-10 (Wednesday)
    const today = '2024-01-10';
    const checkIns = [
      makeCheckIn('2024-01-08'), // Mon ✓
      makeCheckIn('2024-01-09'), // Tue ✓
      makeCheckIn('2024-01-10'), // Wed ✓
    ];
    const summary = HabitEvaluator.evaluatePeriod('weekly', 5, checkIns, {}, today);
    expect(summary.completed).toBe(3);
    expect(summary.remaining).toBe(2);
    expect(summary.isMet).toBe(false);
  });

  it('marks period as met when completed >= target', () => {
    const today = '2024-01-14'; // Sunday
    const checkIns = [
      makeCheckIn('2024-01-08'),
      makeCheckIn('2024-01-09'),
      makeCheckIn('2024-01-10'),
      makeCheckIn('2024-01-11'),
      makeCheckIn('2024-01-12'),
    ];
    const summary = HabitEvaluator.evaluatePeriod('weekly', 5, checkIns, {}, today);
    expect(summary.isMet).toBe(true);
    expect(summary.fraction).toBe(1);
  });

  it('identifies rest day correctly', () => {
    // Saturday (weekday=6) is a rest day
    const dayType = HabitEvaluator.getDayType('2024-01-13', { restDays: [6] });
    expect(dayType).toBe('rest');
  });

  it('identifies scheduled day correctly', () => {
    // Monday (weekday=1) is scheduled
    const dayType = HabitEvaluator.getDayType('2024-01-08', { scheduledDays: [1, 3, 5] });
    expect(dayType).toBe('scheduled');

    // Tuesday (weekday=2) is NOT scheduled → treated as rest
    const dayType2 = HabitEvaluator.getDayType('2024-01-09', { scheduledDays: [1, 3, 5] });
    expect(dayType2).toBe('rest');
  });

  it('builds a 7-day week grid with correct states', () => {
    const today = '2024-01-12'; // Friday
    const checkIns = [
      makeCheckIn('2024-01-08'), // Mon ✓
      { ...makeCheckIn('2024-01-10'), state: 'skipped' as const }, // Wed skipped
    ];
    const grid = HabitEvaluator.buildWeekGrid(checkIns, {}, today);
    expect(grid).toHaveLength(7);
    const mon = grid.find((d) => d.date === '2024-01-08');
    const wed = grid.find((d) => d.date === '2024-01-10');
    const tue = grid.find((d) => d.date === '2024-01-09');
    expect(mon?.state).toBe('completed');
    expect(wed?.state).toBe('skipped');
    expect(tue?.state).toBe('missed'); // no check-in, past today → missed
  });
});
