// apps/renderer/src/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@shared/types';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (!window.beacon) return;
      const s = await window.beacon.settings.get();
      setSettings(s);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!window.beacon) return;
    const unsubscribe = window.beacon.onSettingsChanged((updated) => {
      setSettings(updated);
    });
    return () => unsubscribe();
  }, [refresh]);

  const updateSettings = async (partial: Partial<AppSettings>) => {
    if (!window.beacon) return;
    const updated = await window.beacon.settings.update(partial);
    setSettings(updated);
    return updated;
  };

  return { settings, updateSettings, refresh };
}
