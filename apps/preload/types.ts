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

  // Window Controls
  windows: {
    toggleMain: () => Promise<void>;
    togglePalette: () => Promise<void>;
    toggleIsland: () => Promise<void>;
    hidePopover: () => Promise<void>;
    quitApp: () => Promise<void>;
  };

  // Event Subscriptions
  onGoalsChanged: (callback: () => void) => () => void;
  onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
}

declare global {
  interface Window {
    beacon: BeaconApi;
  }
}
