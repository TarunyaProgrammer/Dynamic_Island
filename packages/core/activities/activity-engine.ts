// packages/core/activities/activity-engine.ts - Priority Stacking Activity Engine
import { ActivityPriority, LiveActivity } from '@shared/types';

const PRIORITY_WEIGHTS: Record<ActivityPriority, number> = {
  critical: 100,
  high: 75,
  normal: 50,
  low: 25,
};

export class ActivityEngine {
  private activities: Map<string, LiveActivity> = new Map();
  private listeners: Set<(activities: LiveActivity[]) => void> = new Set();

  subscribe(listener: (activities: LiveActivity[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const stack = this.getStack();
    for (const listener of this.listeners) {
      try {
        listener(stack);
      } catch (err) {
        console.error('Error notifying activity listeners:', err);
      }
    }
  }

  push(activity: LiveActivity, ttlMs?: number): void {
    this.activities.set(activity.id, activity);
    this.notify();

    if (ttlMs && ttlMs > 0) {
      setTimeout(() => {
        this.dismiss(activity.id);
      }, ttlMs);
    }
  }

  dismiss(id: string): boolean {
    if (this.activities.has(id)) {
      this.activities.delete(id);
      this.notify();
      return true;
    }
    return false;
  }

  getStack(): LiveActivity[] {
    return Array.from(this.activities.values()).sort((a, b) => {
      const weightA = PRIORITY_WEIGHTS[a.priority] ?? 0;
      const weightB = PRIORITY_WEIGHTS[b.priority] ?? 0;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  getTopActivity(): LiveActivity | null {
    const stack = this.getStack();
    return stack.length > 0 ? stack[0] : null;
  }

  clear(): void {
    this.activities.clear();
    this.notify();
  }
}
