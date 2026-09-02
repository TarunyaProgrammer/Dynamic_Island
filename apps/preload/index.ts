// apps/preload/index.ts - Secure Context-Isolated Preload Bridge
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc-channels';
import { AppSettings, GoalDraft, GoalStatus, GoalUpdateDraft } from '@shared/types';
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
    start: (durationMinutes?: number, goalId?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FOCUS_START, durationMinutes, goalId),
    pause: () => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_PAUSE),
    resume: () => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_RESUME),
    stop: (commitProgress?: boolean) => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_STOP, commitProgress),
    extend: (minutes?: number) => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_EXTEND, minutes),
    getState: () => ipcRenderer.invoke(IPC_CHANNELS.FOCUS_GET_STATE),
  },

  media: {
    getState: () => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_GET_STATE),
    playPause: () => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_PLAY_PAUSE),
    next: () => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_NEXT),
    previous: () => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_PREVIOUS),
    setVolume: (volume: number) => ipcRenderer.invoke(IPC_CHANNELS.MEDIA_SET_VOLUME, volume),
  },

  windows: {
    toggleMain: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_MAIN),
    togglePalette: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_PALETTE),
    toggleIsland: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_TOGGLE_ISLAND),
    setIslandExpanded: (expanded: boolean) => ipcRenderer.invoke(IPC_CHANNELS.ISLAND_SET_EXPANDED, expanded),
    hidePopover: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_HIDE_POPOVER),
    quitApp: () => ipcRenderer.invoke(IPC_CHANNELS.APP_QUIT),
  },

  onGoalsChanged: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.EVENT_GOALS_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.EVENT_GOALS_CHANGED, handler);
    };
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

  onMediaChanged: (callback: (state: any) => void) => {
    const handler = (_: any, state: any) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.EVENT_MEDIA_CHANGED, handler);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.EVENT_MEDIA_CHANGED, handler);
    };
  },
};

contextBridge.exposeInMainWorld('beacon', api);
