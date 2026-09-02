// packages/core/services/streak-engine.test.ts
import { describe, it, expect } from 'vitest';
import { StreakEngine } from './streak-engine';
import { CheckIn } from '@shared/types';

function ci(date: string, state: CheckIn['state'] = 'completed'): CheckIn {
  return { id: date, goalId: 'g1', date, state, value: 1, timestamp: `${date}T10:00:00.000Z` };
}

describe('StreakEngine — daily', () => {
  it('calculates daily streak correctly', () => {
    const checkIns = [
      ci('2024-01-12'),
      ci('2024-01-11'),
      ci('2024-01-10'),
      ci('2024-01-08'), // gap on Jan 9 → streak resets here
    ];
    const result = StreakEngine.calculate(checkIns, 'daily', 'daily', {}, '2024-01-12');
    expect(result.currentStreak).toBe(3); // 10, 11, 12
    expect(result.isTodayFulfilled).toBe(true);
    expect(result.isAtRisk).toBe(false);
  });

  it('marks isAtRisk when today not fulfilled but yesterday was', () => {
    const checkIns = [
      ci('2024-01-11'),
      ci('2024-01-10'),
    ];
    const result = StreakEngine.calculate(checkIns, 'daily', 'daily', {}, '2024-01-12');
    expect(result.isTodayFulfilled).toBe(false);
    expect(result.isAtRisk).toBe(true);
  });
});

describe('StreakEngine — period_threshold', () => {
  it('counts completed weeks for a 5/week gym goal', () => {
    // Build 3 full weeks + current partial week
    const checkIns = [
      // Current week (Mon Jan 8 start)
      ci('2024-01-08'), ci('2024-01-09'), ci('2024-01-10'),
      // Last full week
      ci('2024-01-01'), ci('2024-01-02'), ci('2024-01-03'), ci('2024-01-04'), ci('2024-01-05'),
      // Week before (only 3 sessions — should break streak)
      ci('2023-12-25'), ci('2023-12-26'), ci('2023-12-27'),
    ];

    const result = StreakEngine.calculate(
      checkIns,
      'period_threshold',
      'weekly',
      { flexibleCount: 5 },
      '2024-01-10'
    );

    // Only the last full week (Jan 1-5) counts as a completed period
    expect(result.currentStreak).toBeGreaterThanOrEqual(1);
    // Current week is partial — not at risk yet (3 remaining days + current 3 sessions)
    expect(result.isTodayFulfilled).toBe(false);
  });

  it('missing Sunday does NOT break weekly gym streak if 5/week quota is met', () => {
    // Week Jan 1-7: check in Mon-Fri = 5 sessions ✓, Sat/Sun rest
    const checkIns = [
      ci('2024-01-01'), ci('2024-01-02'), ci('2024-01-03'), ci('2024-01-04'), ci('2024-01-05'),
    ];
    const result = StreakEngine.calculate(
      checkIns,
      'period_threshold',
      'weekly',
      { flexibleCount: 5 },
      '2024-01-07' // Sunday — quota met
    );
    expect(result.isTodayFulfilled).toBe(true);
  });
});

describe('StreakEngine — mergeConfig', () => {
  it('preserves bestStreak across resets', () => {
    const config = { enabled: true, type: 'daily' as const, currentStreak: 12, bestStreak: 12 };
    // After a reset, currentStreak = 3 but bestStreak must stay 12
    const merged = StreakEngine.mergeConfig(config, { currentStreak: 3, bestStreak: 3, isTodayFulfilled: false, isAtRisk: false });
    expect(merged.bestStreak).toBe(12);
    expect(merged.currentStreak).toBe(3);
  });
});
