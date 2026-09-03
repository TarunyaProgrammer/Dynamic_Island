import { describe, expect, it } from 'vitest';
import { isCompanionEvent, makeCompanionEvent } from './companion';

describe('companion event contract', () => {
  it('accepts an event created by the helper', () => {
    const event = makeCompanionEvent('celebrating', 'main', 'Goal completed');

    expect(isCompanionEvent(event)).toBe(true);
    expect(event).toMatchObject({ state: 'celebrating', source: 'main', message: 'Goal completed' });
    expect(event.id).toEqual(expect.any(String));
    expect(event.occurredAt).toEqual(expect.any(String));
  });

  it('rejects invalid fields and oversized messages', () => {
    const occurredAt = new Date().toISOString();

    expect(isCompanionEvent({ state: 'party', source: 'main', id: 'x', occurredAt })).toBe(false);
    expect(isCompanionEvent({ state: 'idle', source: 'window', id: 'x', occurredAt })).toBe(false);
    expect(isCompanionEvent({ state: 'idle', source: 'main', id: '', occurredAt })).toBe(false);
    expect(isCompanionEvent({ state: 'idle', source: 'main', id: 'x', occurredAt: 'not-a-date' })).toBe(false);
    expect(isCompanionEvent({ state: 'idle', source: 'main', id: 'x', occurredAt, message: 'x'.repeat(161) })).toBe(false);
  });

  it('accepts an event without a message', () => {
    expect(isCompanionEvent({
      id: 'event-1',
      state: 'idle',
      source: 'tray',
      occurredAt: new Date().toISOString(),
    })).toBe(true);
  });
});
