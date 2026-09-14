// apps/preload/types.ts - Typed Preload Bridge Interface
import { AppSettings, BeaconStats, CalendarContextEvent, CalendarEvent, CompanionEvent, ExternalReminder, Goal, GoalAction, GoalDraft, GoalStatus, GoalUpdateDraft, GoogleCalendarInfo, GoogleOAuthStatus, Milestone, ProgressEvent, ReminderPolicy, SkipReason, TodayPlan, TodayPlanBucket, WeeklyReview } from '@shared/types';

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

  actions: {
    get: (id: string) => Promise<GoalAction | null>;
    listForGoal: (goalId: string) => Promise<GoalAction[]>;
    listOpenForGoals: (goalIds: string[]) => Promise<GoalAction[]>;
    create: (input: { goalId: string; title: string; plannedDate?: string; estimatedMinutes?: number }) => Promise<GoalAction>;
    update: (id: string, input: { title?: string; plannedDate?: string; estimatedMinutes?: number }) => Promise<GoalAction>;
    complete: (id: string) => Promise<GoalAction>;
    skip: (id: string, reason?: SkipReason) => Promise<GoalAction>;
    archive: (id: string) => Promise<GoalAction>;
  };

  today: {
    get: (date?: string) => Promise<TodayPlan>;
    planAction: (actionId: string, date?: string) => Promise<TodayPlan>;
    moveAction: (actionId: string, bucket: TodayPlanBucket, date?: string) => Promise<TodayPlan>;
    removeAction: (actionId: string, date?: string) => Promise<TodayPlan>;
    rescheduleAction: (actionId: string, targetDate: string, sourceDate?: string) => Promise<TodayPlan>;
  };

  reminders: {
    getPolicy: (goalId: string) => Promise<ReminderPolicy | null>;
    savePolicy: (policy: Omit<ReminderPolicy, 'updatedAt'>) => Promise<ReminderPolicy>;
  };

  review: { getWeekly: () => Promise<WeeklyReview>; };
  data: {
    createBackup: () => Promise<string>;
    exportJson: () => Promise<string | null>;
    exportCsv: (kind: 'goals' | 'progress') => Promise<string | null>;
    previewImport: () => Promise<{ filePath: string; version: number; exportedAt: string; counts: Record<string, number> } | null>;
    importJson: (filePath: string) => Promise<void>;
  };
  apple: {
    calendarToday: () => Promise<CalendarContextEvent[]>;
    openCalendarSettings: () => Promise<void>;
    reminders: () => Promise<ExternalReminder[]>;
    importReminder: (goalId: string, reminder: ExternalReminder) => Promise<GoalAction>;
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
    start: (durationMinutes?: number, goalId?: string, actionId?: string) => Promise<import('@shared/types').FocusSessionState>;
    pause: () => Promise<import('@shared/types').FocusSessionState>;
    resume: () => Promise<import('@shared/types').FocusSessionState>;
    stop: (commitProgress?: boolean) => Promise<import('@shared/types').FocusSessionState>;
    extend: (minutes?: number) => Promise<import('@shared/types').FocusSessionState>;
    getState: () => Promise<import('@shared/types').FocusSessionState>;
  };

  // Companion Presence
  companion: {
    emit: (event: CompanionEvent) => Promise<void>;
  };

  // AI & Natural Language Companion
  ai: {
    getConfig: () => Promise<import('@core/ai/types').AIConfigSummary>;
    updateConfig: (partial: Partial<import('@core/ai/types').AIConfig>) => Promise<import('@core/ai/types').AIConfigSummary>;
    setKey: (provider: import('@core/ai/types').AIProviderId, key: string) => Promise<boolean>;
    removeKey: (provider: import('@core/ai/types').AIProviderId) => Promise<boolean>;
    testConnection: (provider: import('@core/ai/types').AIProviderId) => Promise<import('@core/ai/types').ConnectionResult>;
    executePrompt: (prompt: string, history?: import('@core/ai/types').ChatMessage[]) => Promise<import('@core/ai/types').AIPromptResult>;
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

  // Unified Calendar (Apple + Google)
  calendar: {
    getEvents: (startIso: string, endIso: string) => Promise<CalendarEvent[]>;
    getCalendars: () => Promise<GoogleCalendarInfo[]>;
    googleAuth: {
      start: () => Promise<{ success: boolean }>;
      status: () => Promise<{ status: GoogleOAuthStatus; connected: boolean }>;
      disconnect: () => Promise<{ success: boolean }>;
    };
  };

  // App system
  app: {
    setOpenAtLogin: (enabled: boolean) => Promise<{ success: boolean; openAtLogin: boolean }>;
    checkForUpdate: () => Promise<{ updateAvailable: boolean; currentVersion: string }>;
    getVersion: () => string;
  };

  // Event Subscriptions
  onGoalsChanged: (callback: () => void) => () => void;
  onTodayChanged: (callback: () => void) => () => void;
  onNavigate: (callback: (surface: 'today' | 'goals' | 'focus' | 'review' | 'calendar' | 'settings' | 'help') => void) => () => void;
  onRemindersChanged: (callback: () => void) => () => void;
  onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void;
  onActivitiesChanged: (callback: (stack: import('@shared/types').LiveActivity[]) => void) => () => void;
  onFocusTick: (callback: (state: import('@shared/types').FocusSessionState) => void) => () => void;
  onFocusCompleted: (callback: (event: import('@shared/types').FocusCompletedEvent) => void) => () => void;
  onCompanionChanged: (callback: (event: CompanionEvent) => void) => () => void;
  onCalendarChanged: (callback: (payload: any) => void) => () => void;
}

declare global {
  interface Window {
    beacon: BeaconApi;
  }
}
