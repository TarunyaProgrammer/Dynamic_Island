import { IActionRepository } from '@database/repository/action-repository';
import { ITodayPlanRepository } from '@database/repository/today-plan-repository';
import { GoalAction, TodayPlan, TodayPlanBucket } from '@shared/types';
import { toLocalDate } from '../time/local-date';
import { OperationRecorder } from '../sync/operation-recorder';

const TODAY_CAPACITY = 3;

export class TodayService {
  private readonly listeners = new Set<() => void>();

  constructor(private readonly actions: IActionRepository, private readonly plans: ITodayPlanRepository, private readonly operationRecorder?: OperationRecorder) {}

  subscribe(listener: () => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }

  getPlan(date = toLocalDate()): TodayPlan {
    return this.plans.get(date) ?? { date, entries: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }

  planAction(actionId: string, date = toLocalDate()): TodayPlan {
    const action = this.requireOpenAction(actionId);
    const plan = this.getPlan(date);
    const existing = plan.entries.find((entry) => entry.actionId === action.id);
    if (existing) return plan;
    const todayEntries = plan.entries.filter((entry) => entry.bucket === 'today');
    const hasGoalToday = todayEntries.some((entry) => this.actions.getById(entry.actionId)?.goalId === action.goalId);
    const bucket: TodayPlanBucket = todayEntries.length < TODAY_CAPACITY && !hasGoalToday ? 'today' : 'later';
    const next = this.persist({ ...plan, entries: [...plan.entries, { actionId, bucket, sortOrder: this.nextOrder(plan, bucket) }], updatedAt: new Date().toISOString() });
    return next;
  }

  move(actionId: string, bucket: TodayPlanBucket, date = toLocalDate()): TodayPlan {
    const plan = this.getPlan(date);
    const entry = plan.entries.find((item) => item.actionId === actionId);
    if (!entry) throw new Error('Action is not planned for this day');
    const action = this.requireOpenAction(actionId);
    if (bucket === 'today') {
      const today = plan.entries.filter((item) => item.bucket === 'today' && item.actionId !== actionId);
      if (today.length >= TODAY_CAPACITY) throw new Error('Today already has three commitments');
      if (today.some((item) => this.actions.getById(item.actionId)?.goalId === action.goalId)) throw new Error('A goal can have one commitment today');
    }
    return this.persist({ ...plan, entries: plan.entries.map((item) => item.actionId === actionId ? { ...item, bucket, sortOrder: this.nextOrder(plan, bucket) } : item), updatedAt: new Date().toISOString() });
  }

  remove(actionId: string, date = toLocalDate()): TodayPlan {
    const plan = this.getPlan(date);
    return this.persist({ ...plan, entries: plan.entries.filter((entry) => entry.actionId !== actionId), updatedAt: new Date().toISOString() });
  }

  /** Move an open action to another local day. It is intentionally a plan
   * decision, not a failed check-in or an automatic streak penalty. */
  reschedule(actionId: string, targetDate: string, sourceDate = toLocalDate()): TodayPlan {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) throw new Error('Reschedule date must use YYYY-MM-DD');
    this.requireOpenAction(actionId);
    if (targetDate === sourceDate) return this.getPlan(sourceDate);
    const source = this.getPlan(sourceDate);
    if (!source.entries.some((entry) => entry.actionId === actionId)) throw new Error('Action is not planned for this day');
    this.persist({ ...source, entries: source.entries.filter((entry) => entry.actionId !== actionId), updatedAt: new Date().toISOString() });
    return this.planAction(actionId, targetDate);
  }

  private persist(plan: TodayPlan): TodayPlan { this.plans.save(plan); this.operationRecorder?.record({ entityType: 'today-plan', entityId: plan.date, kind: 'upsert', payload: plan as unknown as Record<string, unknown> }); this.notify(); return plan; }
  private requireOpenAction(id: string): GoalAction { const action = this.actions.getById(id); if (!action) throw new Error(`Action not found: ${id}`); if (action.status !== 'open') throw new Error('Only open actions can be planned'); return action; }
  private nextOrder(plan: TodayPlan, bucket: TodayPlanBucket): number { return Math.max(-1, ...plan.entries.filter((entry) => entry.bucket === bucket).map((entry) => entry.sortOrder)) + 1; }
  private notify(): void { for (const listener of this.listeners) listener(); }
}
