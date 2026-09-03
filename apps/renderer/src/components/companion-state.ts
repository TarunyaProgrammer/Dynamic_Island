import type { CompanionState } from '@shared/types';

export const COMPANION_STATES: readonly CompanionState[] = [
  'idle',
  'greeting',
  'thinking',
  'celebrating',
  'concerned',
  'sleeping',
  'error',
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
  animation: 'idle' | 'entry' | 'thinking' | 'celebration' | 'static';
  leftEye: CompanionEyePose;
  rightEye: CompanionEyePose;
}

export const COMPANION_TRANSIENT_DURATIONS_MS: Record<'greeting' | 'thinking' | 'celebrating', number> = {
  greeting: 700,
  thinking: 1_200,
  celebrating: 850,
};

const baseEyes = (): Pick<CompanionVisual, 'leftEye' | 'rightEye'> => ({
  leftEye: { cx: 58, cy: 48, rx: 7, ry: 9, rotate: 0 },
  rightEye: { cx: 102, cy: 48, rx: 7, ry: 9, rotate: 0 },
});

export function getCompanionVisual(state: CompanionState): CompanionVisual {
  const eyes = baseEyes();

  switch (state) {
    case 'idle':
      return { ...eyes, label: 'Beacon companion: idle', haloColor: '#5AC8FA', animation: 'idle' };
    case 'greeting':
      return { ...eyes, label: 'Beacon companion: greeting', haloColor: '#5AC8FA', animation: 'entry' };
    case 'thinking':
      return {
        ...eyes,
        label: 'Beacon companion: thinking',
        haloColor: '#7C6CFF',
        animation: 'thinking',
        leftEye: { ...eyes.leftEye, cy: 47, rotate: -3 },
        rightEye: { ...eyes.rightEye, cy: 49, rotate: 3 },
      };
    case 'celebrating':
      return { ...eyes, label: 'Beacon companion: celebrating', haloColor: '#10B981', animation: 'celebration' };
    case 'concerned':
      return {
        ...eyes,
        label: 'Beacon companion: concerned',
        haloColor: '#F59E0B',
        animation: 'static',
        leftEye: { ...eyes.leftEye, cy: 51, rotate: -5 },
        rightEye: { ...eyes.rightEye, cy: 51, rotate: 5 },
      };
    case 'sleeping':
      return {
        ...eyes,
        label: 'Beacon companion: sleeping',
        haloColor: '#3A3D4A',
        animation: 'static',
        leftEye: { ...eyes.leftEye, cy: 50, ry: 2 },
        rightEye: { ...eyes.rightEye, cy: 50, ry: 2 },
      };
    case 'error':
      return {
        ...eyes,
        label: 'Beacon companion: error',
        haloColor: '#EF4444',
        animation: 'static',
        leftEye: { ...eyes.leftEye, cy: 51, rotate: 5 },
        rightEye: { ...eyes.rightEye, cy: 51, rotate: -5 },
      };
  }
}

export function isTransientCompanionState(
  state: CompanionState,
): state is 'greeting' | 'thinking' | 'celebrating' {
  return state === 'greeting' || state === 'thinking' || state === 'celebrating';
}
