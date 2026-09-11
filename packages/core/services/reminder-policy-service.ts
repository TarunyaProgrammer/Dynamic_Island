import { ReminderPolicy, Weekday } from '@shared/types';
import { ReminderPolicyRepository } from '@database/repository/reminder-policy-repository';
import { OperationRecorder } from '../sync/operation-recorder';

export class ReminderPolicyService {
  private readonly listeners = new Set<() => void>();
  constructor(private readonly repository: ReminderPolicyRepository, private readonly operationRecorder?: OperationRecorder) {}
  subscribe(listener: () => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  get(goalId: string): ReminderPolicy | null { return this.repository.get(goalId); }
  save(input: Omit<ReminderPolicy, 'updatedAt'>): ReminderPolicy {
    validateTime(input.time); validateTime(input.quietStart); validateTime(input.quietEnd);
    const policy = { ...input, weekdays: input.weekdays?.filter(isWeekday), updatedAt: new Date().toISOString() };
    this.repository.save(policy);
    this.operationRecorder?.record({ entityType: 'reminder-policy', entityId: policy.goalId, kind: 'upsert', payload: policy as unknown as Record<string, unknown> });
    for (const listener of this.listeners) listener(); return policy;
  }
}
function validateTime(value?: string): void { if (value !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Reminder time must use HH:MM'); }
function isWeekday(value: number): value is Weekday { return Number.isInteger(value) && value >= 0 && value <= 6; }
