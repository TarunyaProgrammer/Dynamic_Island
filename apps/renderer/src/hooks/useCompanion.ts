import { useCallback, useEffect, useRef, useState } from 'react';
import { makeCompanionEvent } from '@shared/companion';
import type { CompanionEvent, CompanionSource, CompanionState } from '@shared/types';
import {
  CompanionController,
  CompanionSnapshot,
  createCompanionController,
} from './companion-controller';

const MAX_SEEN_EVENT_IDS = 64;

export interface UseCompanionResult extends CompanionSnapshot {
  setState: (state: CompanionState, message?: string) => void;
  celebrate: (message?: string) => void;
}

export function useCompanion(source: CompanionSource): UseCompanionResult {
  const [snapshot, setSnapshot] = useState<CompanionSnapshot>({ state: 'greeting' });
  const controllerRef = useRef<CompanionController | null>(null);
  const seenEventIdsRef = useRef<string[]>([]);

  const rememberEvent = (event: CompanionEvent): boolean => {
    if (seenEventIdsRef.current.includes(event.id)) return false;
    seenEventIdsRef.current = [...seenEventIdsRef.current.slice(-(MAX_SEEN_EVENT_IDS - 1)), event.id];
    return true;
  };

  useEffect(() => {
    const controller = createCompanionController(setSnapshot, 'greeting');
    controllerRef.current = controller;
    controller.transition('greeting');

    const unsubscribe = window.beacon?.onCompanionChanged?.((event) => {
      if (!rememberEvent(event)) return;
      controller.transition(event.state, event.message);
    });

    return () => {
      unsubscribe?.();
      controller.dispose();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, []);

  const setState = useCallback((state: CompanionState, message?: string) => {
    controllerRef.current?.transition(state, message);
  }, []);

  const celebrate = useCallback((message?: string) => {
    const event = makeCompanionEvent('celebrating', source, message);
    rememberEvent(event);
    controllerRef.current?.transition(event.state, event.message);

    void window.beacon?.companion?.emit(event).catch((error: unknown) => {
      console.debug('[Companion] Event broadcast unavailable:', error);
    });
  }, [source]);

  return {
    state: snapshot.state,
    message: snapshot.message,
    setState,
    celebrate,
  };
}
