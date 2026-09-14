// apps/preload/index.ts - Secure Context-Isolated Preload Bridge
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc-channels';
import { AppSettings, CompanionEvent, GoalDraft, GoalStatus, GoalUpdateDraft } from '@shared/types';
import { BeaconApi } from './types';

const api: BeaconApi = {
  goals: {
    list: (status?: GoalStatus) => ipcRenderer.invoke(IPC_CHANNELS.GOALS_LIST, status),
    get: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GOALS_GET, id),
    create: (draft: GoalDraft) => ipcRenderer.invoke(IPC_CHANNELS.GOALS_CREATE, draft),
    update: (id: string, update: GoalUpdateDraft) => ipcRenderer.invoke(IPC_CHANNELS.GOALS_UPDATE, id, update),
    delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GOALS_DELETE, id),
    complete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GOALS_COMPLETE, id),
    archive: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GOALS_ARCHIVE, id),
    increment: (goalId: string, delta?: number, note?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GOALS_INCREMENT, goalId, delta, note),
    setProgress: (goalId: string, value: number, note?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GOALS_SET_PROGRESS, goalId, value, note),
  },

  actions: {
    get: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.ACTIONS_GET, id),
    listForGoal: (goalId: string) => ipcRenderer.invoke(IPC_CHANNELS.ACTIONS_LIST_FOR_GOAL, goalId),
    listOpenForGoals: (goalIds: string[]) => ipcRenderer.invoke(IPC_CHANNELS.ACTIONS_LIST_OPEN_FOR_GOALS, goalIds),
    create: (input: any) => ipcRenderer.invoke(IPC_CHANNELS.ACTIONS_CREATE, input),
    update: (id: string, input: any) => ipcRenderer.invoke(IPC_CHANNELS.ACTIONS_UPDATE, id, input),
    complete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.ACTIONS_COMPLETE, id),
    skip: (id: string, reason?: any) => ipcRenderer.invoke(IPC_CHANNELS.ACTIONS_SKIP, id, reason),
    archive: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.ACTIONS_ARCHIVE, id),
  },

  today: {
    get: (date?: string) => ipcRenderer.invoke(IPC_CHANNELS.TODAY_GET, date),
    planAction: (actionId: string, date?: string) => ipcRenderer.invoke(IPC_CHANNELS.TODAY_PLAN_ACTION, actionId, date),
    moveAction: (actionId: string, bucket: any, date?: string) => ipcRenderer.invoke(IPC_CHANNELS.TODAY_MOVE_ACTION, actionId, bucket, date),
    removeAction: (actionId: string, date?: string) => ipcRenderer.invoke(IPC_CHANNELS.TODAY_REMOVE_ACTION, actionId, date),
    rescheduleAction: (actionId: string, targetDate: string, sourceDate?: string) => ipcRenderer.invoke(IPC_CHANNELS.TODAY_RESCHEDULE_ACTION, actionId, targetDate, sourceDate),
  },

  reminders: {
    getPolicy: (goalId: string) => ipcRenderer.invoke(IPC_CHANNELS.REMINDERS_GET_POLICY, goalId),
    savePolicy: (policy: any) => ipcRenderer.invoke(IPC_CHANNELS.REMINDERS_SAVE_POLICY, policy),
  },

  review: { getWeekly: () => ipcRenderer.invoke(IPC_CHANNELS.WEEKLY_REVIEW_GET) },

  data: {
    createBackup: () => ipcRenderer.invoke(IPC_CHANNELS.DATA_CREATE_BACKUP),
    exportJson: () => ipcRenderer.invoke(IPC_CHANNELS.DATA_EXPORT_JSON),
    exportCsv: (kind: 'goals' | 'progress') => ipcRenderer.invoke(IPC_CHANNELS.DATA_EXPORT_CSV, kind),
    previewImport: () => ipcRenderer.invoke(IPC_CHANNELS.DATA_PREVIEW_IMPORT),
    importJson: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.DATA_IMPORT_JSON, filePath),
  },
  apple: {
    calendarToday: () => ipcRenderer.invoke(IPC_CHANNELS.APPLE_CALENDAR_TODAY),
    openCalendarSettings: () => ipcRenderer.invoke(IPC_CHANNELS.APPLE_OPEN_CALENDAR_SETTINGS),
    reminders: () => ipcRenderer.invoke(IPC_CHANNELS.APPLE_REMINDERS_LIST),
    importReminder: (goalId: string, reminder: any) => ipcRenderer.invoke(IPC_CHANNELS.APPLE_REMINDERS_IMPORT, goalId, reminder),
  },

  milestones: {
    create: (goalId: string, title: string, targetContribution?: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.MILESTONES_CREATE, goalId, title, targetContribution),
    toggle: (goalId: string, milestoneId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.MILESTONES_TOGGLE, goalId, milestoneId),
    delete: (goalId: string, milestoneId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.MILESTONES_DELETE, goalId, milestoneId),
  },

  history: {
    getEvents: (goalId?: string, limit?: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.HISTORY_EVENTS, goalId, limit),
    undo: () => ipcRenderer.invoke(IPC_CHANNELS.HISTORY_UNDO),
    redo: () => ipcRenderer.invoke(IPC_CHANNELS.HISTORY_REDO),
  },

  stats: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.STATS_GET),
  },

  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    update: (partial: Partial<AppSettings>) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, partial),
  },

  activities: {
    getStack: () => ipcRenderer.invoke(IPC_CHANNELS.ACTIVITIES_GET_STACK),
    push: (activity: any, ttlMs?: number) => ipcRenderer.invoke(IPC_CHANNELS.ACTIVITIES_PUSH, activity, ttlMs),
    dismiss: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.ACTIVITIES_DISMISS, id),
  },

  focus: {
    start: (durationMinutes?: number, goalId?: string, actionId?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FOCUS_START, durationMinutes, goalId, actionId),
    pause: () => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_PAUSE),
    resume: () => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_RESUME),
    stop: (commitProgress?: boolean) => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_STOP, commitProgress),
    extend: (minutes?: number) => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_EXTEND, minutes),
    getState: () => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_GET_STATE),
  },

  companion: {
    emit: (event: CompanionEvent) => ipcRenderer.invoke(IPC_CHANNELS.COMPANION_EMIT, event),
  },

  ai: {
    getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.AI_GET_CONFIG),
    updateConfig: (partial: any) => ipcRenderer.invoke(IPC_CHANNELS.AI_UPDATE_CONFIG, partial),
    setKey: (provider: any, key: string) => ipcRenderer.invoke(IPC_CHANNELS.AI_SET_KEY, provider, key),
    removeKey: (provider: any) => ipcRenderer.invoke(IPC_CHANNELS.AI_REMOVE_KEY, provider),
    testConnection: (provider: any) => ipcRenderer.invoke(IPC_CHANNELS.AI_TEST_CONNECTION, provider),
    executePrompt: (prompt: string, history?: any[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.AI_EXECUTE_PROMPT, prompt, history),
  },

  windows: {
    toggleMain: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_MAIN),
    togglePalette: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_PALETTE),
    toggleIsland: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_ISLAND),
    setIslandExpanded: (expanded: boolean) => ipcRenderer.invoke(IPC_CHANNELS.ISLAND_SET_EXPANDED, expanded),
    hidePopover: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_HIDE_POPOVER),
    quitApp: () => ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT),
  },

  calendar: {
    getEvents: (startIso: string, endIso: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_GET_EVENTS, startIso, endIso),
    getCalendars: () => ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_GET_CALENDARS),
    googleAuth: {
      start: () => ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_GOOGLE_AUTH_START),
      status: () => ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_GOOGLE_AUTH_STATUS),
      disconnect: () => ipcRenderer.invoke(IPC_CHANNELS.CALENDAR_GOOGLE_DISCONNECT),
    },
  },

  app: {
    setOpenAtLogin: (enabled: boolean) => ipcRenderer.invoke(IPC_CHANNELS.APP_OPEN_AT_LOGIN_SET, enabled),
    checkForUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.APP_CHECK_FOR_UPDATE),
    getVersion: () => process.env.npm_package_version ?? '1.0.0',
  },

  onGoalsChanged: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.EVENT_GOALS_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.EVENT_GOALS_CHANGED, handler);
    };
  },

  onTodayChanged: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.EVENT_TODAY_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_TODAY_CHANGED, handler);
  },

  onNavigate: (callback: (surface: 'today' | 'goals' | 'focus' | 'review') => void) => {
    const handler = (_: any, surface: 'today' | 'goals' | 'focus' | 'review') => callback(surface);
    ipcRenderer.on(IPC_CHANNELS.EVENT_NAVIGATE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_NAVIGATE, handler);
  },

  onRemindersChanged: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.EVENT_REMINDERS_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_REMINDERS_CHANGED, handler);
  },

  onSettingsChanged: (callback: (settings: AppSettings) => void) => {
    const handler = (_: any, settings: AppSettings) => callback(settings);
    ipcRenderer.on(IPC_CHANNELS.EVENT_SETTINGS_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.EVENT_SETTINGS_CHANGED, handler);
    };
  },

  onActivitiesChanged: (callback: (stack: any[]) => void) => {
    const handler = (_: any, stack: any[]) => callback(stack);
    ipcRenderer.on(IPC_CHANNELS.EVENT_ACTIVITIES_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.EVENT_ACTIVITIES_CHANGED, handler);
    };
  },

  onFocusTick: (callback: (state: any) => void) => {
    const handler = (_: any, state: any) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.EVENT_FOCUS_TICK, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.EVENT_FOCUS_TICK, handler);
    };
  },

  onFocusCompleted: (callback: (event: any) => void) => {
    const handler = (_: any, event: any) => callback(event);
    ipcRenderer.on(IPC_CHANNELS.EVENT_FOCUS_COMPLETED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.EVENT_FOCUS_COMPLETED, handler);
    };
  },

  onCompanionChanged: (callback: (event: CompanionEvent) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, value: CompanionEvent) => callback(value);
    ipcRenderer.on(IPC_CHANNELS.EVENT_COMPANION_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.EVENT_COMPANION_CHANGED, handler);
    };
  },

  onCalendarChanged: (callback: (payload: any) => void) => {
    const handler = (_: any, payload: any) => callback(payload);
    ipcRenderer.on(IPC_CHANNELS.EVENT_CALENDAR_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.EVENT_CALENDAR_CHANGED, handler);
  },
};

contextBridge.exposeInMainWorld('beacon', api);
