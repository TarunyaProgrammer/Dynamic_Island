import { SyncOperation } from '@shared/types';

export interface OperationRecorder { record(operation: Omit<SyncOperation, 'id' | 'deviceId' | 'sequence' | 'createdAt'>): void; }
