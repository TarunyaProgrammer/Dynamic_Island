// packages/database/repository/settings-repository.ts - App Settings Persistence
import Database from 'better-sqlite3';
import { AppSettings } from '@shared/types';

export const DEFAULT_SETTINGS: AppSettings = {
  launchAtLogin: false,
  islandPosition: 'notch',
  autoCollapseDelay: 3.0,
  showInAllSpaces: true,
  globalShortcut: 'CommandOrControl+Shift+B',
  theme: 'dark',
  onboardingCompleted: false,
};

export class SettingsRepository {
  constructor(private db: Database.Database) {}

  getSettings(): AppSettings {
    const rows = this.db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const settings: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    }

    return settings as AppSettings;
  }

  updateSettings(partial: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };

    const stmt = this.db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const transaction = this.db.transaction(() => {
      for (const [k, v] of Object.entries(partial)) {
        stmt.run(k, JSON.stringify(v));
      }
    });

    transaction();
    return updated;
  }
}
