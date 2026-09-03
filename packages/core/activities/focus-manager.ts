// packages/core/activities/focus-manager.ts - Goal-Linked Focus Session Engine
import { FocusSessionState, FocusCompletedEvent } from '@shared/types';
import { GoalService } from '../services/goal-service';
import { ActivityEngine } from './activity-engine';

export class FocusSessionManager {
  private timer: NodeJS.Timeout | null = null;
  private state: FocusSessionState = {
    durationSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    isActive: false,
    isPaused: false,
  };
  private tickListeners: Set<(state: FocusSessionState) => void> = new Set();
  private completionListeners: Set<(event: FocusCompletedEvent) => void> = new Set();

  constructor(
    private goalService: GoalService,
    private activityEngine: ActivityEngine
  ) {}

  subscribe(listener: (state: FocusSessionState) => void): () => void {
    this.tickListeners.add(listener);
    return () => this.tickListeners.delete(listener);
  }

  onComplete(listener: (event: FocusCompletedEvent) => void): () => void {
    this.completionListeners.add(listener);
    return () => this.completionListeners.delete(listener);
  }

  private notify(): void {
    const s = this.getState();
    for (const listener of this.tickListeners) {
      try {
        listener(s);
      } catch (err) {
        console.error('Error notifying focus listener:', err);
      }
    }
  }

  getState(): FocusSessionState {
    return { ...this.state };
  }

  start(durationMinutes = 25, goalId?: string): FocusSessionState {
    this.stop();

    let goalName: string | undefined;
    if (goalId) {
      const goal = this.goalService.getGoal(goalId);
      if (goal) {
        goalName = goal.name;
      }
    }

    const durationSeconds = Math.max(60, durationMinutes * 60);
    this.state = {
      goalId,
      goalName,
      durationSeconds,
      remainingSeconds: durationSeconds,
      isActive: true,
      isPaused: false,
    };

    this.activityEngine.push({
      id: 'beacon-focus-live',
      type: 'focus',
      priority: 'high',
      title: `Focus: ${goalName || 'Session'}`,
      subtitle: `${durationMinutes}m sprint in progress`,
      progressFraction: 0,
      timestamp: new Date().toISOString(),
    });

    this.timer = setInterval(() => {
      this.tick();
    }, 1000);

    this.notify();
    return this.getState();
  }

  pause(): FocusSessionState {
    if (this.state.isActive && !this.state.isPaused) {
      this.state.isPaused = true;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.notify();
    }
    return this.getState();
  }

  resume(): FocusSessionState {
    if (this.state.isActive && this.state.isPaused) {
      this.state.isPaused = false;
      this.timer = setInterval(() => {
        this.tick();
      }, 1000);
      this.notify();
    }
    return this.getState();
  }

  extend(minutes = 5): FocusSessionState {
    if (this.state.isActive) {
      const extraSeconds = Math.max(60, minutes * 60);
      this.state.durationSeconds += extraSeconds;
      this.state.remainingSeconds += extraSeconds;
      this.notify();
    }
    return this.getState();
  }

  stop(commitProgress = true): FocusSessionState {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.state.isActive && commitProgress && this.state.goalId) {
      const elapsedMinutes = Math.round((this.state.durationSeconds - this.state.remainingSeconds) / 60);
      if (elapsedMinutes > 0) {
        try {
          this.goalService.incrementProgress(
            this.state.goalId,
            elapsedMinutes,
            `Focus session (+${elapsedMinutes}m)`
          );
        } catch (err) {
          console.error('Failed to commit focus session progress to goal:', err);
        }
      }
    }

    this.activityEngine.dismiss('beacon-focus-live');

    this.state = {
      durationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      isActive: false,
      isPaused: false,
    };

    this.notify();
    return this.getState();
  }

  private tick(): void {
    if (!this.state.isActive || this.state.isPaused) return;

    if (this.state.remainingSeconds > 1) {
      this.state.remainingSeconds -= 1;
      const elapsed = this.state.durationSeconds - this.state.remainingSeconds;
      const fraction = elapsed / this.state.durationSeconds;

      this.activityEngine.push({
        id: 'beacon-focus-live',
        type: 'focus',
        priority: 'high',
        title: `Focus: ${this.state.goalName || 'Session'}`,
        subtitle: `${Math.floor(this.state.remainingSeconds / 60)}:${(this.state.remainingSeconds % 60).toString().padStart(2, '0')}`,
        progressFraction: fraction,
        timestamp: new Date().toISOString(),
      });

      this.notify();
    } else {
      // Completed!
      const totalMins = Math.round(this.state.durationSeconds / 60);
      const goalId = this.state.goalId;
      const goalName = this.state.goalName;

      this.stop(true);

      const completionEvent: FocusCompletedEvent = {
        goalId,
        goalName,
        durationMinutes: totalMins,
        timestamp: new Date().toISOString(),
      };

      for (const listener of this.completionListeners) {
        try {
          listener(completionEvent);
        } catch (err) {
          console.error('Error notifying focus completion listener:', err);
        }
      }

      // Push completion notification
      this.activityEngine.push(
        {
          id: `beacon-focus-done-${Date.now()}`,
          type: 'focus',
          priority: 'critical',
          title: 'Focus Sprint Complete! 🎉',
          subtitle: `Logged +${totalMins}m to ${goalName || 'Focus Sprint'}`,
          progressFraction: 1,
          timestamp: new Date().toISOString(),
        },
        8000 // auto-dismiss in 8s
      );
    }
  }
}

export { FocusSessionManager as FocusManager };
