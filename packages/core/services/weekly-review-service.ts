import { Goal, ProgressEvent, WeeklyReview } from '@shared/types';
import { toLocalDate } from '../time/local-date';

/** Builds a gentle retrospective from existing local history; no new tracking
 * source is invented and an empty week is treated as information, not failure. */
export class WeeklyReviewService {
  constructor(private readonly goals: WeeklyReviewDataSource, private readonly focusMinutesSince: (date: string) => number = () => 0) {}

  getReview(now = new Date()): WeeklyReview {
    const weekEnding = toLocalDate(now);
    const since = isoDaysBefore(now, 6);
    const active = this.goals.getAllGoals('active');
    const events = this.goals.getProgressEvents(undefined, 500).filter((event) => event.timestamp.slice(0, 10) >= since);
    const rows = active.map((goal) => this.reviewGoal(goal, since, events));
    const commitmentsKept = rows.filter((row) => row.completedCheckIns > 0 || row.progressEvents > 0).length;
    const friction = rows.filter((row) => row.progressEvents === 0 && row.completedCheckIns === 0).map((row) => `${row.goalName} had no signal this week`);
    return {
      weekEnding,
      commitmentsKept,
      commitmentsTotal: active.length,
      focusMinutes: this.focusMinutesSince(since),
      friction,
      adjustment: friction.length ? 'Choose one smaller next action for the quietest commitment.' : 'Keep the rhythm that worked; protect one focused block for it.',
      goals: rows,
    };
  }

  private reviewGoal(goal: Goal, since: string, events: ProgressEvent[]) {
    const checkIns = this.goals.getCheckIns(goal.id, since).filter((checkIn) => checkIn.state === 'completed').length;
    const progressEvents = events.filter((event) => event.goalId === goal.id).length;
    return { goalId: goal.id, goalName: goal.name, completedCheckIns: checkIns, progressEvents, trajectory: goal.health?.trajectoryLabel ?? (checkIns || progressEvents ? 'Moving' : 'Needs a gentler restart') };
  }
}

interface WeeklyReviewDataSource {
  getAllGoals(status?: 'active'): Goal[];
  getProgressEvents(goalId?: string, limit?: number): ProgressEvent[];
  getCheckIns(goalId: string, since?: string): { state: string }[];
}

function isoDaysBefore(now: Date, days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return toLocalDate(date);
}
