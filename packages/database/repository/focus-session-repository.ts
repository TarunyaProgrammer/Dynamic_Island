import { randomUUID } from 'node:crypto';
import Database from 'better-sqlite3';
import { FocusCompletedEvent } from '@shared/types';

export interface FocusSessionRecord extends FocusCompletedEvent { id: string; }

export class FocusSessionRepository {
  constructor(private readonly db: Database.Database) {}
  save(event: FocusCompletedEvent): FocusSessionRecord {
    const session = { ...event, id: randomUUID() };
    this.db.prepare('INSERT INTO focus_sessions (id, goal_id, action_id, duration_minutes, completed_at) VALUES (?, ?, ?, ?, ?)').run(session.id, session.goalId ?? null, session.actionId ?? null, session.durationMinutes, session.timestamp);
    return session;
  }
  totalMinutesSince(date: string): number { return (this.db.prepare('SELECT COALESCE(SUM(duration_minutes), 0) AS total FROM focus_sessions WHERE completed_at >= ?').get(date) as { total: number }).total; }
}
