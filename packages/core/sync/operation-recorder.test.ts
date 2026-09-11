import { describe, expect, it } from 'vitest';
import { DatabaseConnection } from '@database/connection';
import { OperationLogRepository } from '@database/repository/operation-log-repository';
describe('OperationLogRepository', () => it('creates monotonic device-scoped operations and acknowledges them', () => {
  DatabaseConnection.close(); const repo = new OperationLogRepository(DatabaseConnection.initializeInMemory());
  const first = repo.append({ entityType: 'goal', entityId: 'g1', kind: 'upsert', payload: { name: 'Read' } });
  const second = repo.append({ entityType: 'goal', entityId: 'g1', kind: 'delete' });
  expect(second.sequence).toBe(first.sequence + 1); expect(repo.pending()).toHaveLength(2);
  repo.acknowledge([first.id]); expect(repo.pending()).toHaveLength(1);
}));
