// apps/main/ipc/calendarHandlers.ts — Unified Calendar IPC Bridge
// Handles: Apple Calendar + Google Calendar merged event fetch, Google OAuth flow,
// and open-at-login / app-level system settings.

import { BrowserWindow, app, ipcMain } from '@electron-bridge';
import { IPC_CHANNELS } from '@shared/ipc-channels';
import { CalendarEvent, GoogleCalendarInfo, GoogleOAuthStatus } from '@shared/types';
import { SettingsRepository } from '@database/repository/settings-repository';
import { CredentialRepository } from '@database/repository/credential-repository';
import { AppleCalendarService } from '../integrations/apple/AppleCalendarService';
import { GoogleCalendarService } from '../integrations/google/GoogleCalendarService';

/** Safe broadcast — skips destroyed windows and crashed renderers. */
function safeBroadcast(channel: string, ...args: any[]): void {
  for (const win of BrowserWindow.getAllWindows()) {
    try {
      if (!win.isDestroyed() && !win.webContents.isDestroyed() && !win.webContents.isCrashed()) {
        win.webContents.send(channel, ...args);
      }
    } catch {
      // Ignore if frame was disposed during Vite HMR
    }
  }
}

export function registerCalendarHandlers(
  settingsRepo: SettingsRepository,
  credentialRepo: CredentialRepository,
): void {
  const appleCalendar = new AppleCalendarService();
  const googleCalendar = new GoogleCalendarService(
    credentialRepo,
    (status: GoogleOAuthStatus) => {
      // Broadcast status change so renderer can update UI immediately
      safeBroadcast(IPC_CHANNELS.EVENT_CALENDAR_CHANGED, { type: 'google-status', status });
      // Persist connected flag in settings
      if (status === 'connected' || status === 'disconnected') {
        settingsRepo.updateSettings({ googleCalendarConnected: status === 'connected' });
      }
    },
  );

  // ─── Unified event fetch ─────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.CALENDAR_GET_EVENTS, async (_evt, startIso: string, endIso: string) => {
    const start = new Date(startIso);
    const end = new Date(endIso);

    const settings = settingsRepo.getSettings();

    const results = await Promise.allSettled([
      // Apple Calendar (JXA — no auth prompt on subsequent reads)
      appleCalendar.events(start, end).then((events) =>
        events.map((e) => ({
          id: `apple:${e.id}`,
          title: e.title,
          start: e.start,
          end: e.end,
          calendar: e.calendar,
          source: 'apple' as const,
        } satisfies CalendarEvent)),
      ),

      // Google Calendar (only if connected)
      settings.googleCalendarConnected
        ? googleCalendar.getEvents(start, end, settings.googleCalendarSyncedCalendars)
        : Promise.resolve([] as CalendarEvent[]),
    ]);

    const events: CalendarEvent[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        events.push(...result.value);
      }
      // Silently ignore individual provider failures — partial data is better than nothing
    }

    // Sort by start time ascending
    return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  });

  // ─── Google Calendar list ────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.CALENDAR_GET_CALENDARS, async (): Promise<GoogleCalendarInfo[]> => {
    const settings = settingsRepo.getSettings();
    if (!settings.googleCalendarConnected) return [];
    return googleCalendar.getCalendars();
  });

  // ─── Google OAuth ────────────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.CALENDAR_GOOGLE_AUTH_START, async () => {
    await googleCalendar.startAuth();
    // Broadcast so all windows refresh
    safeBroadcast(IPC_CHANNELS.EVENT_CALENDAR_CHANGED, { type: 'google-connected' });
    return { success: true };
  });

  ipcMain.handle(IPC_CHANNELS.CALENDAR_GOOGLE_AUTH_STATUS, () => {
    return {
      status: googleCalendar.getStatus(),
      connected: settingsRepo.getSettings().googleCalendarConnected ?? false,
    };
  });

  ipcMain.handle(IPC_CHANNELS.CALENDAR_GOOGLE_DISCONNECT, async () => {
    await googleCalendar.disconnect();
    settingsRepo.updateSettings({ googleCalendarConnected: false, googleCalendarSyncedCalendars: [] });
    safeBroadcast(IPC_CHANNELS.EVENT_CALENDAR_CHANGED, { type: 'google-disconnected' });
    return { success: true };
  });

  // ─── App system handlers ─────────────────────────────────────────────────

  ipcMain.handle(IPC_CHANNELS.APP_OPEN_AT_LOGIN_SET, (_evt, openAtLogin: boolean) => {
    if (process.platform === 'darwin') {
      app.setLoginItemSettings({
        openAtLogin,
        openAsHidden: true, // start in menu bar, not as foreground window
      });
    }
    settingsRepo.updateSettings({ launchAtLogin: openAtLogin });
    return { success: true, openAtLogin };
  });

  ipcMain.handle(IPC_CHANNELS.APP_CHECK_FOR_UPDATE, () => {
    // Stub — wire Sparkle / electron-updater here in a future update pass
    return { updateAvailable: false, currentVersion: app.getVersion() };
  });
}
