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
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
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
];
