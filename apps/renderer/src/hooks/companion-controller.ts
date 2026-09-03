import type { CompanionState } from '@shared/types';
import {
  COMPANION_TRANSIENT_DURATIONS_MS,
  isTransientCompanionState,
} from '../components/companion-state';

export interface CompanionSnapshot {
  state: CompanionState;
  message?: string;
}

export interface CompanionController {
  getSnapshot: () => CompanionSnapshot;
  transition: (state: CompanionState, message?: string) => void;
  dispose: () => void;
}

export function createCompanionController(
  onStateChange: (snapshot: CompanionSnapshot) => void,
  initialState: CompanionState = 'idle',
): CompanionController {
  let snapshot: CompanionSnapshot = { state: initialState };
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  const clearTransition = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  const transition = (state: CompanionState, message?: string) => {
    if (disposed) return;

    clearTransition();
    snapshot = message === undefined ? { state } : { state, message };
    onStateChange(snapshot);

    if (isTransientCompanionState(state)) {
      timeout = setTimeout(() => {
        timeout = null;
        if (disposed) return;
        snapshot = { state: 'idle' };
        onStateChange(snapshot);
      }, COMPANION_TRANSIENT_DURATIONS_MS[state]);
    }
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    clearTransition();
  };

  return {
    getSnapshot: () => snapshot,
    transition,
    dispose,
  };
}
