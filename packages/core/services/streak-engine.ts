// packages/core/services/streak-engine.ts
// Computes streaks for all goal paradigms.
// Three modes:
//   daily           — must check in every calendar day
//   scheduled       — must check in on all scheduledDays
//   period_threshold — must hit flexibleCount within each period (week/month)

import { CheckIn, GoalPeriod, ScheduleConfig, StreakConfig, StreakType, Weekday } from '@shared/types';
import { todayIso } from './habit-evaluator';

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string;
  /** Whether today's contribution keeps the streak alive */
  isTodayFulfilled: boolean;
  /** True if the streak could break today and hasn't been completed yet */
  isAtRisk: boolean;
}

export class StreakEngine {
  /**
   * Recalculate the full streak from check-in history.
   * @param checkIns - sorted most-recent first
   * @param streakType - the mode to use for streak calculation
   * @param period - needed for period_threshold mode
   * @param schedule - schedule config (scheduled days, rest days, week start)
   * @param today - YYYY-MM-DD for testability
   */
  static calculate(
    checkIns: CheckIn[],
    streakType: StreakType,
    period: GoalPeriod = 'weekly',
    schedule: ScheduleConfig = {},
    today: string = todayIso()
  ): StreakResult {
    switch (streakType) {
      case 'daily':
        return StreakEngine.calculateDaily(checkIns, today);
      case 'scheduled':
        return StreakEngine.calculateScheduled(checkIns, schedule, today);
      case 'period_threshold':
        return StreakEngine.calculatePeriodThreshold(checkIns, period, schedule, today);
    }
  }

  // ─── Daily Streak ─────────────────────────────────────────────────────────

  private static calculateDaily(checkIns: CheckIn[], today: string): StreakResult {
    const completedDates = new Set(
      checkIns.filter((c) => c.state === 'completed' || c.state === 'partial').map((c) => c.date)
    );

    let current = 0;
    let best = 0;
    let streak = 0;
    let lastCompletedDate: string | undefined;

    // Walk backwards from today
    let cursor = today;
    while (true) {
      if (completedDates.has(cursor)) {
        streak++;
        if (!lastCompletedDate) lastCompletedDate = cursor;
        best = Math.max(best, streak);
      } else {
        // Allow today to be incomplete without breaking streak
        if (cursor === today) {
          cursor = shiftDate(cursor, -1);
          continue;
        }
        break;
      }
      cursor = shiftDate(cursor, -1);
      if (cursor < '2020-01-01') break;
    }
    current = streak;

    const isTodayFulfilled = completedDates.has(today);
    const yesterdayFulfilled = completedDates.has(shiftDate(today, -1));
    const isAtRisk = !isTodayFulfilled && (current > 0 || yesterdayFulfilled);

    return { currentStreak: current, bestStreak: Math.max(current, best), lastCompletedDate, isTodayFulfilled, isAtRisk };
  }

  // ─── Scheduled Day Streak ─────────────────────────────────────────────────

  private static calculateScheduled(
    checkIns: CheckIn[],
    schedule: ScheduleConfig,
    today: string
  ): StreakResult {
    const scheduledDays: Weekday[] = schedule.scheduledDays ?? [1, 2, 3, 4, 5];
    const completedDates = new Set(
      checkIns.filter((c) => c.state === 'completed' || c.state === 'partial').map((c) => c.date)
    );

    let current = 0;
    let best = 0;
    let lastCompletedDate: string | undefined;

    // Walk backwards through scheduled days
    let cursor = shiftDate(today, -1); // start from yesterday
    let unbroken = true;

    while (unbroken && cursor > '2020-01-01') {
      const weekday = new Date(`${cursor}T00:00:00`).getDay() as Weekday;
      if (scheduledDays.includes(weekday)) {
        if (completedDates.has(cursor)) {
          current++;
          if (!lastCompletedDate) lastCompletedDate = cursor;
          best = Math.max(best, current);
        } else {
          unbroken = false;
        }
      }
      cursor = shiftDate(cursor, -1);
    }

    const todayWeekday = new Date(`${today}T00:00:00`).getDay() as Weekday;
    const isTodayFulfilled = !scheduledDays.includes(todayWeekday) || completedDates.has(today);
    const isAtRisk = scheduledDays.includes(todayWeekday) && !completedDates.has(today) && current > 0;

    return { currentStreak: current, bestStreak: Math.max(current, best), lastCompletedDate, isTodayFulfilled, isAtRisk };
  }

  // ─── Period Threshold Streak ──────────────────────────────────────────────

  private static calculatePeriodThreshold(
    checkIns: CheckIn[],
    period: GoalPeriod,
    schedule: ScheduleConfig,
    today: string
  ): StreakResult {
    const weekStartsOn = schedule.weekStartsOn ?? 1;
    const target = schedule.flexibleCount ?? 1;

    const completedDates = new Set(
      checkIns.filter((c) => c.state === 'completed' || c.state === 'partial').map((c) => c.date)
    );

    // Build ordered list of past period windows
    const windows = buildPeriodWindows(period, today, weekStartsOn, 52);

    let current = 0;
    let best = 0;
    let lastCompletedDate: string | undefined;
    let hitBreak = false;

    for (const { start, end, isCurrent } of windows) {
      const count = [...completedDates].filter((d) => d >= start && d <= end).length;
      const met = count >= target;

      if (met) {
        if (!hitBreak) current++;
        best = Math.max(best, current);
        if (!lastCompletedDate) {
          // Find the latest completed date in this window
          const inWindow = checkIns.filter((c) => c.date >= start && c.date <= end && completedDates.has(c.date));
          if (inWindow.length) lastCompletedDate = inWindow[0].date;
        }
      } else if (!isCurrent) {
        hitBreak = true;
      }
    }

    const currentWindow = windows[0];
    const currentCount = [...completedDates].filter(
      (d) => d >= currentWindow.start && d <= currentWindow.end
    ).length;
    const isTodayFulfilled = currentCount >= target;
    const isAtRisk = !isTodayFulfilled && current > 0;

    return {
      currentStreak: current,
      bestStreak: Math.max(current, best),
      lastCompletedDate,
      isTodayFulfilled,
      isAtRisk,
    };
  }

  /**
   * Merge a persisted StreakConfig with a fresh StreakResult (keeps bestStreak historical max).
   */
  static mergeConfig(existing: StreakConfig, result: StreakResult): StreakConfig {
    return {
      ...existing,
      currentStreak: result.currentStreak,
      bestStreak: Math.max(existing.bestStreak, result.bestStreak),
      lastCompletedDate: result.lastCompletedDate,
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function buildPeriodWindows(
  period: GoalPeriod,
  today: string,
  weekStartsOn: Weekday,
  maxWindows: number
): Array<{ start: string; end: string; isCurrent: boolean }> {
  const windows = [];
  let cursor = today;

  for (let i = 0; i < maxWindows; i++) {
    const { start, end } = getPeriodForDate(period, cursor, weekStartsOn);
    windows.push({ start, end, isCurrent: i === 0 });
    cursor = shiftDate(start, -1); // jump to day before this period
  }

  return windows;
}

function getPeriodForDate(period: GoalPeriod, date: string, weekStartsOn: Weekday): { start: string; end: string } {
  const d = new Date(`${date}T00:00:00`);

  if (period === 'weekly') {
    const day = d.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }

  if (period === 'monthly') {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }

  // daily
  return { start: date, end: date };
}
