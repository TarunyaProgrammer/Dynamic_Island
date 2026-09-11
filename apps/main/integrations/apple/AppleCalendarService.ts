import { app } from '@electron-bridge';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs';
import { describeAppleIntegrationError } from './AppleIntegrationErrors';

const execFileAsync = promisify(execFile);
export interface AppleCalendarEvent { id: string; title: string; start: string; end: string; calendar: string; }
export interface AppleReminder { id: string; title: string; dueDate?: string; list: string; }

/** Native EventKit boundary. It is read-only by design: converting a reminder
 * into an action remains an explicit Beacon command made by the user. */
export class AppleCalendarService {
  constructor(private readonly helperPath = app.isPackaged ? path.join(process.resourcesPath, 'BeaconEventKitHelper') : path.join(process.cwd(), 'build', 'BeaconEventKitHelper')) {}
  async events(start: Date, end: Date): Promise<AppleCalendarEvent[]> {
    try {
      const startIso = start.toISOString().replace(/\.\d{3}Z$/, 'Z');
      const endIso = end.toISOString().replace(/\.\d{3}Z$/, 'Z');
      return await this.run<AppleCalendarEvent[]>('calendar', startIso, endIso);
    } catch {
      return this.runJxaCalendar(start, end);
    }
  }

  async reminders(): Promise<AppleReminder[]> {
    try {
      return await this.run<AppleReminder[]>('reminders');
    } catch {
      return this.runJxaReminders();
    }
  }

  private async runJxaCalendar(start: Date, end: Date): Promise<AppleCalendarEvent[]> {
    const script = `
(() => {
  try {
    const app = Application("Calendar");
    const start = new Date("${start.toISOString()}");
    const end = new Date("${end.toISOString()}");
    const cals = app.calendars();
    const results = [];
    for (let i = 0; i < cals.length; i++) {
      const cal = cals[i];
      const evts = cal.events.whose({
        _and: [
          { startDate: { _greaterThanEquals: start } },
          { startDate: { _lessThan: end } }
        ]
      })();
      for (let j = 0; j < evts.length; j++) {
        const e = evts[j];
        results.push({
          id: e.id(),
          title: e.summary() || "Untitled Event",
          start: e.startDate().toISOString(),
          end: e.endDate().toISOString(),
          calendar: cal.name()
        });
      }
    }
    return JSON.stringify(results);
  } catch(err) {
    return JSON.stringify({ error: err.message });
  }
})()
`;
    try {
      const { stdout } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', script], { timeout: 10_000 });
      const parsed = JSON.parse(stdout.trim());
      if (parsed && typeof parsed === 'object' && 'error' in parsed) {
        throw new Error(parsed.error);
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      throw new Error(describeAppleIntegrationError('calendar', err));
    }
  }

  private async runJxaReminders(): Promise<AppleReminder[]> {
    const script = `
(() => {
  try {
    const app = Application("Reminders");
    const lists = app.lists();
    const results = [];
    for (let i = 0; i < lists.length; i++) {
      const list = lists[i];
      const items = list.reminders.whose({ completed: false })();
      for (let j = 0; j < Math.min(items.length, 50); j++) {
        const item = items[j];
        let dueStr = undefined;
        try {
          const due = item.dueDate();
          if (due) dueStr = due.toISOString();
        } catch(e) {}
        results.push({
          id: item.id(),
          title: item.name() || "Untitled Reminder",
          dueDate: dueStr,
          list: list.name()
        });
      }
    }
    return JSON.stringify(results);
  } catch(err) {
    return JSON.stringify({ error: err.message });
  }
})()
`;
    try {
      const { stdout } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', script], { timeout: 10_000 });
      const parsed = JSON.parse(stdout.trim());
      if (parsed && typeof parsed === 'object' && 'error' in parsed) {
        throw new Error(parsed.error);
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      throw new Error(describeAppleIntegrationError('reminders', err));
    }
  }

  private async run<T>(command: string, ...args: string[]): Promise<T> {
    if (!fs.existsSync(this.helperPath)) {
      throw new Error('Apple Calendar and Reminders helper binary not found.');
    }
    try {
      const { stdout } = await execFileAsync(this.helperPath, [command, ...args], { timeout: 10_000 });
      return JSON.parse(stdout) as T;
    } catch (error) {
      throw new Error(describeAppleIntegrationError(command, error));
    }
  }
}
