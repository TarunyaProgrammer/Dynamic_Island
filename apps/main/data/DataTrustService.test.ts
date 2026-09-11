import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseConnection } from '@database/connection';
import { DataTrustService } from './DataTrustService';

const roots: string[] = [];
afterEach(() => { DatabaseConnection.close(); for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });
describe('DataTrustService', () => {
  it('exports no credential table and restores only the portable data tables', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'beacon-trust-')); roots.push(root);
    const db = DatabaseConnection.getDatabase(path.join(root, 'beacon.sqlite'));
    db.prepare("INSERT INTO goals (id, name, type, current_value, target_value, default_increment, start_date, status, paradigm, area, priority, period, created_at, updated_at) VALUES ('g', 'Read', 'numeric', 0, 10, 1, '2026-01-01', 'active', 'habit', 'Personal', 'normal', 'weekly', '2026-01-01', '2026-01-01')").run();
    db.prepare("INSERT INTO focus_sessions (id, goal_id, duration_minutes, completed_at) VALUES ('focus', 'g', 25, '2026-01-02')").run();
    db.prepare("INSERT INTO sync_operations (id, device_id, sequence, entity_type, entity_id, kind, created_at) VALUES ('op', 'device', 1, 'goal', 'g', 'upsert', '2026-01-02')").run();
    db.prepare("INSERT INTO credentials (key, encrypted_data, updated_at) VALUES ('secret', 'hidden', 'now')").run();
    const service = new DataTrustService(db, path.join(root, 'backups'));
    const snapshot = service.exportSnapshot();
    expect(JSON.stringify(snapshot)).not.toContain('hidden');
    const exportPath = path.join(root, 'export.json'); service.writeExport(exportPath);
    expect(service.previewImport(exportPath).counts.goals).toBe(1);
    expect(service.previewImport(exportPath).counts.sync_operations).toBe(1);
    db.prepare('DELETE FROM sync_operations').run(); db.prepare('DELETE FROM focus_sessions').run(); db.prepare('DELETE FROM goals').run(); service.importSnapshot(exportPath);
    expect(db.prepare('SELECT name FROM goals').get()).toEqual({ name: 'Read' });
    expect(db.prepare('SELECT duration_minutes FROM focus_sessions').get()).toEqual({ duration_minutes: 25 });
    expect(db.prepare('SELECT entity_type FROM sync_operations').get()).toEqual({ entity_type: 'goal' });
    expect(db.prepare("SELECT encrypted_data FROM credentials WHERE key = 'secret'").get()).toEqual({ encrypted_data: 'hidden' });
    const csvPath = path.join(root, 'goals.csv'); service.writeCsv(csvPath, 'goals');
    expect(fs.readFileSync(csvPath, 'utf8')).toContain('"Read"');
  });
});
