// packages/database/repository/credential-repository.ts - Secure Encrypted Blob Persistence
import Database from 'better-sqlite3';

export class CredentialRepository {
  constructor(private db: Database.Database) {}

  getEncrypted(key: string): string | null {
    const row = this.db.prepare('SELECT encrypted_data FROM credentials WHERE key = ?').get(key) as
      | { encrypted_data: string }
      | undefined;
    return row ? row.encrypted_data : null;
  }

  setEncrypted(key: string, encryptedBase64: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO credentials (key, encrypted_data, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        encrypted_data = excluded.encrypted_data,
        updated_at = excluded.updated_at
    `);
    stmt.run(key, encryptedBase64, new Date().toISOString());
  }

  remove(key: string): boolean {
    const result = this.db.prepare('DELETE FROM credentials WHERE key = ?').run(key);
    return result.changes > 0;
  }

  has(key: string): boolean {
    const row = this.db.prepare('SELECT 1 FROM credentials WHERE key = ?').get(key);
    return !!row;
  }
}
