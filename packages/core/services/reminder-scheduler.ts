import { Goal, ReminderPolicy } from '@shared/types';

/**
 * Pure reminder eligibility rules. Delivery is deliberately kept outside core:
 * this makes macOS notifications replaceable and keeps quiet-hour behaviour
 * deterministic in tests.
 */
export function isReminderDue(policy: ReminderPolicy, goal: Goal | null | undefined, now = new Date()): boolean {
  if (!policy.enabled || !policy.time || !goal) return false;
  if (policy.onlyWhenIncomplete && goal.status === 'completed') return false;
  if (goal.status === 'archived' || goal.status === 'paused') return false;

  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (currentTime !== policy.time) return false;
  if (policy.weekdays?.length && !policy.weekdays.includes(now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6)) return false;
  return !isWithinQuietHours(currentTime, policy.quietStart, policy.quietEnd);
}

export function isWithinQuietHours(current: string, start?: string, end?: string): boolean {
  if (!start || !end || start === end) return false;
  return start < end ? current >= start && current < end : current >= start || current < end;
}

export class ReminderDeliveryGate {
  private delivered = new Set<string>();

  shouldDeliver(policy: ReminderPolicy, goal: Goal | null | undefined, now = new Date()): boolean {
    if (!isReminderDue(policy, goal, now)) return false;
    const key = `${policy.goalId}:${localDate(now)}`;
    if (this.delivered.has(key)) return false;
    this.delivered.add(key);
    return true;
  }

  /** Keeps only the current date's keys, avoiding an unbounded daemon set. */
  prune(now = new Date()): void {
    const suffix = `:${localDate(now)}`;
    this.delivered = new Set([...this.delivered].filter((key) => key.endsWith(suffix)));
  }

  reset(goalId: string): void { this.delivered = new Set([...this.delivered].filter((key) => !key.startsWith(`${goalId}:`))); }
}

function localDate(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
