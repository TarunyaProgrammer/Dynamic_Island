// packages/database/repository/repository.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseConnection } from '../connection';
import { SQLiteGoalRepository } from './goal-repository';
import { SettingsRepository } from './settings-repository';
import { Goal } from '@shared/types';

describe('SQLite Repositories', () => {
  let db: any;
  let goalRepo: SQLiteGoalRepository;
  let settingsRepo: SettingsRepository;

  beforeEach(() => {
    DatabaseConnection.close();
    db = DatabaseConnection.initializeInMemory();
    goalRepo = new SQLiteGoalRepository(db);
    settingsRepo = new SettingsRepository(db);
  });

  it('cascades deletion of milestones and progress events when goal is deleted', () => {
    const goal: Goal = {
      id: 'g-1',
      name: 'Test Goal',
      type: 'numeric',
      currentValue: 10,
      targetValue: 100,
      defaultIncrement: 1,
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
});
