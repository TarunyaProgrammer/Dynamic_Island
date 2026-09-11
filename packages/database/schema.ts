// packages/database/schema.ts - SQLite Schema DDL & Migrations

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'numeric',
  current_value REAL NOT NULL DEFAULT 0,
  target_value REAL NOT NULL DEFAULT 0,
  unit TEXT,
  default_increment REAL NOT NULL DEFAULT 1,
  start_date TEXT NOT NULL,
  deadline TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  category TEXT,
  paradigm TEXT NOT NULL DEFAULT 'accumulative',
  area TEXT NOT NULL DEFAULT 'Personal',
  priority TEXT NOT NULL DEFAULT 'normal',
  period TEXT NOT NULL DEFAULT 'total',
  schedule_config TEXT,
  streak_config TEXT,
  paused_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  weight REAL,
  target_contribution REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress_events (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  previous_value REAL NOT NULL,
  new_value REAL NOT NULL,
  delta REAL NOT NULL,
  resulting_value REAL NOT NULL,
  timestamp TEXT NOT NULL,
  note TEXT,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goal_checkins (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  date TEXT NOT NULL,
  state TEXT NOT NULL,
  value REAL NOT NULL DEFAULT 0,
  skip_reason TEXT,
  note TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
  UNIQUE(goal_id, date)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credentials (
  key TEXT PRIMARY KEY,
  encrypted_data TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS goal_actions (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  planned_date TEXT,
  scheduled_start TEXT,
  scheduled_end TEXT,
  estimated_minutes INTEGER,
  source TEXT NOT NULL DEFAULT 'manual',
  external_link TEXT,
  external_source_id TEXT,
  completed_at TEXT,
  skipped_at TEXT,
  skip_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS today_plans (
  date TEXT PRIMARY KEY,
  intention TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS today_plan_actions (
  plan_date TEXT NOT NULL,
  action_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'today',
  PRIMARY KEY (plan_date, action_id),
  FOREIGN KEY (plan_date) REFERENCES today_plans(date) ON DELETE CASCADE,
  FOREIGN KEY (action_id) REFERENCES goal_actions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goal_reminder_policies (
  goal_id TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  time TEXT,
  weekdays TEXT,
  only_when_incomplete INTEGER NOT NULL DEFAULT 1,
  quiet_start TEXT,
  quiet_end TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_operations (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL,
  acknowledged_at TEXT,
  UNIQUE(device_id, sequence)
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  goal_id TEXT,
  action_id TEXT,
  duration_minutes INTEGER NOT NULL,
  completed_at TEXT NOT NULL
);
`;

export const MIGRATION_SQL: string[] = [
  `ALTER TABLE goals ADD COLUMN paradigm TEXT NOT NULL DEFAULT 'accumulative'`,
  `ALTER TABLE goals ADD COLUMN area TEXT NOT NULL DEFAULT 'Personal'`,
  `ALTER TABLE goals ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal'`,
  `ALTER TABLE goals ADD COLUMN period TEXT NOT NULL DEFAULT 'total'`,
  `ALTER TABLE goals ADD COLUMN schedule_config TEXT`,
  `ALTER TABLE goals ADD COLUMN streak_config TEXT`,
  `ALTER TABLE goals ADD COLUMN paused_until TEXT`,
  `ALTER TABLE milestones ADD COLUMN weight REAL`,
  `ALTER TABLE milestones ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE goal_actions ADD COLUMN external_source_id TEXT`,
];

export const INDEXES_SQL: string[] = [
  `CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status)`,
  `CREATE INDEX IF NOT EXISTS idx_goals_paradigm ON goals(paradigm)`,
  `CREATE INDEX IF NOT EXISTS idx_goals_area ON goals(area)`,
  `CREATE INDEX IF NOT EXISTS idx_goals_updated_at ON goals(updated_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON milestones(goal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_progress_events_goal_id ON progress_events(goal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_progress_events_timestamp ON progress_events(timestamp DESC)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_goal_date ON goal_checkins(goal_id, date)`,
  `CREATE INDEX IF NOT EXISTS idx_checkins_goal_id ON goal_checkins(goal_id)`,
  `CREATE INDEX IF NOT EXISTS idx_checkins_date ON goal_checkins(date DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_goal_actions_goal_id ON goal_actions(goal_id, status, updated_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_goal_actions_planned_date ON goal_actions(planned_date, status)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_goal_actions_external_source ON goal_actions(external_source_id) WHERE external_source_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_today_plan_actions_order ON today_plan_actions(plan_date, bucket, sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_sync_operations_unacknowledged ON sync_operations(acknowledged_at, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_focus_sessions_completed ON focus_sessions(completed_at DESC)`,
];
