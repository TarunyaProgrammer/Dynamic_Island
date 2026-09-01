// packages/core/models/milestone.ts
import { Milestone } from '@shared/types';
import { randomUUID } from 'crypto';

export class MilestoneEntity implements Milestone {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
  targetContribution?: number;
  createdAt: string;
  completedAt?: string;

  constructor(data: Milestone) {
    this.id = data.id;
    this.goalId = data.goalId;
    this.title = data.title;
    this.isCompleted = data.isCompleted;
    this.targetContribution = data.targetContribution;
    this.createdAt = data.createdAt;
    this.completedAt = data.completedAt;
  }

  static create(goalId: string, title: string, targetContribution?: number): MilestoneEntity {
    return new MilestoneEntity({
      id: randomUUID(),
      goalId,
      title: title.trim(),
      isCompleted: false,
      targetContribution: targetContribution && targetContribution > 0 ? targetContribution : undefined,
      createdAt: new Date().toISOString(),
    });
  }

  toggle(): MilestoneEntity {
    const isCompleted = !this.isCompleted;
    return new MilestoneEntity({
      ...this,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    });
  }
}
