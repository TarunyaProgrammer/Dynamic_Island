import { randomUUID } from 'node:crypto';
import { IActionRepository } from '@database/repository/action-repository';
import { GoalAction, GoalActionSource, GoalActionStatus, SkipReason } from '@shared/types';
import { OperationRecorder } from '../sync/operation-recorder';

export interface CreateGoalActionInput {
  goalId: string;
  title: string;
  source?: GoalActionSource;
  plannedDate?: string;
  estimatedMinutes?: number;
  externalSourceId?: string;
}

/** Owns action mutation rules independently from renderer and Electron. */
export class ActionService {
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly goalExists: (goalId: string) => boolean,
    private readonly actions: IActionRepository,
    private readonly operationRecorder?: OperationRecorder,
  ) {}

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  create(input: CreateGoalActionInput): GoalAction {
    if (!this.goalExists(input.goalId)) throw new Error(`Goal not found: ${input.goalId}`);
    const title = input.title.trim();
    if (!title) throw new Error('Action title cannot be empty');
    const now = new Date().toISOString();
    const action: GoalAction = {
      id: randomUUID(), goalId: input.goalId, title, status: 'open', source: input.source ?? 'manual',
      plannedDate: input.plannedDate, estimatedMinutes: normalizeMinutes(input.estimatedMinutes), externalSourceId: input.externalSourceId,
      createdAt: now, updatedAt: now,
    };
    this.actions.save(action);
    this.record(action);
    this.notify();
    return action;
  }

  update(id: string, input: Partial<Pick<CreateGoalActionInput, 'title' | 'plannedDate' | 'estimatedMinutes'>>): GoalAction {
    const action = this.require(id);
    if (action.status !== 'open') throw new Error('Only open actions can be edited');
    const title = input.title === undefined ? action.title : input.title.trim();
    if (!title) throw new Error('Action title cannot be empty');
    const updated = {
      ...action,
      title,
      plannedDate: input.plannedDate === undefined ? action.plannedDate : input.plannedDate,
      estimatedMinutes: input.estimatedMinutes === undefined ? action.estimatedMinutes : normalizeMinutes(input.estimatedMinutes),
      updatedAt: new Date().toISOString(),
    };
    this.actions.save(updated);
    this.record(updated);
    this.notify();
    return updated;
  }

  complete(id: string): GoalAction { return this.transition(id, 'completed'); }
  archive(id: string): GoalAction { return this.transition(id, 'archived'); }
  skip(id: string, reason: SkipReason = 'custom'): GoalAction { return this.transition(id, 'skipped', reason); }
  get(id: string): GoalAction | null { return this.actions.getById(id); }
  listForGoal(goalId: string, status?: GoalActionStatus): GoalAction[] { return this.actions.listForGoal(goalId, status); }
  listOpenForGoalIds(goalIds: readonly string[]): GoalAction[] { return this.actions.listOpenForGoalIds(goalIds); }

  private transition(id: string, status: Extract<GoalActionStatus, 'completed' | 'skipped' | 'archived'>, skipReason?: SkipReason): GoalAction {
    const action = this.require(id);
    if (action.status !== 'open') throw new Error('Only open actions can change state');
    const now = new Date().toISOString();
    const updated: GoalAction = {
      ...action, status, updatedAt: now,
      completedAt: status === 'completed' ? now : undefined,
      skippedAt: status === 'skipped' ? now : undefined,
      skipReason: status === 'skipped' ? skipReason : undefined,
    };
    this.actions.save(updated);
    this.record(updated);
    this.notify();
    return updated;
  }

  private require(id: string): GoalAction {
    const action = this.actions.getById(id);
    if (!action) throw new Error(`Action not found: ${id}`);
    return action;
  }

  private notify(): void { for (const listener of this.listeners) listener(); }
  private record(action: GoalAction): void { this.operationRecorder?.record({ entityType: 'action', entityId: action.id, kind: 'upsert', payload: action as unknown as Record<string, unknown> }); }
}

function normalizeMinutes(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value) || value < 1 || value > 1_440) throw new Error('Estimated minutes must be between 1 and 1440');
  return Math.round(value);
}
