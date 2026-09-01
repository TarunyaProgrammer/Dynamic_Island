// packages/core/models/progress-event.ts
import { ProgressEvent } from '@shared/types';
import { randomUUID } from 'crypto';

export class ProgressEventEntity implements ProgressEvent {
  id: string;
  goalId: string;
  previousValue: number;
  newValue: number;
  delta: number;
  resultingValue: number;
  timestamp: string;
  note?: string;

  constructor(data: ProgressEvent) {
    this.id = data.id;
    this.goalId = data.goalId;
    this.previousValue = data.previousValue;
    this.newValue = data.newValue;
    this.delta = data.delta;
    this.resultingValue = data.resultingValue;
    this.timestamp = data.timestamp;
    this.note = data.note;
  }

  static create(goalId: string, previousValue: number, delta: number, note?: string): ProgressEventEntity {
    const newValue = Math.max(0, previousValue + delta);
    return new ProgressEventEntity({
      id: randomUUID(),
      goalId,
      previousValue,
      newValue,
      delta,
      resultingValue: newValue,
      timestamp: new Date().toISOString(),
      note: note?.trim(),
    });
  }
}
