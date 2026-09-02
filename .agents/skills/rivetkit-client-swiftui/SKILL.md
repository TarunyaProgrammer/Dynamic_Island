---
name: sqlite-domain-persistence
description: >
  Use when designing, migrating, or querying Beacon's SQLite database layer — covering
  better-sqlite3 synchronous operations, WAL mode, foreign key cascades, schema versioning,
  idempotent DDL migrations, and repository abstractions.
---

# Beacon — SQLite Domain Persistence & Migrations

Beacon uses a local-first, zero-cloud SQLite architecture powered by `better-sqlite3`.
Data is stored locally at `~/Library/Application Support/Beacon/beacon.sqlite`.

---

## Connection & Pragma Configuration

```ts
// packages/database/connection.ts
const db = new Database(targetPath);
db.pragma('journal_mode = WAL');       // Write-Ahead Logging for high concurrency
db.pragma('foreign_keys = ON');         // Enforce CASCADE on delete
db.pragma('synchronous = NORMAL');      // Fast, safe write flushing
```

---

## Safe Three-Stage Initialization Pattern

To prevent errors when starting against existing v1 databases:

1. **Stage 1 (Base Schema)**: Create base tables (`CREATE TABLE IF NOT EXISTS`).
2. **Stage 2 (Additive Migrations)**: Run `ALTER TABLE ... ADD COLUMN` inside try/catch blocks (ignoring duplicate column errors).
3. **Stage 3 (Index Creation)**: Create composite and unique indexes after all columns are guaranteed to exist.

```ts
// packages/database/connection.ts
db.exec(SCHEMA_SQL);
DatabaseConnection.runMigrations(db);
DatabaseConnection.createIndexes(db);
```

---

## Repository Design Pattern

All database queries must be encapsulated inside Repository classes under `packages/database/repository/`.
Domain services (`packages/core/services/`) interact only with repository interfaces (`IGoalRepository`), keeping domain rules decoupled from SQL syntax:

```ts
// packages/database/repository/goal-repository.ts
export class SQLiteGoalRepository implements IGoalRepository {
  constructor(private db: Database.Database) {}

  getGoalById(id: string): Goal | null {
    const row = this.db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    if (!row) return null;
    return this.mapRowToGoal(row);
  }

  saveGoal(goal: Goal): void {
    const stmt = this.db.prepare(`
      INSERT INTO goals (id, name, description, paradigm, type, current_value, target_value, unit, default_increment, area, priority, period, start_date, deadline, status, schedule_config, streak_config, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(/* values */);
  }
}
```

---

## Common Pitfalls

1. **Never construct raw SQL strings with string concatenation**:
   - Always use prepared statements (`db.prepare('... WHERE id = ?').run(id)`) to prevent SQL injection and ensure bytecode caching.
2. **Handle JSON Serialization**:
   - Complex configs (`schedule_config`, `streak_config`) must be safely stringified to JSON on write and parsed defensively on read with fallbacks.
