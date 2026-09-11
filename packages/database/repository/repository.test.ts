// packages/database/repository/repository.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseConnection } from '../connection';
import { SQLiteGoalRepository } from './goal-repository';
import { SettingsRepository } from './settings-repository';
import { SQLiteActionRepository } from './action-repository';
import { FocusSessionRepository } from './focus-session-repository';
import { Goal } from '@shared/types';

describe('SQLite Repositories', () => {
  let db: any;
  let goalRepo: SQLiteGoalRepository;
  let settingsRepo: SettingsRepository;
  let actionRepo: SQLiteActionRepository;
  let focusSessionRepo: FocusSessionRepository;

  beforeEach(() => {
    DatabaseConnection.close();
    db = DatabaseConnection.initializeInMemory();
    goalRepo = new SQLiteGoalRepository(db);
    settingsRepo = new SettingsRepository(db);
    actionRepo = new SQLiteActionRepository(db);
    focusSessionRepo = new FocusSessionRepository(db);
  });

  it('cascades deletion of milestones and progress events when goal is deleted', () => {
    const goal: Goal = {
      id: 'g-1',
      name: 'Test Goal',
      paradigm: 'accumulative',
      type: 'numeric',
      currentValue: 10,
      targetValue: 100,
      defaultIncrement: 1,
      area: 'Personal',
      priority: 'normal',
      period: 'total',
      startDate: new Date().toISOString(),
      status: 'active',
      milestones: [
        { id: 'm-1', goalId: 'g-1', title: 'M1', isCompleted: false, createdAt: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    goalRepo.saveGoal(goal);
    goalRepo.saveProgressEvent({
      id: 'e-1',
      goalId: 'g-1',
      previousValue: 0,
      newValue: 10,
      delta: 10,
      resultingValue: 10,
      timestamp: new Date().toISOString(),
    });

    expect(goalRepo.getGoalById('g-1')?.milestones.length).toBe(1);
    expect(goalRepo.getProgressEvents('g-1').length).toBe(1);

    // Delete goal
    const deleted = goalRepo.deleteGoal('g-1');
    expect(deleted).toBe(true);
    expect(goalRepo.getGoalById('g-1')).toBeNull();
    expect(goalRepo.getProgressEvents('g-1').length).toBe(0);
  });

  it('persists and updates application settings', () => {
    const initial = settingsRepo.getSettings();
    expect(initial.islandPosition).toBe('notch');
    expect(initial.autoCollapseDelay).toBe(3.0);

    const updated = settingsRepo.updateSettings({
      islandPosition: 'floating',
      autoCollapseDelay: 5.0,
      theme: 'dark',
    });

    expect(updated.islandPosition).toBe('floating');
    expect(updated.autoCollapseDelay).toBe(5.0);
    expect(updated.theme).toBe('dark');

    // Reload from db
    const reloaded = settingsRepo.getSettings();
    expect(reloaded.islandPosition).toBe('floating');
    expect(reloaded.autoCollapseDelay).toBe(5.0);
    expect(reloaded.theme).toBe('dark');
  });

  it('persists actions and cascades them when their goal is deleted', () => {
    const goal: Goal = {
      id: 'action-goal', name: 'Ship Beacon', paradigm: 'accumulative', type: 'numeric',
      currentValue: 0, targetValue: 1, defaultIncrement: 1, area: 'Projects', priority: 'high',
      period: 'total', startDate: '2026-09-08', status: 'active', milestones: [],
      createdAt: '2026-09-08T00:00:00.000Z', updatedAt: '2026-09-08T00:00:00.000Z',
    };
    goalRepo.saveGoal(goal);
    actionRepo.save({
      id: 'action-1', goalId: goal.id, title: 'Write first-run flow', status: 'open',
      source: 'manual', createdAt: goal.createdAt, updatedAt: goal.updatedAt,
    });

    expect(actionRepo.getById('action-1')?.title).toBe('Write first-run flow');
    goalRepo.deleteGoal(goal.id);
    expect(actionRepo.getById('action-1')).toBeNull();
  });

  it('lists only open actions for the requested goals in newest-first order', () => {
    const base = { paradigm: 'accumulative' as const, type: 'numeric' as const, currentValue: 0, targetValue: 1, defaultIncrement: 1, area: 'Projects', priority: 'normal' as const, period: 'total' as const, startDate: '2026-09-11', status: 'active' as const, milestones: [] };
    goalRepo.saveGoal({ ...base, id: 'goal-a', name: 'Goal A', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z' });
    goalRepo.saveGoal({ ...base, id: 'goal-b', name: 'Goal B', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z' });
    goalRepo.saveGoal({ ...base, id: 'goal-c', name: 'Goal C', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z' });
    actionRepo.save({ id: 'open-older', goalId: 'goal-a', title: 'Older', status: 'open', source: 'manual', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-10T00:00:00.000Z' });
    actionRepo.save({ id: 'open-newer', goalId: 'goal-b', title: 'Newer', status: 'open', source: 'manual', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-11T00:00:00.000Z' });
    actionRepo.save({ id: 'completed', goalId: 'goal-a', title: 'Completed', status: 'completed', source: 'manual', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-11T00:00:00.000Z', completedAt: '2026-09-11T00:00:00.000Z' });
    actionRepo.save({ id: 'other-goal', goalId: 'goal-c', title: 'Elsewhere', status: 'open', source: 'manual', createdAt: '2026-09-10T00:00:00.000Z', updatedAt: '2026-09-12T00:00:00.000Z' });

    expect(actionRepo.listOpenForGoalIds(['goal-a', 'goal-b']).map((action) => action.id)).toEqual(['open-newer', 'open-older']);
    expect(actionRepo.listOpenForGoalIds([])).toEqual([]);
  });

  it('gives each completed focus session a stable exportable identifier', () => {
    const saved = focusSessionRepo.save({ goalId: 'goal-1', actionId: 'action-1', goalName: 'Write', durationMinutes: 25, timestamp: '2026-09-09T10:00:00.000Z' });
    expect(saved.id).toBeTruthy();
    expect(focusSessionRepo.totalMinutesSince('2026-09-09T00:00:00.000Z')).toBe(25);
  });
});
