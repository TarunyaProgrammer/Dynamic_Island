// packages/core/services/habit-evaluator.ts
// Evaluates habit/duration goal state: current period completion, sessions needed,
// and whether a specific date counts as a required session or a rest day.

import { CheckIn, GoalPeriod, ScheduleConfig, Weekday } from '@shared/types';

export interface PeriodSummary {
  /** Period label for UI e.g. "This Week", "Today" */
  label: string;
  /** ISO start date YYYY-MM-DD of the current period */
  periodStart: string;
  /** ISO end date YYYY-MM-DD of the current period */
  periodEnd: string;
  /** Required sessions/value to complete the period */
  target: number;
  /** Sessions/value actually completed in this period */
  completed: number;
  /** Sessions still needed to finish this period */
  remaining: number;
  /** 0–1 fraction */
  fraction: number;
  /** Whether the period quota is fully met */
  isMet: boolean;
}

export class HabitEvaluator {
  /**
   * Evaluate the current period for a recurring goal.
   * @param today - ISO date string YYYY-MM-DD (injected for testability)
   */
  static evaluatePeriod(
    period: GoalPeriod,
    targetValue: number,
    checkIns: CheckIn[],
    schedule: ScheduleConfig = {},
    today: string = todayIso()
  ): PeriodSummary {
    const { start, end, label } = getPeriodBounds(period, today, schedule.weekStartsOn ?? 1);

    // Filter to only completed/partial check-ins within this period
    const periodCheckIns = checkIns.filter(
      (c) => c.date >= start && c.date <= end && (c.state === 'completed' || c.state === 'partial')
    );

    let completed = 0;
    if (period === 'daily') {
      // For daily duration goals, sum value (minutes)
      completed = periodCheckIns.reduce((sum, c) => sum + c.value, 0);
    } else {
      // For session-count goals, count distinct completed check-in days
      completed = periodCheckIns.length;
    }

    const remaining = Math.max(0, targetValue - completed);
    const fraction = targetValue > 0 ? Math.min(1, completed / targetValue) : 0;

    return {
      label,
      periodStart: start,
      periodEnd: end,
      target: targetValue,
      completed,
      remaining,
      fraction,
      isMet: completed >= targetValue,
    };
  }

  /**
   * Determine whether a given date is a scheduled session day, a rest day, or a free day.
   */
  static getDayType(
    date: string,
    schedule: ScheduleConfig
  ): 'scheduled' | 'rest' | 'free' {
    const d = parseDate(date);
    const weekday = d.getDay() as Weekday;

    if (schedule.restDays?.includes(weekday)) return 'rest';
    if (schedule.scheduledDays && schedule.scheduledDays.length > 0) {
      return schedule.scheduledDays.includes(weekday) ? 'scheduled' : 'rest';
    }
    return 'free'; // flexible-count goal — any day is valid
  }

  /**
   * Given a list of check-ins (most recent first) and a schedule, build a
   * 7-day dot grid for UI rendering.
   * Returns an array of 7 objects from oldest to newest.
   */
  static buildWeekGrid(
    checkIns: CheckIn[],
    schedule: ScheduleConfig = {},
    today: string = todayIso()
  ): Array<{ date: string; state: 'completed' | 'skipped' | 'missed' | 'rest' | 'future' | 'empty' }> {
    const grid = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split('T')[0];

      if (date > today) {
        grid.push({ date, state: 'future' as const });
        continue;
      }

      const dayType = HabitEvaluator.getDayType(date, schedule);
      const checkIn = checkIns.find((c) => c.date === date);

      if (checkIn) {
        grid.push({ date, state: checkIn.state === 'completed' || checkIn.state === 'partial' ? 'completed' : checkIn.state as any });
      } else if (dayType === 'rest') {
        grid.push({ date, state: 'rest' as const });
      } else if (date === today) {
        grid.push({ date, state: 'empty' as const });
      } else {
        grid.push({ date, state: 'missed' as const });
      }
    }
    return grid;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function parseDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function getPeriodBounds(
  period: GoalPeriod,
  today: string,
  weekStartsOn: Weekday = 1
): { start: string; end: string; label: string } {
  const d = parseDate(today);

  if (period === 'daily') {
    return { start: today, end: today, label: 'Today' };
  }

  if (period === 'weekly') {
    const day = d.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      label: 'This Week',
    };
  }

  if (period === 'monthly') {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
      label: 'This Month',
    };
  }

  // 'total' — no meaningful period, return full range
  return { start: '2000-01-01', end: '2099-12-31', label: 'All Time' };
}
