import Database from 'better-sqlite3';
import { ReminderPolicy, Weekday } from '@shared/types';

export class ReminderPolicyRepository {
  constructor(private readonly db: Database.Database) {}

  get(goalId: string): ReminderPolicy | null {
    const row = this.db.prepare('SELECT * FROM goal_reminder_policies WHERE goal_id = ?').get(goalId) as Row | undefined;
    return row ? mapRow(row) : null;
  }

  listEnabled(): ReminderPolicy[] {
    return (this.db.prepare('SELECT * FROM goal_reminder_policies WHERE enabled = 1').all() as Row[]).map(mapRow);
  }

  save(policy: ReminderPolicy): void {
    this.db.prepare(`INSERT INTO goal_reminder_policies (goal_id, enabled, time, weekdays, only_when_incomplete, quiet_start, quiet_end, updated_at)
      VALUES (@goalId, @enabled, @time, @weekdays, @onlyWhenIncomplete, @quietStart, @quietEnd, @updatedAt)
      ON CONFLICT(goal_id) DO UPDATE SET enabled = excluded.enabled, time = excluded.time, weekdays = excluded.weekdays,
        only_when_incomplete = excluded.only_when_incomplete, quiet_start = excluded.quiet_start, quiet_end = excluded.quiet_end, updated_at = excluded.updated_at`
    ).run({ goalId: policy.goalId, enabled: policy.enabled ? 1 : 0, time: policy.time ?? null,
      weekdays: policy.weekdays ? JSON.stringify(policy.weekdays) : null, onlyWhenIncomplete: policy.onlyWhenIncomplete ? 1 : 0,
      quietStart: policy.quietStart ?? null, quietEnd: policy.quietEnd ?? null, updatedAt: policy.updatedAt });
  }
}

interface Row { goal_id: string; enabled: number; time: string | null; weekdays: string | null; only_when_incomplete: number; quiet_start: string | null; quiet_end: string | null; updated_at: string; }
function mapRow(row: Row): ReminderPolicy { return { goalId: row.goal_id, enabled: Boolean(row.enabled), time: row.time ?? undefined,
  weekdays: row.weekdays ? JSON.parse(row.weekdays) as Weekday[] : undefined, onlyWhenIncomplete: Boolean(row.only_when_incomplete), quietStart: row.quiet_start ?? undefined, quietEnd: row.quiet_end ?? undefined, updatedAt: row.updated_at }; }
