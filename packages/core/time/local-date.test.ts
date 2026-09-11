import { describe, expect, it } from 'vitest';
import { toLocalDate } from './local-date';

describe('toLocalDate', () => {
  it('uses the user timezone rather than UTC near midnight', () => {
    const instant = new Date('2026-09-07T19:00:00.000Z');
    expect(toLocalDate(instant, 'Asia/Kolkata')).toBe('2026-09-08');
    expect(toLocalDate(instant, 'America/Los_Angeles')).toBe('2026-09-07');
  });
});
