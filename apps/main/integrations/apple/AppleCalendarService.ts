import { app } from '@electron-bridge';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import { describeAppleIntegrationError, shouldFallbackToJxa } from './AppleIntegrationErrors';

const execFileAsync = promisify(execFile);
export interface AppleCalendarEvent { id: string; title: string; start: string; end: string; calendar: string; }
export interface AppleReminder { id: string; title: string; dueDate?: string; list: string; }

/**
 * Native EventKit boundary. Read-only by design.
 *
 * Strategy:
 *   1. Try the compiled BeaconEventKitHelper binary, which requests access on demand.
 *   2. Fall back to JXA via osascript (works when binary is absent in dev).
 *   3. On any failure, surface a clean human-readable error (never the raw script).
 */
export class AppleCalendarService {
  constructor(
    private readonly helperPath = app.isPackaged
      ? path.join(process.resourcesPath, 'BeaconEventKitHelper')
      : path.join(process.cwd(), 'build', 'BeaconEventKitHelper'),
  ) {}

  async events(start: Date, end: Date): Promise<AppleCalendarEvent[]> {
    try {
      const startIso = start.toISOString().replace(/\.\d{3}Z$/, 'Z');
      const endIso = end.toISOString().replace(/\.\d{3}Z$/, 'Z');
      return await this.run<AppleCalendarEvent[]>('calendar', startIso, endIso);
    } catch (error) {
      // EventKit is the only path that can request Calendar permission. Do not
      // replace a denial or request failure with an unrelated AppleScript error.
      if (!shouldFallbackToJxa(error)) throw error;
      return this.runJxaCalendar(start, end);
    }
  }

  async reminders(): Promise<AppleReminder[]> {
    try {
      return await this.run<AppleReminder[]>('reminders');
    } catch (error) {
      if (!shouldFallbackToJxa(error)) throw error;
      return this.runJxaReminders();
    }
  }

  // ─── JXA Fallback ─────────────────────────────────────────────────────────

  private async runJxaCalendar(start: Date, end: Date): Promise<AppleCalendarEvent[]> {
    // Minimal script — avoids any Application("Calendar").launch() that triggers
    // a permission dialog. We simply query; if access is denied the error is clean.
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    const script = `
(() => {
  try {
    const cal = Application("Calendar");
    const startDate = new Date("${startIso}");
    const endDate = new Date("${endIso}");
    const cals = cal.calendars();
    const results = [];
    for (let i = 0; i < cals.length; i++) {
      const c = cals[i];
      let evts;
      try {
        evts = c.events.whose({
          _and: [
            { startDate: { _greaterThanEquals: startDate } },
            { startDate: { _lessThan: endDate } }
          ]
        })();
      } catch(e) { evts = []; }
      for (let j = 0; j < evts.length; j++) {
        const e = evts[j];
        try {
          results.push({
            id: String(e.uid()),
            title: e.summary() || "Untitled Event",
            start: e.startDate().toISOString(),
            end: e.endDate().toISOString(),
            calendar: c.name()
          });
        } catch(e2) {}
      }
    }
    return JSON.stringify(results);
  } catch(err) {
    return JSON.stringify({ error: String(err.message || err) });
  }
})()
`;

    return this.execOsascript<AppleCalendarEvent[]>(script, 'calendar');
  }

  private async runJxaReminders(): Promise<AppleReminder[]> {
    const script = `
(() => {
  try {
    const rem = Application("Reminders");
    const lists = rem.lists();
    const results = [];
    for (let i = 0; i < lists.length; i++) {
      const list = lists[i];
      let items;
      try { items = list.reminders.whose({ completed: false })(); } catch(e) { items = []; }
      for (let j = 0; j < Math.min(items.length, 50); j++) {
        const item = items[j];
        let dueStr;
        try { const d = item.dueDate(); if (d) dueStr = d.toISOString(); } catch(e) {}
        try {
          results.push({
            id: item.id(),
            title: item.name() || "Untitled Reminder",
            dueDate: dueStr,
            list: list.name()
          });
        } catch(e2) {}
      }
    }
    return JSON.stringify(results);
  } catch(err) {
    return JSON.stringify({ error: String(err.message || err) });
  }
})()
`;

    return this.execOsascript<AppleReminder[]>(script, 'reminders');
  }

  /**
   * Runs an osascript JXA string and parses the JSON output.
   * Never throws with the raw script in the message — always sanitized.
   */
  private async execOsascript<T>(script: string, command: string): Promise<T> {
    let stdout: string;
    try {
      ({ stdout } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', script], {
        timeout: 12_000,
        // Prevent the raw script from appearing in error.message via the cmd line
        windowsHide: true,
      }));
    } catch (err: any) {
      // err.message often contains the full command string with the script embedded.
      // Extract only the stderr/message part, not the cmd.
      const detail: string = (err.stderr ?? err.message ?? '').split('\n')[0] ?? '';
      throw new Error(describeAppleIntegrationError(command, new Error(detail)));
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stdout.trim());
    } catch {
      throw new Error(describeAppleIntegrationError(command, new Error('Invalid response from Calendar')));
    }

    if (parsed && typeof parsed === 'object' && 'error' in (parsed as object)) {
      const msg = (parsed as { error: string }).error;
      throw new Error(describeAppleIntegrationError(command, new Error(msg)));
    }

    return Array.isArray(parsed) ? (parsed as T) : ([] as T);
  }

  // ─── Binary Helper ────────────────────────────────────────────────────────

  private async run<T>(command: string, ...args: string[]): Promise<T> {
    if (!fs.existsSync(this.helperPath)) {
      throw new Error('BeaconEventKitHelper binary not found — falling back to JXA.');
    }
    try {
      const { stdout } = await execFileAsync(this.helperPath, [command, ...args], { timeout: 10_000 });
      return JSON.parse(stdout) as T;
    } catch (error) {
      throw new Error(describeAppleIntegrationError(command, error));
    }
  }
}
