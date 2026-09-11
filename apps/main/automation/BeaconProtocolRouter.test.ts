import { beforeEach, describe, expect, it } from 'vitest';
import { DatabaseConnection } from '@database/connection';
import { SQLiteGoalRepository } from '@database/repository/goal-repository';
import { GoalService } from '@core/services/goal-service';
import { ActionService } from '@core/services/action-service';
import { TodayService } from '@core/services/today-service';
import { SQLiteActionRepository } from '@database/repository/action-repository';
import { SQLiteTodayPlanRepository } from '@database/repository/today-plan-repository';
import { BeaconProtocolRouter } from './BeaconProtocolRouter';
describe('BeaconProtocolRouter', () => {
  beforeEach(() => DatabaseConnection.close());
  it('routes safe deep links through GoalService', () => {
    const service = new GoalService(new SQLiteGoalRepository(DatabaseConnection.initializeInMemory()));
    const goal = service.createGoal({ name: 'Read', targetValue: 5, defaultIncrement: 1 });
    let opened = ''; const router = new BeaconProtocolRouter(service, () => { opened = 'today'; }, (id) => { opened = id; });
    expect(router.handle(`beacon://goal/${goal.id}/increment?amount=2`)).toBe(true);
    expect(service.getGoal(goal.id)?.currentValue).toBe(2);
    expect(opened).toBe(goal.id);
    expect(router.handle('beacon://goal/not-real/increment')).toBe(false);
    expect(router.handle('https://beacon/today')).toBe(false);
  });

  it('routes action commands through the same action and Today services', () => {
    const db = DatabaseConnection.initializeInMemory();
    const service = new GoalService(new SQLiteGoalRepository(db));
    const goal = service.createGoal({ name: 'Read', targetValue: 5 });
    const actions = new ActionService((id) => id === goal.id, new SQLiteActionRepository(db));
    const today = new TodayService(new SQLiteActionRepository(db), new SQLiteTodayPlanRepository(db));
    const action = actions.create({ goalId: goal.id, title: 'Read one chapter' });
    const router = new BeaconProtocolRouter(service, () => undefined, () => undefined, actions, today);

    expect(router.handle(`beacon://action/${action.id}/plan`)).toBe(true);
    expect(today.getPlan().entries).toHaveLength(1);
    expect(router.handle(`beacon://action/${action.id}/done`)).toBe(true);
    expect(actions.get(action.id)?.status).toBe('completed');
  });
});
