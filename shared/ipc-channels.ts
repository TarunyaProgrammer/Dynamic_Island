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
  ISLAND_SET_EXPANDED: 'beacon:island:set-expanded',

  // Live Activities & Focus Sessions
  ACTIVITIES_GET_STACK: 'beacon:activities:get-stack',
  ACTIVITIES_PUSH: 'beacon:activities:push',
  ACTIVITIES_DISMISS: 'beacon:activities:dismiss',
  FOCUS_START: 'beacon:focus:start',
  FOCUS_PAUSE: 'beacon:focus:pause',
  FOCUS_RESUME: 'beacon:focus:resume',
  FOCUS_STOP: 'beacon:focus:stop',
  FOCUS_EXTEND: 'beacon:focus:extend',
  FOCUS_GET_STATE: 'beacon:focus:get-state',

  // macOS Media Controls
  MEDIA_GET_STATE: 'beacon:media:get-state',
  MEDIA_PLAY_PAUSE: 'beacon:media:play-pause',
  MEDIA_NEXT: 'beacon:media:next',
  MEDIA_PREVIOUS: 'beacon:media:previous',
  MEDIA_SET_VOLUME: 'beacon:media:set-volume',

  // Companion Presence
  COMPANION_EMIT: 'beacon:companion:emit',

  // AI & Companion Intelligence
  AI_GET_CONFIG: 'beacon:ai:get-config',
  AI_UPDATE_CONFIG: 'beacon:ai:update-config',
  AI_SET_KEY: 'beacon:ai:set-key',
  AI_REMOVE_KEY: 'beacon:ai:remove-key',
  AI_TEST_CONNECTION: 'beacon:ai:test-connection',
  AI_EXECUTE_PROMPT: 'beacon:ai:execute-prompt',

  // Broadcast Events (Main -> Renderer)
  EVENT_GOALS_CHANGED: 'beacon:event:goals-changed',
  EVENT_SETTINGS_CHANGED: 'beacon:event:settings-changed',
  EVENT_ACTIVITIES_CHANGED: 'beacon:event:activities-changed',
  EVENT_FOCUS_TICK: 'beacon:event:focus-tick',
  EVENT_FOCUS_COMPLETED: 'beacon:event:focus-completed',
  EVENT_MEDIA_CHANGED: 'beacon:event:media-changed',
  EVENT_COMPANION_CHANGED: 'beacon:event:companion-changed',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
