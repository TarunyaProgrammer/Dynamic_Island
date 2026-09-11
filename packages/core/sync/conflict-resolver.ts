import { SyncOperation } from '@shared/types';

/** Deterministic last-write-wins at an entity boundary. Clock ties are resolved
 * by device ID so every future client chooses the same winner. A delete is a
 * normal tombstone operation and therefore survives offline replicas. */
export function resolveOperationConflict(local: SyncOperation, incoming: SyncOperation): SyncOperation {
  if (local.entityType !== incoming.entityType || local.entityId !== incoming.entityId) throw new Error('Operations must target the same entity');
  if (local.createdAt !== incoming.createdAt) return local.createdAt > incoming.createdAt ? local : incoming;
  if (local.deviceId !== incoming.deviceId) return local.deviceId > incoming.deviceId ? local : incoming;
  return local.sequence >= incoming.sequence ? local : incoming;
}
