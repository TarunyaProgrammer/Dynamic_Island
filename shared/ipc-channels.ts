// shared/ipc-channels.ts - Strongly Typed IPC Channel Identifiers

export const IPC_CHANNELS = {
  // Goal CRUD & Progress Mutations
  GOALS_LIST: 'beacon:goals:list',
  GOALS_GET: 'beacon:goals:get',
  GOALS_CREATE: 'beacon:goals:create',
  GOALS_UPDATE: 'beacon:goals:update',
  GOALS_DELETE: 'beacon:goals:delete',
  GOALS_INCREMENT: 'beacon:goals:increment',
  GOALS_SET_PROGRESS: 'beacon:goals:set-progress',
  GOALS_COMPLETE: 'beacon:goals:complete',
  GOALS_ARCHIVE: 'beacon:goals:archive',

  // Milestones
  MILESTONES_CREATE: 'beacon:milestones:create',
  MILESTONES_TOGGLE: 'beacon:milestones:toggle',
  MILESTONES_DELETE: 'beacon:milestones:delete',

  // History & Undo/Redo
  HISTORY_EVENTS: 'beacon:history:events',
  HISTORY_UNDO: 'beacon:history:undo',
  HISTORY_REDO: 'beacon:history:redo',

  // Statistics & Summary
  STATS_GET: 'beacon:stats:get',

  // Settings
  SETTINGS_GET: 'beacon:settings:get',
  SETTINGS_UPDATE: 'beacon:settings:update',

  // Window Controls
  WINDOW_TOGGLE_MAIN: 'beacon:window:toggle-main',
  WINDOW_TOGGLE_PALETTE: 'beacon:window:toggle-palette',
  WINDOW_TOGGLE_ISLAND: 'beacon:window:toggle-island',
  WINDOW_HIDE_POPOVER: 'beacon:window:hide-popover',
  APP_QUIT: 'beacon:app:quit',

  // Broadcast Events (Main -> Renderer)
  EVENT_GOALS_CHANGED: 'beacon:event:goals-changed',
  EVENT_SETTINGS_CHANGED: 'beacon:event:settings-changed',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
