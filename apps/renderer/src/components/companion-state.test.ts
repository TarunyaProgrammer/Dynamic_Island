import { describe, expect, it } from 'vitest';
import {
  COMPANION_STATES,
  COMPANION_VIEWBOX,
  getCompanionVisual,
  isTransientCompanionState,
} from './companion-state';

describe('companion visual state', () => {
  it('maps every shared state to a complete visual pose', () => {
    for (const state of COMPANION_STATES) {
      const visual = getCompanionVisual(state);

      expect(visual.label.length).toBeGreaterThan(0);
      expect(visual.haloColor).toMatch(/^#/);
      expect(visual.leftEye.ry).toBeGreaterThan(0);
      expect(visual.rightEye.ry).toBeGreaterThan(0);
      expect(visual.animation).toMatch(/^(idle|entry|thinking|celebration|static|smile|giggle)$/);
    }
  });

  it('only treats greeting, thinking, celebrating, smiling, and tickled as transient', () => {
    expect(COMPANION_STATES.filter(isTransientCompanionState)).toEqual([
      'greeting',
      'thinking',
      'celebrating',
      'smiling',
      'tickled',
    ]);
  });

  it('keeps sleeping and error visually readable without relying on color', () => {
    expect(getCompanionVisual('sleeping').label).toContain('sleep');
    expect(getCompanionVisual('error').label).toContain('error');
    expect(getCompanionVisual('sleeping').leftEye.ry).toBeLessThan(getCompanionVisual('idle').leftEye.ry);
  });

  it('uses a symmetric circular geometry contract', () => {
    const visual = getCompanionVisual('idle');
    expect(COMPANION_VIEWBOX).toBe('0 0 100 100');
    expect(visual.leftEye.cx + visual.rightEye.cx).toBe(100);
  });
});
