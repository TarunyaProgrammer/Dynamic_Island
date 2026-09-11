// packages/core/services/goal-service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseConnection } from '@database/connection';
import { SQLiteGoalRepository } from '@database/repository/goal-repository';
import { GoalService } from './goal-service';

describe('GoalService & Domain Engine', () => {
  let db: any;
  let repo: SQLiteGoalRepository;
  let service: GoalService;

  beforeEach(() => {
    DatabaseConnection.close();
    db = DatabaseConnection.initializeInMemory();
    repo = new SQLiteGoalRepository(db);
    service = new GoalService(repo);
  });

  it('creates a new goal with valid draft', () => {
    const goal = service.createGoal({
      name: 'Read 20 Books',
      type: 'count',
      targetValue: 20,
      unit: 'books',
      defaultIncrement: 1,
    });

    expect(goal.id).toBeDefined();
    expect(goal.name).toBe('Read 20 Books');
    expect(goal.currentValue).toBe(0);
    expect(goal.targetValue).toBe(20);
    expect(goal.status).toBe('active');

    const loaded = service.getGoal(goal.id);
    expect(loaded?.name).toBe('Read 20 Books');
  });

  it('rejects goal with empty name', () => {
    expect(() =>
      service.createGoal({
        name: '   ',
        type: 'numeric',
        targetValue: 100,
      })
    ).toThrowError('Goal name cannot be empty');
  });

  it('increments progress and auto-completes when target reached', () => {
    const goal = service.createGoal({
      name: 'Write 10 Essays',
      type: 'count',
      targetValue: 10,
      defaultIncrement: 2,
    });

    const updated = service.incrementProgress(goal.id);
    expect(updated.currentValue).toBe(2);
    expect(updated.status).toBe('active');

    const history = service.getHistory(goal.id);
    expect(history.length).toBe(1);
    expect(history[0].delta).toBe(2);

    // Increment past target
    const finished = service.incrementProgress(goal.id, 8);
    expect(finished.currentValue).toBe(10);
    expect(finished.status).toBe('completed');
  });

  it('reopens a completed goal when editing moves its progress below target', () => {
    const goal = service.createGoal({ name: 'Finish draft', type: 'count', targetValue: 10, currentValue: 10 });
    expect(service.getGoal(goal.id)?.status).toBe('active');
    service.completeGoal(goal.id);

    const reopened = service.updateGoal(goal.id, { currentValue: 7 });
    expect(reopened.status).toBe('active');
    expect(reopened.currentValue).toBe(7);
  });

  it('honors an explicit active status when reopening a completed goal', () => {
    const goal = service.createGoal({ name: 'Keep practising', type: 'count', targetValue: 10, currentValue: 10 });
    service.completeGoal(goal.id);

    const reopened = service.updateGoal(goal.id, { status: 'active' });
    expect(reopened.status).toBe('active');
    expect(reopened.currentValue).toBe(10);
  });

  it('supports undo and redo for progress changes', () => {
    const goal = service.createGoal({
      name: 'Practice Guitar',
      type: 'numeric',
      targetValue: 50,
      defaultIncrement: 5,
    });

    service.incrementProgress(goal.id, 10);
    expect(service.getGoal(goal.id)?.currentValue).toBe(10);

    // Undo
    const undone = service.undo();
    expect(undone).toBe(true);
    expect(service.getGoal(goal.id)?.currentValue).toBe(0);

    // Redo
    const redone = service.redo();
    expect(redone).toBe(true);
    expect(service.getGoal(goal.id)?.currentValue).toBe(10);
  });

  it('manages milestones and updates goal progress when contribution is set', () => {
    const goal = service.createGoal({
      name: 'Build MVP',
      type: 'percentage',
      targetValue: 100,
    });

    const m1 = service.addMilestone(goal.id, 'Design UI', 25);
    const m2 = service.addMilestone(goal.id, 'Implement Backend', 50);

    expect(m1.title).toBe('Design UI');
    expect(m2.title).toBe('Implement Backend');

    // Toggle milestone 1
    const afterM1 = service.toggleMilestone(goal.id, m1.id);
    expect(afterM1.currentValue).toBe(25);
    expect(afterM1.milestones.find((m) => m.id === m1.id)?.isCompleted).toBe(true);

    // Toggle milestone 2
    const afterM2 = service.toggleMilestone(goal.id, m2.id);
    expect(afterM2.currentValue).toBe(75);

    // Toggle milestone 1 off
    const afterM1Off = service.toggleMilestone(goal.id, m1.id);
    expect(afterM1Off.currentValue).toBe(50);
  });

  it('records durable operation-log events for progress, check-ins, and milestones', () => {
    const operations: Array<{ entityType: string; kind: string }> = [];
    const synced = new GoalService(repo, undefined, { record: (operation) => operations.push(operation) });
    const goal = synced.createGoal({ name: 'Ship the loop', type: 'numeric', targetValue: 10, defaultIncrement: 1 });
    const milestone = synced.addMilestone(goal.id, 'Write tests', 1);
    synced.incrementProgress(goal.id, 1);
    synced.checkIn(goal.id, 'completed');
    synced.deleteMilestone(goal.id, milestone.id);

    expect(operations).toEqual(expect.arrayContaining([
      expect.objectContaining({ entityType: 'goal', kind: 'upsert' }),
      expect.objectContaining({ entityType: 'milestone', kind: 'upsert' }),
      expect.objectContaining({ entityType: 'milestone', kind: 'delete' }),
      expect.objectContaining({ entityType: 'progress-event', kind: 'upsert' }),
      expect.objectContaining({ entityType: 'check-in', kind: 'upsert' }),
    ]));
  });

  it('records an event tombstone on undo and an upsert on redo', () => {
    const operations: Array<{ entityType: string; entityId: string; kind: string }> = [];
    const synced = new GoalService(repo, undefined, { record: (operation) => operations.push(operation) });
    const goal = synced.createGoal({ name: 'Keep history true', type: 'numeric', targetValue: 10, defaultIncrement: 1 });
    synced.incrementProgress(goal.id, 1);
    const eventId = synced.getHistory(goal.id)[0].id;

    synced.undo();
    expect(operations).toContainEqual(expect.objectContaining({ entityType: 'progress-event', entityId: eventId, kind: 'delete' }));

    synced.redo();
    expect(operations).toContainEqual(expect.objectContaining({ entityType: 'progress-event', entityId: eventId, kind: 'upsert' }));
  });

  it('calculates aggregated stats correctly', () => {
    service.createGoal({ name: 'Goal 1', type: 'numeric', targetValue: 100, currentValue: 50 });
    const g2 = service.createGoal({ name: 'Goal 2', type: 'numeric', targetValue: 100 });
    service.completeGoal(g2.id);

    const stats = service.getStats();
    expect(stats.totalGoals).toBe(2);
    expect(stats.activeGoals).toBe(1);
    expect(stats.completedGoals).toBe(1);
    expect(stats.overallProgressFraction).toBe(0.5);
  });
});
