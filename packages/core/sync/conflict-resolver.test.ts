import { describe, expect, it } from 'vitest';
import { SyncOperation } from '@shared/types';
import { resolveOperationConflict } from './conflict-resolver';
const operation = (changes: Partial<SyncOperation> = {}): SyncOperation => ({ id: 'id', deviceId: 'a', sequence: 1, entityType: 'goal', entityId: 'g', kind: 'upsert', createdAt: '2026-09-08T10:00:00.000Z', ...changes });
describe('resolveOperationConflict', () => it('uses timestamp then device ID and preserves delete tombstones', () => {
  const local = operation({ kind: 'delete', createdAt: '2026-09-08T11:00:00.000Z' });
  expect(resolveOperationConflict(local, operation()).kind).toBe('delete');
  expect(resolveOperationConflict(operation({ deviceId: 'a' }), operation({ deviceId: 'z' })).deviceId).toBe('z');
}));
