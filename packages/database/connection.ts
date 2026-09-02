// packages/database/connection.ts - SQLite Database Connection Manager
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL, MIGRATION_SQL, INDEXES_SQL } from './schema';

export class DatabaseConnection {
  private static instance: Database.Database | null = null;

  private static getDatabaseOptions(): Database.Options {
    const isElectron = Boolean((process as any).versions?.electron);
    try {
      const rootDir = process.cwd();
      const candidates = isElectron
        ? [
            path.join(rootDir, 'build/native/better_sqlite3_electron.node'),
            path.join(rootDir, 'node_modules/better-sqlite3/build/Release/better_sqlite3_electron.node'),
          ]
        : [
            path.join(rootDir, 'build/native/better_sqlite3_node.node'),
            path.join(rootDir, 'node_modules/better-sqlite3/build/Release/better_sqlite3_node.node'),
          ];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          return { nativeBinding: candidate };
        }
      }
    } catch {
      // fallback to default bindings
    }
    return {};
  }

  static getDatabase(dbPath?: string): Database.Database {
    if (!DatabaseConnection.instance) {
      const targetPath = dbPath || DatabaseConnection.getDefaultDbPath();
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const db = new Database(targetPath, DatabaseConnection.getDatabaseOptions());
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
      db.pragma('synchronous = NORMAL');

      // Initialize base schema (CREATE TABLE IF NOT EXISTS — idempotent)
      db.exec(SCHEMA_SQL);

      // Run additive ALTER TABLE migrations — ignore "duplicate column" on re-run
      DatabaseConnection.runMigrations(db);

      // Create indexes after columns are guaranteed to exist
      DatabaseConnection.createIndexes(db);

      DatabaseConnection.instance = db;
    }
    return DatabaseConnection.instance;
  }

  static initializeInMemory(): Database.Database {
    const db = new Database(':memory:', DatabaseConnection.getDatabaseOptions());
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA_SQL);
    DatabaseConnection.runMigrations(db);
    DatabaseConnection.createIndexes(db);
    DatabaseConnection.instance = db;
    return db;
  }

  static close(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
      DatabaseConnection.instance = null;
    }
  }

  private static runMigrations(db: Database.Database): void {
    for (const sql of MIGRATION_SQL) {
      try {
        db.exec(sql);
      } catch {
        // "duplicate column name" — already migrated, safe to ignore
      }
    }
  }

  private static createIndexes(db: Database.Database): void {
    for (const sql of INDEXES_SQL) {
      try {
        db.exec(sql);
      } catch (err) {
        console.warn('Index creation notice:', err);
      }
    }
  }

  private static getDefaultDbPath(): string {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
    return path.join(homeDir, 'Library', 'Application Support', 'Beacon', 'beacon.sqlite');
  }
}
