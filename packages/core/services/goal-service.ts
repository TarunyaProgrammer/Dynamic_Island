// packages/core/services/goal-service.ts - Central Domain Mutation Engine
import { IGoalRepository } from '@database/repository/goal-repository';
import { BeaconStats, Goal, GoalDraft, GoalStatus, GoalUpdateDraft, Milestone, ProgressEvent } from '@shared/types';
import { GoalEntity } from '../models/goal';
import { MilestoneEntity } from '../models/milestone';
import { ProgressEventEntity } from '../models/progress-event';
import { UndoManager } from '../history/undo-manager';

export class GoalService {
  private undoManager: UndoManager;
  private changeListeners: Set<() => void> = new Set();

  constructor(
    private repository: IGoalRepository,
    undoManager?: UndoManager
  ) {
    this.undoManager = undoManager || new UndoManager();
  }

  subscribe(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.changeListeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying change listener:', err);
      }
    }
  }

  listGoals(status?: GoalStatus): Goal[] {
    return this.repository.getAllGoals(status);
  }

  getGoal(id: string): Goal | null {
    return this.repository.getGoalById(id);
  }

  createGoal(draft: GoalDraft): Goal {
    if (!draft.name || !draft.name.trim()) {
      throw new Error('Goal name cannot be empty');
    }

    const entity = GoalEntity.createFromDraft(draft);
    this.repository.saveGoal(entity);
    this.notify();
    return entity;
  }

  updateGoal(id: string, update: GoalUpdateDraft): Goal {
    const existing = this.repository.getGoalById(id);
    if (!existing) {
      throw new Error(`Goal not found: ${id}`);
    }

    const updated: Goal = {
      ...existing,
      name: update.name !== undefined ? update.name.trim() : existing.name,
      description: update.description !== undefined ? update.description.trim() : existing.description,
      type: update.type !== undefined ? update.type : existing.type,
      targetValue: update.targetValue !== undefined ? Math.max(0, update.targetValue) : existing.targetValue,
      currentValue: update.currentValue !== undefined ? Math.max(0, update.currentValue) : existing.currentValue,
      unit: update.unit !== undefined ? update.unit.trim() : existing.unit,
      defaultIncrement: update.defaultIncrement !== undefined ? Math.max(0.1, update.defaultIncrement) : existing.defaultIncrement,
      startDate: update.startDate !== undefined ? update.startDate : existing.startDate,
      deadline: update.deadline !== undefined ? update.deadline : existing.deadline,
      status: update.status !== undefined ? update.status : existing.status,
      category: update.category !== undefined ? update.category.trim() : existing.category,
      updatedAt: new Date().toISOString(),
    };

    if (updated.targetValue > 0 && updated.currentValue >= updated.targetValue && updated.status === 'active') {
      updated.status = 'completed';
    }

    this.repository.saveGoal(updated);
    this.notify();
    return updated;
  }

  deleteGoal(id: string): boolean {
    const success = this.repository.deleteGoal(id);
    if (success) {
      this.notify();
    }
    return success;
  }

  archiveGoal(id: string): Goal {
    return this.updateGoal(id, { status: 'archived' });
  }

  completeGoal(id: string): Goal {
    const existing = this.repository.getGoalById(id);
    if (!existing) throw new Error(`Goal not found: ${id}`);

    const target = existing.targetValue > 0 ? existing.targetValue : existing.currentValue;
    return this.updateGoal(id, {
      status: 'completed',
      currentValue: target,
    });
  }

  incrementProgress(goalId: string, delta?: number, note?: string): Goal {
    const goal = this.repository.getGoalById(goalId);
    if (!goal) throw new Error(`Goal not found: ${goalId}`);

    const inc = delta !== undefined ? delta : (goal.defaultIncrement || 1);
    const prev = goal.currentValue;
    const next = Math.max(0, prev + inc);

    const event = ProgressEventEntity.create(goalId, prev, inc, note);
    this.repository.saveProgressEvent(event);

    this.undoManager.record({
      type: 'progress',
      goalId,
      previousValue: prev,
      newValue: next,
      event,
    });

    let status = goal.status;
    if (goal.targetValue > 0 && next >= goal.targetValue && status === 'active') {
      status = 'completed';
    }

    const updated: Goal = {
      ...goal,
      currentValue: next,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.repository.saveGoal(updated);
    this.notify();
    return updated;
  }

  setProgress(goalId: string, value: number, note?: string): Goal {
    const goal = this.repository.getGoalById(goalId);
    if (!goal) throw new Error(`Goal not found: ${goalId}`);

    const prev = goal.currentValue;
    const next = Math.max(0, value);
    const delta = next - prev;

    const event = ProgressEventEntity.create(goalId, prev, delta, note);
    this.repository.saveProgressEvent(event);

    this.undoManager.record({
      type: 'progress',
      goalId,
      previousValue: prev,
      newValue: next,
      event,
    });

    let status = goal.status;
    if (goal.targetValue > 0 && next >= goal.targetValue && status === 'active') {
      status = 'completed';
    }

    const updated: Goal = {
      ...goal,
      currentValue: next,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.repository.saveGoal(updated);
    this.notify();
    return updated;
  }

  addMilestone(goalId: string, title: string, targetContribution?: number): Milestone {
    const goal = this.repository.getGoalById(goalId);
    if (!goal) throw new Error(`Goal not found: ${goalId}`);

    const milestone = MilestoneEntity.create(goalId, title, targetContribution);
    this.repository.saveMilestone(milestone);
    this.notify();
    return milestone;
  }

  toggleMilestone(goalId: string, milestoneId: string): Goal {
    const goal = this.repository.getGoalById(goalId);
    if (!goal) throw new Error(`Goal not found: ${goalId}`);

    const milestone = goal.milestones.find((m) => m.id === milestoneId);
    if (!milestone) throw new Error(`Milestone not found: ${milestoneId}`);

    const toggled = new MilestoneEntity(milestone).toggle();
    this.repository.saveMilestone(toggled);

    // If milestone has targetContribution, auto-adjust goal currentValue
    let currentVal = goal.currentValue;
    if (milestone.targetContribution && milestone.targetContribution > 0) {
      if (toggled.isCompleted) {
        currentVal += milestone.targetContribution;
      } else {
        currentVal = Math.max(0, currentVal - milestone.targetContribution);
      }
    }

    const updatedGoal = this.repository.getGoalById(goalId)!;
    if (currentVal !== goal.currentValue) {
      updatedGoal.currentValue = currentVal;
      this.repository.saveGoal(updatedGoal);
    }

    this.notify();
    return updatedGoal;
  }

  deleteMilestone(goalId: string, milestoneId: string): Goal {
    this.repository.deleteMilestone(milestoneId);
    const updated = this.repository.getGoalById(goalId);
    if (!updated) throw new Error(`Goal not found: ${goalId}`);
    this.notify();
    return updated;
  }

  getHistory(goalId?: string, limit = 50): ProgressEvent[] {
    return this.repository.getProgressEvents(goalId, limit);
  }

  undo(): boolean {
    const action = this.undoManager.popUndo();
    if (!action) return false;

    const goal = this.repository.getGoalById(action.goalId);
    if (!goal) return false;

    goal.currentValue = action.previousValue;
    if (goal.status === 'completed' && goal.targetValue > 0 && goal.currentValue < goal.targetValue) {
      goal.status = 'active';
    }
    goal.updatedAt = new Date().toISOString();

    this.repository.saveGoal(goal);
    this.repository.deleteProgressEvent(action.event.id);
    this.notify();
    return true;
  }

  redo(): boolean {
    const action = this.undoManager.popRedo();
    if (!action) return false;

    const goal = this.repository.getGoalById(action.goalId);
    if (!goal) return false;

    goal.currentValue = action.newValue;
    if (goal.targetValue > 0 && goal.currentValue >= goal.targetValue) {
      goal.status = 'completed';
    }
    goal.updatedAt = new Date().toISOString();

    this.repository.saveGoal(goal);
    this.repository.saveProgressEvent(action.event);
    this.notify();
    return true;
  }

  getStats(): BeaconStats {
    return this.repository.getStats();
  }
}
