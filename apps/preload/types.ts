// apps/preload/types.ts - Typed Preload Bridge Interface
import { AppSettings, BeaconStats, Goal, GoalDraft, GoalStatus, GoalUpdateDraft, Milestone, ProgressEvent } from '@shared/types';

export interface BeaconApi {
  // Goal CRUD & Progress
  goals: {
    list: (status?: GoalStatus) => Promise<Goal[]>;
    get: (id: string) => Promise<Goal | null>;
    create: (draft: GoalDraft) => Promise<Goal>;
    update: (id: string, update: GoalUpdateDraft) => Promise<Goal>;
    delete: (id: string) => Promise<boolean>;
    complete: (id: string) => Promise<Goal>;
    archive: (id: string) => Promise<Goal>;
    increment: (goalId: string, delta?: number, note?: string) => Promise<Goal>;
    setProgress: (goalId: string, value: number, note?: string) => Promise<Goal>;
  };

  // Milestones
  milestones: {
    create: (goalId: string, title: string, targetContribution?: number) => Promise<Milestone>;
    toggle: (goalId: string, milestoneId: string) => Promise<Goal>;
    delete: (goalId: string, milestoneId: string) => Promise<Goal>;
  };

  // History & Undo/Redo
  history: {
    getEvents: (goalId?: string, limit?: number) => Promise<ProgressEvent[]>;
    undo: () => Promise<boolean>;
    redo: () => Promise<boolean>;
  };

  // Statistics
  stats: {
    get: () => Promise<BeaconStats>;
  };

  // Settings
  settings: {
    get: () => Promise<AppSettings>;
    update: (partial: Partial<AppSettings>) => Promise<AppSettings>;
  };

  // Live Activities & Priority Stacking
  activities: {
    getStack: () => Promise<import('@shared/types').LiveActivity[]>;
    push: (activity: import('@shared/types').LiveActivity, ttlMs?: number) => Promise<void>;
    dismiss: (id: string) => Promise<boolean>;
  };

  // Focus Sessions
  focus: {
    start: (durationMinutes?: number, goalId?: string) => Promise<import('@shared/types').FocusSessionState>;
    pause: () => Promise<import('@shared/types').FocusSessionState>;
    resume: () => Promise<import('@shared/types').FocusSessionState>;
    stop: (commitProgress?: boolean) => Promise<import('@shared/types').FocusSessionState>;
    extend: (minutes?: number) => Promise<import('@shared/types').FocusSessionState>;
    getState: () => Promise<import('@shared/types').FocusSessionState>;
  };

  // macOS Media Controls
  media: {
    getState: () => Promise<import('@shared/types').MediaActivityState>;
    playPause: () => Promise<import('@shared/types').MediaActivityState>;
    next: () => Promise<import('@shared/types').MediaActivityState>;
    previous: () => Promise<import('@shared/types').MediaActivityState>;
    setVolume: (volume: number) => Promise<import('@shared/types').MediaActivityState>;
  };

  // Window Controls
  windows: {
    toggleMain: () => Promise<void>;
    togglePalette: () => Promise<void>;
    toggleIsland: () => Promise<void>;
    setIslandExpanded: (expanded: boolean) => Promise<void>;
    hidePopover: () => Promise<void>;
    quitApp: () => Promise<void>;
  };

  // Event Subscriptions
  onGoalsChanged: (callback: () => void) => () => void;
  onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
  onActivitiesChanged: (callback: (stack: import('@shared/types').LiveActivity[]) => void) => () => void;
  onFocusTick: (callback: (state: import('@shared/types').FocusSessionState) => void) => () => void;
  onMediaChanged: (callback: (state: import('@shared/types').MediaActivityState) => void) => () => void;
}

declare global {
  interface Window {
    beacon: BeaconApi;
  }
}
