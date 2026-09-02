// packages/core/activities/focus-manager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FocusSessionManager } from './focus-manager';
import { ActivityEngine } from './activity-engine';
import { GoalService } from '../services/goal-service';
import { IGoalRepository } from '@database/repository/goal-repository';
import { Goal } from '@shared/types';

class MockGoalRepository implements IGoalRepository {
  private goals: Map<string, Goal> = new Map();
  getGoalById(id: string): Goal | null {
    return this.goals.get(id) || null;
  }
  getAllGoals(): Goal[] {
    return Array.from(this.goals.values());
  }
  saveGoal(goal: Goal): void {
    this.goals.set(goal.id, goal);
  }
  updateGoal(goal: Goal): void {
    this.goals.set(goal.id, goal);
  }
  deleteGoal(id: string): boolean {
    return this.goals.delete(id);
  }
  saveMilestone(): void {}
  deleteMilestone(): boolean {
    return true;
  }
  saveProgressEvent(): void {}
  deleteProgressEvent(): boolean {
    return true;
  }
  getProgressEvents(): any[] {
    return [];
  }
  saveCheckIn(): void {}
  getCheckIns(): any[] {
    return [];
  }
  getStats(): any {
    return {
      totalGoals: 0,
      activeGoals: 0,
      completedGoals: 0,
      overallProgressFraction: 0,
      todayIncrementsCount: 0,
    };
  }
}

describe('FocusSessionManager', () => {
  let repository: MockGoalRepository;
  let goalService: GoalService;
  let activityEngine: ActivityEngine;
  let focusManager: FocusSessionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    repository = new MockGoalRepository();
    goalService = new GoalService(repository);
    activityEngine = new ActivityEngine();
    focusManager = new FocusSessionManager(goalService, activityEngine);
  });

  it('should start and track focus sessions', () => {
    const goal = goalService.createGoal({
      name: 'Learn Rust',
      type: 'numeric',
      targetValue: 100,
    });

    const state = focusManager.start(25, goal.id);
    expect(state.isActive).toBe(true);
    expect(state.goalName).toBe('Learn Rust');
    expect(state.durationSeconds).toBe(25 * 60);

    const stack = activityEngine.getStack();
    expect(stack.length).toBe(1);
    expect(stack[0].type).toBe('focus');
  });

  it('should pause and resume session', () => {
    focusManager.start(10);
    expect(focusManager.getState().isActive).toBe(true);
    expect(focusManager.getState().isPaused).toBe(false);

    focusManager.pause();
    expect(focusManager.getState().isPaused).toBe(true);

    focusManager.resume();
    expect(focusManager.getState().isPaused).toBe(false);
  });

  it('should emit completion event when timer finishes', () => {
    const goal = goalService.createGoal({
      name: 'Ship Version 1.0',
      type: 'numeric',
      targetValue: 100,
    });

    let completedEvent: any = null;
    focusManager.onComplete((event) => {
      completedEvent = event;
    });

    focusManager.start(1, goal.id); // 1 minute = 60s
    expect(focusManager.getState().isActive).toBe(true);

    // Fast-forward 61 seconds
    vi.advanceTimersByTime(61 * 1000);

    expect(completedEvent).not.toBeNull();
    expect(completedEvent.goalName).toBe('Ship Version 1.0');
    expect(completedEvent.durationMinutes).toBe(1);
    expect(focusManager.getState().isActive).toBe(false);
  });
});
