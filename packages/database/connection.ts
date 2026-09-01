// packages/database/connection.ts - SQLite Database Connection Manager
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { SCHEMA_SQL } from './schema';

export class DatabaseConnection {
  private static instance: Database.Database | null = null;

  static getDatabase(dbPath?: string): Database.Database {
    if (!DatabaseConnection.instance) {
      const targetPath = dbPath || DatabaseConnection.getDefaultDbPath();
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const db = new Database(targetPath);
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
      db.pragma('synchronous = NORMAL');

      // Initialize schema
      db.exec(SCHEMA_SQL);

      DatabaseConnection.instance = db;
    }
    return DatabaseConnection.instance;
  }

  static initializeInMemory(): Database.Database {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA_SQL);
    DatabaseConnection.instance = db;
    return db;
  }

  static close(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
      DatabaseConnection.instance = null;
    }
  }

  private static getDefaultDbPath(): string {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
    return path.join(homeDir, 'Library', 'Application Support', 'Beacon', 'beacon.sqlite');
  }
}
