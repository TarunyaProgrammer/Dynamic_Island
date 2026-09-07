import type { CompanionState } from '@shared/types';

export const COMPANION_STATES: readonly CompanionState[] = [
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

export interface CompanionEyePose {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
}

export interface CompanionVisual {
  label: string;
  haloColor: string;
  animation: 'idle' | 'entry' | 'thinking' | 'celebration' | 'static' | 'smile' | 'giggle';
  leftEye: CompanionEyePose;
  rightEye: CompanionEyePose;
}

export const COMPANION_TRANSIENT_DURATIONS_MS: Record<
  'greeting' | 'thinking' | 'celebrating' | 'smiling' | 'tickled',
  number
> = {
  greeting: 700,
  thinking: 1_200,
  celebrating: 850,
  smiling: 1_000,
  tickled: 1_600,
};

const baseEyes = (): Pick<CompanionVisual, 'leftEye' | 'rightEye'> => ({
  leftEye: { cx: 58, cy: 48, rx: 7, ry: 9, rotate: 0 },
  rightEye: { cx: 102, cy: 48, rx: 7, ry: 9, rotate: 0 },
});

export function getCompanionVisual(state: CompanionState): CompanionVisual {
  const eyes = baseEyes();

  switch (state) {
    case 'idle':
      return { ...eyes, label: 'Beacon companion: idle', haloColor: '#ffffff', animation: 'idle' };
    case 'greeting':
      return { ...eyes, label: 'Beacon companion: greeting', haloColor: '#ff7a00', animation: 'entry' };
    case 'thinking':
      return {
        ...eyes,
        label: 'Beacon companion: thinking',
        haloColor: '#e4e4e7',
        animation: 'thinking',
        leftEye: { ...eyes.leftEye, cy: 47, rotate: -3 },
        rightEye: { ...eyes.rightEye, cy: 49, rotate: 3 },
      };
    case 'celebrating':
      return { ...eyes, label: 'Beacon companion: celebrating', haloColor: '#ff7a00', animation: 'celebration' };
    case 'smiling':
      return {
        ...eyes,
        label: 'Beacon companion: smiling',
        haloColor: '#ff912b',
        animation: 'smile',
        leftEye: { ...eyes.leftEye, cy: 47, rx: 8, ry: 6, rotate: -6 },
        rightEye: { ...eyes.rightEye, cy: 49, rx: 8, ry: 6, rotate: 6 },
      };
    case 'tickled':
      return {
        ...eyes,
        label: 'Beacon companion: giggling',
        haloColor: '#ff7a00',
        animation: 'giggle',
        leftEye: { ...eyes.leftEye, cy: 49, rx: 8, ry: 3, rotate: -12 },
        rightEye: { ...eyes.rightEye, cy: 49, rx: 8, ry: 3, rotate: 12 },
      };
    case 'concerned':
      return {
        ...eyes,
        label: 'Beacon companion: concerned',
        haloColor: '#a1a1aa',
        animation: 'static',
        leftEye: { ...eyes.leftEye, cy: 51, rotate: -5 },
        rightEye: { ...eyes.rightEye, cy: 51, rotate: 5 },
      };
    case 'sleeping':
      return {
        ...eyes,
        label: 'Beacon companion: sleeping',
        haloColor: '#52525b',
        animation: 'static',
        leftEye: { ...eyes.leftEye, cy: 50, ry: 2 },
        rightEye: { ...eyes.rightEye, cy: 50, ry: 2 },
      };
    case 'error':
      return {
        ...eyes,
        label: 'Beacon companion: error',
        haloColor: '#f43f5e',
        animation: 'static',
        leftEye: { ...eyes.leftEye, cy: 51, rotate: 5 },
        rightEye: { ...eyes.rightEye, cy: 51, rotate: -5 },
      };
  }
}

export function isTransientCompanionState(
  state: CompanionState,
): state is 'greeting' | 'thinking' | 'celebrating' | 'smiling' | 'tickled' {
  return (
    state === 'greeting' ||
    state === 'thinking' ||
    state === 'celebrating' ||
    state === 'smiling' ||
    state === 'tickled'
  );
}
