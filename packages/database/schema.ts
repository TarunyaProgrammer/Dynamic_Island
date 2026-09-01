// packages/database/schema.ts - SQLite Schema DDL & Migrations

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  current_value REAL NOT NULL DEFAULT 0,
  target_value REAL NOT NULL DEFAULT 0,
  unit TEXT,
  default_increment REAL NOT NULL DEFAULT 1,
  start_date TEXT NOT NULL,
  deadline TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  category TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_updated_at ON goals(updated_at DESC);

CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  target_contribution REAL,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_milestones_goal_id ON milestones(goal_id);

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

CREATE INDEX IF NOT EXISTS idx_progress_events_goal_id ON progress_events(goal_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_timestamp ON progress_events(timestamp DESC);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
