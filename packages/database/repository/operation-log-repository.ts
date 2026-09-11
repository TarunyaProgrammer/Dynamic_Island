import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';
import { SyncOperation } from '@shared/types';

export class OperationLogRepository {
  constructor(private readonly db: Database.Database) {}
  deviceId(): string {
    const row = this.db.prepare("SELECT value FROM settings WHERE key = 'syncDeviceId'").get() as { value: string } | undefined;
    if (row) return JSON.parse(row.value) as string;
    const id = randomUUID();
    this.db.prepare("INSERT INTO settings (key, value) VALUES ('syncDeviceId', ?) ON CONFLICT(key) DO NOTHING").run(JSON.stringify(id));
    return id;
  }
  append(input: Omit<SyncOperation, 'id' | 'deviceId' | 'sequence' | 'createdAt'>): SyncOperation {
    const deviceId = this.deviceId();
    const sequence = ((this.db.prepare('SELECT MAX(sequence) AS value FROM sync_operations WHERE device_id = ?').get(deviceId) as { value: number | null }).value ?? 0) + 1;
    const operation: SyncOperation = { ...input, id: randomUUID(), deviceId, sequence, createdAt: new Date().toISOString() };
    this.db.prepare('INSERT INTO sync_operations (id, device_id, sequence, entity_type, entity_id, kind, payload, created_at, acknowledged_at) VALUES (@id, @deviceId, @sequence, @entityType, @entityId, @kind, @payload, @createdAt, @acknowledgedAt)').run({ ...operation, payload: operation.payload ? JSON.stringify(operation.payload) : null, acknowledgedAt: operation.acknowledgedAt ?? null });
    return operation;
  }
  pending(limit = 500): SyncOperation[] { return (this.db.prepare('SELECT * FROM sync_operations WHERE acknowledged_at IS NULL ORDER BY created_at, sequence LIMIT ?').all(limit) as Row[]).map(map); }
  acknowledge(ids: string[]): void { if (ids.length) this.db.prepare(`UPDATE sync_operations SET acknowledged_at = ? WHERE id IN (${ids.map(() => '?').join(',')})`).run(new Date().toISOString(), ...ids); }
}
interface Row { id: string; device_id: string; sequence: number; entity_type: SyncOperation['entityType']; entity_id: string; kind: SyncOperation['kind']; payload: string | null; created_at: string; acknowledged_at: string | null; }
function map(row: Row): SyncOperation { return { id: row.id, deviceId: row.device_id, sequence: row.sequence, entityType: row.entity_type, entityId: row.entity_id, kind: row.kind, payload: row.payload ? JSON.parse(row.payload) : undefined, createdAt: row.created_at, acknowledgedAt: row.acknowledged_at ?? undefined }; }
