import { beforeEach, describe, expect, it } from 'vitest';
import { DatabaseConnection } from '@database/connection';
import { SQLiteGoalRepository } from '@database/repository/goal-repository';
import { SQLiteActionRepository } from '@database/repository/action-repository';
import { SQLiteTodayPlanRepository } from '@database/repository/today-plan-repository';
import { GoalService } from './goal-service';
import { ActionService } from './action-service';
import { TodayService } from './today-service';

describe('TodayService', () => {
  let actions: ActionService;
  let today: TodayService;
  let goalIds: string[];

  beforeEach(() => {
    DatabaseConnection.close();
    const db = DatabaseConnection.initializeInMemory();
    const goals = new SQLiteGoalRepository(db);
    const goalService = new GoalService(goals);
    goalIds = ['One', 'Two', 'Three', 'Four'].map((name) => goalService.createGoal({ name, type: 'numeric', targetValue: 1 }).id);
    const actionRepo = new SQLiteActionRepository(db);
    actions = new ActionService((id) => Boolean(goals.getGoalById(id)), actionRepo);
    today = new TodayService(actionRepo, new SQLiteTodayPlanRepository(db));
  });

  it('recommends three commitments and places the fourth in Later', () => {
    const created = goalIds.map((goalId) => actions.create({ goalId, title: goalId }));
    created.forEach((action) => today.planAction(action.id, '2026-09-08'));
    const plan = today.getPlan('2026-09-08');
    expect(plan.entries.filter((entry) => entry.bucket === 'today')).toHaveLength(3);
    expect(plan.entries.filter((entry) => entry.bucket === 'later')).toHaveLength(1);
  });

  it('keeps only one action from each goal in Today', () => {
    const first = actions.create({ goalId: goalIds[0], title: 'First' });
    const second = actions.create({ goalId: goalIds[0], title: 'Second' });
    today.planAction(first.id, '2026-09-08');
    today.planAction(second.id, '2026-09-08');
    expect(today.getPlan('2026-09-08').entries.map((entry) => entry.bucket)).toEqual(['today', 'later']);
  });

  it('reschedules an action without treating it as a missed commitment', () => {
    const action = actions.create({ goalId: goalIds[0], title: 'Read' });
    today.planAction(action.id, '2026-09-08');
    const next = today.reschedule(action.id, '2026-09-10', '2026-09-08');
    expect(today.getPlan('2026-09-08').entries).toHaveLength(0);
    expect(next.entries).toEqual([expect.objectContaining({ actionId: action.id, bucket: 'today' })]);
    expect(actions.get(action.id)?.status).toBe('open');
  });
});
