// apps/renderer/src/hooks/useActivities.ts - React Hook for Live Activities & Focus
import { useState, useEffect, useCallback } from 'react';
import { FocusSessionState, FocusCompletedEvent, LiveActivity } from '@shared/types';
import { soundEffects } from '../utils/audio';
import { triggerConfetti } from '../components/ConfettiCanvas';

export function useActivities() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [lastCompletedSession, setLastCompletedSession] = useState<FocusCompletedEvent | null>(null);
  const [focusState, setFocusState] = useState<FocusSessionState>({
    durationSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    isActive: false,
    isPaused: false,
  });

  const loadInitialState = useCallback(async () => {
    try {
      if (window.beacon?.activities) {
        const stack = await window.beacon.activities.getStack();
        setActivities(stack || []);
      }
      if (window.beacon?.focus) {
        const state = await window.beacon.focus.getState();
        if (state) setFocusState(state);
      }
    } catch (err) {
      console.error('Failed to load activity initial state:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialState();

    const unsubActivities = window.beacon?.onActivitiesChanged?.((stack) => {
      setActivities(stack || []);
    });

    const unsubFocus = window.beacon?.onFocusTick?.((state) => {
      setFocusState(state);
    });

    const unsubCompleted = window.beacon?.onFocusCompleted?.((event) => {
      setLastCompletedSession(event);
      soundEffects.playFocusChime();
      triggerConfetti({ spread: 'full', count: 110 });
    });

    return () => {
      unsubActivities?.();
      unsubFocus?.();
      unsubCompleted?.();
    };
  }, [loadInitialState]);

  const startFocus = useCallback(async (minutes = 25, goalId?: string) => {
    if (window.beacon?.focus) {
      const state = await window.beacon.focus.start(minutes, goalId);
      setFocusState(state);
    }
  }, []);

  const pauseFocus = useCallback(async () => {
    if (window.beacon?.focus) {
      const state = await window.beacon.focus.pause();
      setFocusState(state);
    }
  }, []);

  const resumeFocus = useCallback(async () => {
    if (window.beacon?.focus) {
      const state = await window.beacon.focus.resume();
      setFocusState(state);
    }
  }, []);

  const stopFocus = useCallback(async (commit = true) => {
    if (window.beacon?.focus) {
      const state = await window.beacon.focus.stop(commit);
      setFocusState(state);
    }
  }, []);

  const extendFocus = useCallback(async (minutes = 5) => {
    if (window.beacon?.focus) {
      const state = await window.beacon.focus.extend(minutes);
      setFocusState(state);
    }
  }, []);

  const dismissActivity = useCallback(async (id: string) => {
    if (window.beacon?.activities) {
      await window.beacon.activities.dismiss(id);
    }
  }, []);

  const clearCompletedSession = useCallback(() => {
    setLastCompletedSession(null);
  }, []);

  return {
    activities,
    focusState,
    lastCompletedSession,
    clearCompletedSession,
    startFocus,
    pauseFocus,
    resumeFocus,
    stopFocus,
    extendFocus,
    dismissActivity,
  };
}
