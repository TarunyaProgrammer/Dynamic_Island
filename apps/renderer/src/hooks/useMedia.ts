// apps/renderer/src/hooks/useMedia.ts
import { useState, useEffect, useCallback } from 'react';
import { MediaActivityState } from '@shared/types';

export function useMedia() {
  const [mediaState, setMediaState] = useState<MediaActivityState>({
    title: 'No Media Playing',
    artist: 'macOS Audio',
    isPlaying: false,
    durationSeconds: 0,
    progressSeconds: 0,
    volume: 50,
  });

  useEffect(() => {
    // Initial fetch
    if (window.beacon?.media) {
      window.beacon.media.getState().then((state) => {
        if (state) setMediaState(state);
      });
    }

    // Subscribe to live changes
    if (window.beacon?.onMediaChanged) {
      const unsubscribe = window.beacon.onMediaChanged((state) => {
        if (state) setMediaState(state);
      });
      return () => unsubscribe();
    }
  }, []);

  const playPause = useCallback(async () => {
    if (window.beacon?.media) {
      const updated = await window.beacon.media.playPause();
      if (updated) setMediaState(updated);
    }
  }, []);

  const nextTrack = useCallback(async () => {
    if (window.beacon?.media) {
      const updated = await window.beacon.media.next();
      if (updated) setMediaState(updated);
    }
  }, []);

  const previousTrack = useCallback(async () => {
    if (window.beacon?.media) {
      const updated = await window.beacon.media.previous();
      if (updated) setMediaState(updated);
    }
  }, []);

  const setVolume = useCallback(async (vol: number) => {
    if (window.beacon?.media) {
      const updated = await window.beacon.media.setVolume(vol);
      if (updated) setMediaState(updated);
    }
  }, []);

  return {
    mediaState,
    playPause,
    nextTrack,
    previousTrack,
    setVolume,
  };
}
