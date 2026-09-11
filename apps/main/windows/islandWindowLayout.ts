export type IslandVisualState = 'collapsed' | 'expanded';

export interface DisplayBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const COLLAPSED_ISLAND_SIZE = { width: 200, height: 32 };
export const EXPANDED_ISLAND_SIZE = { width: 660, height: 180 };
export const ISLAND_TRANSITION_MS = 280;

export const islandBoundsFor = (
  display: DisplayBounds,
  state: IslandVisualState,
): DisplayBounds => {
  const size = state === 'expanded'
    ? EXPANDED_ISLAND_SIZE
    : COLLAPSED_ISLAND_SIZE;

  return {
    x: Math.round(display.x + (display.width - size.width) / 2),
    y: display.y,
    width: size.width,
    height: size.height,
  };
};

export const islandNativePolicyFor = (state: IslandVisualState) => ({
  focusable: state === 'expanded',
  ignoreMouseEvents: state === 'collapsed',
  forwardMouseEvents: state === 'collapsed',
});
