import Database from 'better-sqlite3';
import { GoalAction, GoalActionStatus, SkipReason } from '@shared/types';

export interface IActionRepository {
  getById(id: string): GoalAction | null;
  listForGoal(goalId: string, status?: GoalActionStatus): GoalAction[];
  listOpenForGoalIds(goalIds: readonly string[]): GoalAction[];
  save(action: GoalAction): void;
  findByExternalSourceId(sourceId: string): GoalAction | null;
}

export class SQLiteActionRepository implements IActionRepository {
  constructor(private readonly db: Database.Database) {}

  getById(id: string): GoalAction | null {
    const row = this.db.prepare('SELECT * FROM goal_actions WHERE id = ?').get(id) as Row | undefined;
    return row ? mapRow(row) : null;
  }

  listForGoal(goalId: string, status?: GoalActionStatus): GoalAction[] {
    const rows = status
      ? this.db.prepare('SELECT * FROM goal_actions WHERE goal_id = ? AND status = ? ORDER BY updated_at DESC').all(goalId, status)
      : this.db.prepare('SELECT * FROM goal_actions WHERE goal_id = ? ORDER BY updated_at DESC').all(goalId);
    return (rows as Row[]).map(mapRow);
  }
  listOpenForGoalIds(goalIds: readonly string[]): GoalAction[] {
    if (goalIds.length === 0) return [];
    const placeholders = goalIds.map(() => '?').join(', ');
    const rows = this.db.prepare(
      `SELECT * FROM goal_actions WHERE status = 'open' AND goal_id IN (${placeholders}) ORDER BY updated_at DESC`,
    ).all(...goalIds) as Row[];
    return rows.map(mapRow);
  }
  findByExternalSourceId(sourceId: string): GoalAction | null { const row = this.db.prepare('SELECT * FROM goal_actions WHERE external_source_id = ?').get(sourceId) as Row | undefined; return row ? mapRow(row) : null; }

  save(action: GoalAction): void {
    this.db.prepare(`
      INSERT INTO goal_actions (
        id, goal_id, title, status, planned_date, scheduled_start, scheduled_end,
        estimated_minutes, source, external_link, external_source_id, completed_at, skipped_at,
        skip_reason, created_at, updated_at
      ) VALUES (
        @id, @goalId, @title, @status, @plannedDate, @scheduledStart, @scheduledEnd,
        @estimatedMinutes, @source, @externalLink, @externalSourceId, @completedAt, @skippedAt,
        @skipReason, @createdAt, @updatedAt
      ) ON CONFLICT(id) DO UPDATE SET
        title = excluded.title, status = excluded.status, planned_date = excluded.planned_date,
        scheduled_start = excluded.scheduled_start, scheduled_end = excluded.scheduled_end,
        estimated_minutes = excluded.estimated_minutes, source = excluded.source,
        external_link = excluded.external_link, external_source_id = excluded.external_source_id, completed_at = excluded.completed_at,
        skipped_at = excluded.skipped_at, skip_reason = excluded.skip_reason,
        updated_at = excluded.updated_at
    `).run(toRow(action));
  }
}

interface Row {
  id: string; goal_id: string; title: string; status: GoalActionStatus; planned_date: string | null;
  scheduled_start: string | null; scheduled_end: string | null; estimated_minutes: number | null;
  source: GoalAction['source']; external_link: string | null; external_source_id: string | null; completed_at: string | null;
  skipped_at: string | null; skip_reason: SkipReason | null; created_at: string; updated_at: string;
}

function mapRow(row: Row): GoalAction {
  return {
    id: row.id, goalId: row.goal_id, title: row.title, status: row.status,
    plannedDate: row.planned_date ?? undefined, scheduledStart: row.scheduled_start ?? undefined,
    scheduledEnd: row.scheduled_end ?? undefined, estimatedMinutes: row.estimated_minutes ?? undefined,
    source: row.source, externalLink: row.external_link ?? undefined, externalSourceId: row.external_source_id ?? undefined, completedAt: row.completed_at ?? undefined,
    skippedAt: row.skipped_at ?? undefined, skipReason: row.skip_reason ?? undefined,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toRow(action: GoalAction) {
  return {
    ...action,
    plannedDate: action.plannedDate ?? null, scheduledStart: action.scheduledStart ?? null,
    scheduledEnd: action.scheduledEnd ?? null, estimatedMinutes: action.estimatedMinutes ?? null,
    externalLink: action.externalLink ?? null, externalSourceId: action.externalSourceId ?? null, completedAt: action.completedAt ?? null,
    skippedAt: action.skippedAt ?? null, skipReason: action.skipReason ?? null,
  };
}
