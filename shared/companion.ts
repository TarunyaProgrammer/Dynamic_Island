import { CompanionEvent, CompanionSource, CompanionState } from './types';

const states: readonly CompanionState[] = [
  'idle',
  'greeting',
  'thinking',
  'celebrating',
  'concerned',
  'sleeping',
  'error',
  'smiling',
  'tickled',
];

const sources: readonly CompanionSource[] = ['main', 'tray', 'island'];

export function isCompanionEvent(value: unknown): value is CompanionEvent {
  if (typeof value !== 'object' || value === null) return false;

  const event = value as Record<string, unknown>;
  const validMessage =
    event.message === undefined ||
    (typeof event.message === 'string' && event.message.length <= 160);

  return (
    typeof event.id === 'string' &&
    event.id.length > 0 &&
    event.id.length <= 128 &&
    typeof event.state === 'string' &&
    states.includes(event.state as CompanionState) &&
    typeof event.source === 'string' &&
    sources.includes(event.source as CompanionSource) &&
    typeof event.occurredAt === 'string' &&
    !Number.isNaN(Date.parse(event.occurredAt)) &&
    validMessage
  );
}

export function makeCompanionEvent(
  state: CompanionState,
  source: CompanionSource,
  message?: string,
): CompanionEvent {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    state,
    source,
    occurredAt: new Date().toISOString(),
    ...(message === undefined ? {} : { message: message.slice(0, 160) }),
  };
}
