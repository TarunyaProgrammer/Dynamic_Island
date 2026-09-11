export function commandStatus(status: unknown): 'confirmed' | 'unsupported' | 'target-gone' | 'permission-denied' | 'failed';
export function parsePairingLink(value: unknown): { port: number; token: string } | undefined;
