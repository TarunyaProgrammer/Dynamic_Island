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

  // Goal-owned next actions and daily plan
  ACTIONS_LIST_FOR_GOAL: 'beacon:actions:list-for-goal',
  ACTIONS_LIST_OPEN_FOR_GOALS: 'beacon:actions:list-open-for-goals',
  ACTIONS_GET: 'beacon:actions:get',
  ACTIONS_CREATE: 'beacon:actions:create',
  ACTIONS_UPDATE: 'beacon:actions:update',
  ACTIONS_COMPLETE: 'beacon:actions:complete',
  ACTIONS_SKIP: 'beacon:actions:skip',
  ACTIONS_ARCHIVE: 'beacon:actions:archive',
  TODAY_GET: 'beacon:today:get',
  TODAY_PLAN_ACTION: 'beacon:today:plan-action',
  TODAY_MOVE_ACTION: 'beacon:today:move-action',
  TODAY_REMOVE_ACTION: 'beacon:today:remove-action',
  TODAY_RESCHEDULE_ACTION: 'beacon:today:reschedule-action',

  // Per-goal quiet reminder policies
  REMINDERS_GET_POLICY: 'beacon:reminders:get-policy',
  REMINDERS_SAVE_POLICY: 'beacon:reminders:save-policy',
  WEEKLY_REVIEW_GET: 'beacon:weekly-review:get',
  DATA_CREATE_BACKUP: 'beacon:data:create-backup',
  DATA_EXPORT_JSON: 'beacon:data:export-json',
  DATA_PREVIEW_IMPORT: 'beacon:data:preview-import',
  DATA_IMPORT_JSON: 'beacon:data:import-json',
  DATA_EXPORT_CSV: 'beacon:data:export-csv',
  APPLE_CALENDAR_TODAY: 'beacon:apple:calendar-today',
  APPLE_OPEN_CALENDAR_SETTINGS: 'beacon:apple:open-calendar-settings',
  APPLE_REMINDERS_LIST: 'beacon:apple:reminders-list',
  APPLE_REMINDERS_IMPORT: 'beacon:apple:reminders-import',

  // Unified Calendar (Apple + Google merged)
  CALENDAR_GET_EVENTS: 'beacon:calendar:get-events',
  CALENDAR_GET_CALENDARS: 'beacon:calendar:get-calendars',
  CALENDAR_GOOGLE_AUTH_START: 'beacon:calendar:google-auth-start',
  CALENDAR_GOOGLE_AUTH_STATUS: 'beacon:calendar:google-auth-status',
  CALENDAR_GOOGLE_DISCONNECT: 'beacon:calendar:google-disconnect',

  // App System
  APP_OPEN_AT_LOGIN_SET: 'beacon:app:set-login-item',
  APP_CHECK_FOR_UPDATE: 'beacon:app:check-update',

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
  EVENT_TODAY_CHANGED: 'beacon:event:today-changed',
  EVENT_REMINDERS_CHANGED: 'beacon:event:reminders-changed',
  EVENT_SETTINGS_CHANGED: 'beacon:event:settings-changed',
  EVENT_ACTIVITIES_CHANGED: 'beacon:event:activities-changed',
  EVENT_FOCUS_TICK: 'beacon:event:focus-tick',
  EVENT_FOCUS_COMPLETED: 'beacon:event:focus-completed',
  EVENT_COMPANION_CHANGED: 'beacon:event:companion-changed',
  EVENT_NAVIGATE: 'beacon:event:navigate',
  EVENT_CALENDAR_CHANGED: 'beacon:event:calendar-changed',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
