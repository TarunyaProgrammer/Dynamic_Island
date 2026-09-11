import { GoalService } from '@core/services/goal-service';
import { ActionService } from '@core/services/action-service';
import { TodayService } from '@core/services/today-service';

/** Local automation always delegates to GoalService, preserving history and UI broadcasts. */
export class BeaconProtocolRouter {
  constructor(private readonly goals: GoalService, private readonly showToday: () => void, private readonly showGoal: (goalId: string) => void, private readonly actions?: ActionService, private readonly today?: TodayService) {}

  handle(raw: string): boolean {
    let url: URL;
    try { url = new URL(raw); } catch { return false; }
    if (url.protocol !== 'beacon:') return false;
    const segments = url.pathname.split('/').filter(Boolean);
    if (url.hostname === 'today') { this.showToday(); return true; }
    if (url.hostname === 'action' && segments.length === 2 && segments[1] === 'done' && this.actions) {
      try { this.actions.complete(segments[0]); this.showToday(); return true; } catch { return false; }
    }
    if (url.hostname === 'action' && segments.length === 2 && segments[1] === 'plan' && this.today) {
      try { this.today.planAction(segments[0]); this.showToday(); return true; } catch { return false; }
    }
    if (url.hostname === 'goal' && segments.length === 2 && segments[1] === 'increment') {
      const goal = this.goals.getGoal(segments[0]);
      if (!goal) return false;
      const amount = Number(url.searchParams.get('amount') ?? goal.defaultIncrement);
      if (!Number.isFinite(amount) || amount <= 0) return false;
      this.goals.incrementProgress(goal.id, amount, 'Automated via beacon://');
      this.showGoal(goal.id);
      return true;
    }
    if (url.hostname === 'goal' && segments.length === 1) {
      if (!this.goals.getGoal(segments[0])) return false;
      this.showGoal(segments[0]);
      return true;
    }
    return false;
  }
}
