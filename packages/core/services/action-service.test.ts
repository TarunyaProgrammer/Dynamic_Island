import { beforeEach, describe, expect, it } from 'vitest';
import { DatabaseConnection } from '@database/connection';
import { SQLiteGoalRepository } from '@database/repository/goal-repository';
import { SQLiteActionRepository } from '@database/repository/action-repository';
import { GoalService } from './goal-service';
import { ActionService } from './action-service';

describe('ActionService', () => {
  let service: ActionService;
  let goalId: string;

  beforeEach(() => {
    DatabaseConnection.close();
    const db = DatabaseConnection.initializeInMemory();
    const goals = new SQLiteGoalRepository(db);
    const goal = new GoalService(goals).createGoal({ name: 'Learn Swift', type: 'count', targetValue: 10 });
    goalId = goal.id;
    service = new ActionService((id) => Boolean(goals.getGoalById(id)), new SQLiteActionRepository(db));
  });

  it('creates a goal-owned next action and rejects blank titles', () => {
    expect(service.create({ goalId, title: ' Read chapter one ' }).title).toBe('Read chapter one');
    expect(() => service.create({ goalId, title: ' ' })).toThrow('Action title cannot be empty');
  });

  it('completes once and prevents a completed action from being edited', () => {
    const action = service.create({ goalId, title: 'Read chapter one' });
    const completed = service.complete(action.id);
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBeDefined();
    expect(() => service.update(action.id, { title: 'Rename' })).toThrow('Only open actions can be edited');
  });

  it('records a compassionate explicit skip reason', () => {
    const action = service.create({ goalId, title: 'Run' });
    expect(service.skip(action.id, 'sick')).toMatchObject({ status: 'skipped', skipReason: 'sick' });
  });

  it('persists a provider source ID for idempotent imports', () => {
    const action = service.create({ goalId, title: 'Buy a book', source: 'calendar', externalSourceId: 'apple-reminder:r1' });
    expect((service as any).actions.findByExternalSourceId('apple-reminder:r1')).toMatchObject({ id: action.id });
  });
});
