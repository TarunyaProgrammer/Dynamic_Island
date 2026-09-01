// packages/core/models/goal.ts
import { Goal, GoalDraft, GoalStatus, GoalType, Milestone } from '@shared/types';
import { randomUUID } from 'crypto';

export class GoalEntity implements Goal {
  id: string;
  name: string;
  description?: string;
  type: GoalType;
  currentValue: number;
  targetValue: number;
  unit?: string;
  defaultIncrement: number;
  startDate: string;
  deadline?: string;
  status: GoalStatus;
  category?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;

  constructor(data: Goal) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.currentValue = data.currentValue;
    this.targetValue = data.targetValue;
    this.unit = data.unit;
    this.defaultIncrement = data.defaultIncrement;
    this.startDate = data.startDate;
    this.deadline = data.deadline;
    this.status = data.status;
    this.category = data.category;
    this.milestones = data.milestones || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static createFromDraft(draft: GoalDraft): GoalEntity {
    const now = new Date().toISOString();
    const id = randomUUID();
    const milestones: Milestone[] = (draft.milestones || []).map((m) => ({
      id: randomUUID(),
      goalId: id,
      title: m.title,
      isCompleted: false,
      targetContribution: m.targetContribution,
      createdAt: now,
    }));

    return new GoalEntity({
      id,
      name: draft.name.trim(),
      description: draft.description?.trim(),
      type: draft.type,
      currentValue: Math.max(0, draft.currentValue ?? 0),
      targetValue: Math.max(0, draft.targetValue),
      unit: draft.unit?.trim(),
      defaultIncrement: draft.defaultIncrement && draft.defaultIncrement > 0 ? draft.defaultIncrement : 1,
      startDate: draft.startDate || now,
      deadline: draft.deadline,
      status: 'active',
      category: draft.category?.trim(),
      milestones,
      createdAt: now,
      updatedAt: now,
    });
  }

  get progressFraction(): number {
    if (this.status === 'completed') return 1.0;
    if (this.targetValue <= 0) return 0.0;
    return Math.min(1.0, Math.max(0.0, this.currentValue / this.targetValue));
  }

  get progressPercent(): number {
    return Math.round(this.progressFraction * 100);
  }

  get isComplete(): boolean {
    return this.status === 'completed' || (this.targetValue > 0 && this.currentValue >= this.targetValue);
  }
}
