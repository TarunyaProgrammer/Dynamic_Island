import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const TABLES = ['goals', 'milestones', 'progress_events', 'goal_checkins', 'goal_actions', 'today_plans', 'today_plan_actions', 'goal_reminder_policies', 'focus_sessions', 'sync_operations', 'settings'] as const;
type ExportTable = typeof TABLES[number];
export interface BeaconExport { format: 'beacon-export'; version: 1; exportedAt: string; tables: Record<ExportTable, Record<string, unknown>[]>; }

/** Local-only backups and portable exports. Credentials never appear in either
 * JSON export or import data, so an export is safe to move between machines. */
export class DataTrustService {
  constructor(private readonly db: Database.Database, private readonly backupDirectory: string) {}

  createBackup(now = new Date()): string {
    fs.mkdirSync(this.backupDirectory, { recursive: true });
    this.db.pragma('wal_checkpoint(TRUNCATE)');
    const name = `beacon-${stamp(now)}.sqlite`;
    const destination = path.join(this.backupDirectory, name);
    fs.copyFileSync(this.db.name, destination);
    const files = fs.readdirSync(this.backupDirectory).filter((file) => file.endsWith('.sqlite')).sort().reverse();
    for (const stale of files.slice(7)) fs.unlinkSync(path.join(this.backupDirectory, stale));
    return destination;
  }

  exportSnapshot(now = new Date()): BeaconExport {
    const tables = {} as BeaconExport['tables'];
    for (const table of TABLES) tables[table] = this.db.prepare(`SELECT * FROM ${table}`).all() as Record<string, unknown>[];
    return { format: 'beacon-export', version: 1, exportedAt: now.toISOString(), tables };
  }

  writeExport(filePath: string): void { fs.writeFileSync(filePath, JSON.stringify(this.exportSnapshot(), null, 2), 'utf8'); }

  writeCsv(filePath: string, kind: 'goals' | 'progress'): void {
    const table = kind === 'goals' ? 'goals' : 'progress_events';
    const rows = this.db.prepare(`SELECT * FROM ${table} ORDER BY ${kind === 'goals' ? 'updated_at DESC' : 'timestamp DESC'}`).all() as Record<string, unknown>[];
    const columns = rows.length ? Object.keys(rows[0]) : (this.db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((item) => item.name);
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    fs.writeFileSync(filePath, [columns.map(escape).join(','), ...rows.map((row) => columns.map((column) => escape(row[column])).join(','))].join('\n'), 'utf8');
  }

  previewImport(filePath: string): { version: number; exportedAt: string; counts: Record<string, number> } {
    const parsed = parseExport(fs.readFileSync(filePath, 'utf8'));
    return { version: parsed.version, exportedAt: parsed.exportedAt, counts: Object.fromEntries(TABLES.map((table) => [table, parsed.tables[table].length])) };
  }

  importSnapshot(filePath: string): void {
    const snapshot = parseExport(fs.readFileSync(filePath, 'utf8'));
    this.createBackup();
    const insert = (table: ExportTable, row: Record<string, unknown>) => {
      const columns = Object.keys(row).filter((key) => this.columns(table).has(key));
      if (!columns.length) return;
      this.db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map((key) => `@${key}`).join(', ')})`).run(row);
    };
    this.db.transaction(() => {
      for (const table of [...TABLES].reverse()) this.db.prepare(`DELETE FROM ${table}`).run();
      for (const table of TABLES) for (const row of snapshot.tables[table]) insert(table, row);
    })();
  }

  private columns(table: ExportTable): Set<string> { return new Set((this.db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((column) => column.name)); }
}

function parseExport(input: string): BeaconExport {
  const value = JSON.parse(input) as Partial<BeaconExport>;
  if (value.format !== 'beacon-export' || value.version !== 1 || !value.tables || typeof value.exportedAt !== 'string') throw new Error('This is not a compatible Beacon export.');
  for (const table of TABLES) if (!Array.isArray(value.tables[table])) throw new Error(`Export is missing ${table}.`);
  return value as BeaconExport;
}
function stamp(date: Date): string { return date.toISOString().replace(/[:.]/g, '-'); }
