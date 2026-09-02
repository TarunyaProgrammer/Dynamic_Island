// packages/core/services/health-calculator.ts
// Computes real-time GoalHealth for any goal paradigm.

import { CheckIn, Goal, GoalHealth, GoalHealthStatus, GoalParadigm } from '@shared/types';
import { HabitEvaluator, todayIso } from './habit-evaluator';

export class HealthCalculator {
  /**
   * Compute health for any goal paradigm.
   * @param goal - the goal to evaluate
   * @param checkIns - recent check-in history
   * @param today - YYYY-MM-DD (injected for testability)
   */
  static compute(goal: Goal, checkIns: CheckIn[] = [], today: string = todayIso()): GoalHealth {
    if (goal.status === 'paused') {
      return { status: 'paused', actualProgress: goal.targetValue > 0 ? goal.currentValue / goal.targetValue : 0 };
    }
    if (goal.status === 'completed') {
      return { status: 'completed', actualProgress: 1 };
    }

    switch (goal.paradigm as GoalParadigm) {
      case 'deadline':
        return HealthCalculator.computeDeadlineHealth(goal, today);
      case 'habit':
      case 'duration':
        return HealthCalculator.computeHabitHealth(goal, checkIns, today);
      case 'milestone':
        return HealthCalculator.computeMilestoneHealth(goal);
      case 'avoidance':
        return HealthCalculator.computeAvoidanceHealth(goal, checkIns, today);
      case 'accumulative':
      default:
        return HealthCalculator.computeAccumulativeHealth(goal, today);
    }
  }

  // ─── Deadline Velocity ───────────────────────────────────────────────────

  private static computeDeadlineHealth(goal: Goal, today: string): GoalHealth {
    if (!goal.deadline || goal.targetValue === 0) {
      return { status: 'on_track', actualProgress: 0 };
    }

    const start = new Date(`${goal.startDate}T00:00:00`);
    const end = new Date(`${goal.deadline}T00:00:00`);
    const now = new Date(`${today}T00:00:00`);

    const totalDays = Math.max(1, (end.getTime() - start.getTime()) / 86400000);
    const elapsedDays = Math.max(0, (now.getTime() - start.getTime()) / 86400000);
    const daysRemaining = Math.max(0, (end.getTime() - now.getTime()) / 86400000);

    const actualProgress = Math.min(1, goal.currentValue / goal.targetValue);
    const expectedProgress = Math.min(1, elapsedDays / totalDays);
    const velocityRatio = expectedProgress > 0 ? actualProgress / expectedProgress : 1;

    let status: GoalHealthStatus;
    if (velocityRatio >= 1.05) status = 'ahead';
    else if (velocityRatio >= 0.9) status = 'on_track';
    else if (velocityRatio >= 0.75) status = 'at_risk';
    else status = 'behind';

    return { status, actualProgress, expectedProgress, velocityRatio, daysRemaining };
  }

  // ─── Habit / Duration ────────────────────────────────────────────────────

  private static computeHabitHealth(goal: Goal, checkIns: CheckIn[], today: string): GoalHealth {
    const summary = HabitEvaluator.evaluatePeriod(
      goal.period,
      goal.targetValue,
      checkIns,
      goal.scheduleConfig ?? {},
      today
    );

    const daysInPeriod = daysUntilPeriodEnd(goal.period, today, goal.scheduleConfig?.weekStartsOn ?? 1);
    const fraction = summary.fraction;

    // If remaining sessions > days left in period we're at risk
    const isAtRisk = summary.remaining > daysInPeriod;

    let status: GoalHealthStatus;
    if (summary.isMet) status = 'on_track';
    else if (isAtRisk && summary.remaining >= 2) status = 'behind';
    else if (isAtRisk) status = 'at_risk';
    else status = 'on_track';

    return {
      status,
      actualProgress: fraction,
      sessionsRemainingThisPeriod: summary.remaining,
    };
  }

  // ─── Milestone / Project ─────────────────────────────────────────────────

  private static computeMilestoneHealth(goal: Goal): GoalHealth {
    const milestones = goal.milestones ?? [];
    if (milestones.length === 0) {
      return { status: 'on_track', actualProgress: 0 };
    }

    const totalWeight = milestones.reduce((s, m) => s + (m.weight ?? 1), 0);
    const completedWeight = milestones
      .filter((m) => m.isCompleted)
      .reduce((s, m) => s + (m.weight ?? 1), 0);

    const actualProgress = totalWeight > 0 ? completedWeight / totalWeight : 0;

    // If there's a deadline, plug into velocity calc
    let status: GoalHealthStatus = 'on_track';
    if (goal.deadline) {
      const syntheticGoal = { ...goal, currentValue: actualProgress * 100, targetValue: 100 };
      const deadlineHealth = HealthCalculator.computeDeadlineHealth(syntheticGoal, todayIso());
      status = deadlineHealth.status;
    }

    return { status, actualProgress };
  }

  // ─── Avoidance ───────────────────────────────────────────────────────────

  private static computeAvoidanceHealth(goal: Goal, checkIns: CheckIn[], today: string): GoalHealth {
    // Any 'missed' check-in within the streak window is a violation
    const hasViolation = checkIns.some((c) => c.state === 'missed' && c.date <= today);
    const currentStreak = goal.streakConfig?.currentStreak ?? 0;

    let status: GoalHealthStatus = 'on_track';
    if (hasViolation) status = 'at_risk';

    return {
      status,
      actualProgress: Math.min(1, currentStreak / Math.max(1, goal.targetValue)),
    };
  }

  // ─── Accumulative ────────────────────────────────────────────────────────

  private static computeAccumulativeHealth(goal: Goal, today: string): GoalHealth {
    const actualProgress = goal.targetValue > 0 ? Math.min(1, goal.currentValue / goal.targetValue) : 0;
    let daysRemaining: number | undefined;

    if (goal.deadline) {
      const end = new Date(`${goal.deadline}T00:00:00`);
      const now = new Date(`${today}T00:00:00`);
      daysRemaining = Math.max(0, (end.getTime() - now.getTime()) / 86400000);
    }

    return { status: 'on_track', actualProgress, daysRemaining };
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function daysUntilPeriodEnd(period: string, today: string, weekStartsOn: number): number {
  if (period === 'daily') return 1;

  const d = new Date(`${today}T00:00:00`);
  if (period === 'weekly') {
    const day = d.getDay();
    const diff = (day - weekStartsOn + 7) % 7;
    return 7 - diff; // days remaining in week including today
  }
  if (period === 'monthly') {
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return lastDay - d.getDate() + 1;
  }
  return 365;
}
