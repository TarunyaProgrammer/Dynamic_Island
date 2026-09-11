import { GoalService } from '@core/services/goal-service';
import { ReminderDeliveryGate } from '@core/services/reminder-scheduler';
import { ReminderPolicyRepository } from '@database/repository/reminder-policy-repository';
import { NotificationService } from '../notifications/NotificationService';

/** Polls on a short cadence so a sleeping/waking Mac naturally catches up at
 * the next eligible minute without creating an external background daemon. */
export class ReminderRunner {
  private timer: ReturnType<typeof setInterval> | undefined;
  private readonly gate = new ReminderDeliveryGate();
  private readonly snoozedUntil = new Map<string, Date>();

  constructor(
    private readonly goals: GoalService,
    private readonly policies: ReminderPolicyRepository,
    private readonly onOpenToday: () => void,
  ) {}

  start(): void {
    if (this.timer) return;
    this.tick();
    this.timer = setInterval(() => this.tick(), 30_000);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  tick(now = new Date()): void {
    this.gate.prune(now);
    for (const policy of this.policies.listEnabled()) {
      const goal = this.goals.getGoal(policy.goalId);
      const snoozedUntil = this.snoozedUntil.get(policy.goalId);
      if (snoozedUntil && snoozedUntil > now) continue;
      if (snoozedUntil && snoozedUntil <= now && goal) {
        this.snoozedUntil.delete(policy.goalId);
        this.gate.reset(policy.goalId);
        this.deliver(goal);
        continue;
      }
      if (this.gate.shouldDeliver(policy, goal, now) && goal) {
        this.deliver(goal);
      }
    }
  }

  private deliver(goal: NonNullable<ReturnType<GoalService['getGoal']>>): void {
    NotificationService.notifyGoalReminder(goal.name, {
      onDone: () => { this.goals.checkIn(goal.id, 'completed'); },
      onSnooze: () => { this.snoozedUntil.set(goal.id, new Date(Date.now() + 60 * 60 * 1000)); },
      onSkip: () => { this.goals.checkIn(goal.id, 'skipped', 0, { skipReason: 'rest' }); },
      onOpenToday: this.onOpenToday,
    });
  }
}
