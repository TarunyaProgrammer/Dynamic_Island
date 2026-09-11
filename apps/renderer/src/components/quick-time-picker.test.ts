import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TIME_PRESETS,
  formatTimeTo12h,
} from './QuickTimePicker';

describe('QuickTimePicker utilities & presets', () => {
  it('formats standard times to 12-hour AM/PM format accurately', () => {
    expect(formatTimeTo12h('08:00')).toBe('8:00 AM');
    expect(formatTimeTo12h('09:30')).toBe('9:30 AM');
    expect(formatTimeTo12h('12:00')).toBe('12:00 PM');
    expect(formatTimeTo12h('12:30')).toBe('12:30 PM');
    expect(formatTimeTo12h('14:00')).toBe('2:00 PM');
    expect(formatTimeTo12h('17:45')).toBe('5:45 PM');
    expect(formatTimeTo12h('20:30')).toBe('8:30 PM');
    expect(formatTimeTo12h('23:59')).toBe('11:59 PM');
    expect(formatTimeTo12h('00:00')).toBe('12:00 AM');
    expect(formatTimeTo12h('00:15')).toBe('12:15 AM');
  });

  it('handles empty or invalid inputs gracefully', () => {
    expect(formatTimeTo12h('')).toBe('');
    expect(formatTimeTo12h(undefined)).toBe('');
    expect(formatTimeTo12h('invalid')).toBe('');
  });

  it('provides a curated list of accessible presets with valid times and labels', () => {
    expect(DEFAULT_TIME_PRESETS.length).toBeGreaterThanOrEqual(6);
    for (const preset of DEFAULT_TIME_PRESETS) {
      expect(preset.time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
      expect(preset.label).toContain(preset.time.startsWith('12') || parseInt(preset.time.slice(0, 2), 10) >= 12 ? 'PM' : 'AM');
    }
  });

  it('includes key daily touchpoints (Morning, Lunch, Evening, Night)', () => {
    const descriptions = DEFAULT_TIME_PRESETS.map((p) => p.description.toLowerCase());
    expect(descriptions.some((d) => d.includes('morning'))).toBe(true);
    expect(descriptions.some((d) => d.includes('lunch'))).toBe(true);
    expect(descriptions.some((d) => d.includes('evening'))).toBe(true);
    expect(descriptions.some((d) => d.includes('night'))).toBe(true);
  });
});
