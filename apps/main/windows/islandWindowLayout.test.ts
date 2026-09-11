import { describe, expect, it } from 'vitest';
import {
  COLLAPSED_ISLAND_SIZE,
  EXPANDED_ISLAND_SIZE,
  islandBoundsFor,
  islandNativePolicyFor,
} from './islandWindowLayout';

const display = { x: -1440, y: 24, width: 1440, height: 900 };

describe('Island window layout', () => {
  it('centres both layouts on the requested display', () => {
    expect(islandBoundsFor(display, 'collapsed')).toEqual({
      x: -820,
      y: 24,
      width: COLLAPSED_ISLAND_SIZE.width,
      height: COLLAPSED_ISLAND_SIZE.height,
    });
    expect(islandBoundsFor(display, 'expanded')).toEqual({
      x: -1050,
      y: 24,
      width: EXPANDED_ISLAND_SIZE.width,
      height: EXPANDED_ISLAND_SIZE.height,
    });
  });

  it('keeps the collapsed Island passive but forwards hover', () => {
    expect(islandNativePolicyFor('collapsed')).toEqual({
      focusable: false,
      ignoreMouseEvents: true,
      forwardMouseEvents: true,
    });
  });

  it('makes only the expanded Island interactive', () => {
    expect(islandNativePolicyFor('expanded')).toEqual({
      focusable: true,
      ignoreMouseEvents: false,
      forwardMouseEvents: false,
    });
  });
});
