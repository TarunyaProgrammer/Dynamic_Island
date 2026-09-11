import { beforeEach, describe, expect, it } from 'vitest';
import { DatabaseConnection } from '@database/connection';
import { ReminderPolicyRepository } from '@database/repository/reminder-policy-repository';
import { SQLiteGoalRepository } from '@database/repository/goal-repository';
import { GoalService } from './goal-service';
import { ReminderPolicyService } from './reminder-policy-service';

describe('ReminderPolicyService', () => {
  beforeEach(() => DatabaseConnection.close());

  it('persists an opt-in policy and records a portable sync operation', () => {
    const db = DatabaseConnection.initializeInMemory();
    const operations: unknown[] = [];
    const service = new ReminderPolicyService(new ReminderPolicyRepository(db), { record: (operation) => { operations.push(operation); } });
    const goal = new GoalService(new SQLiteGoalRepository(db)).createGoal({ name: 'Read', targetValue: 1 });

    const policy = service.save({ goalId: goal.id, enabled: true, time: '09:30', weekdays: [1, 3], onlyWhenIncomplete: true, quietStart: '21:00', quietEnd: '07:00' });

    expect(service.get(goal.id)).toEqual(policy);
    expect(operations).toEqual([expect.objectContaining({ entityType: 'reminder-policy', entityId: goal.id, kind: 'upsert' })]);
  });
});
