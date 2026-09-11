import Database from 'better-sqlite3';
import { TodayPlan, TodayPlanEntry } from '@shared/types';

export interface ITodayPlanRepository {
  get(date: string): TodayPlan | null;
  save(plan: TodayPlan): void;
}

export class SQLiteTodayPlanRepository implements ITodayPlanRepository {
  constructor(private readonly db: Database.Database) {}

  get(date: string): TodayPlan | null {
    const plan = this.db.prepare('SELECT * FROM today_plans WHERE date = ?').get(date) as PlanRow | undefined;
    if (!plan) return null;
    const entries = this.db.prepare(`
      SELECT action_id, sort_order, bucket FROM today_plan_actions
      WHERE plan_date = ? ORDER BY CASE bucket WHEN 'today' THEN 0 ELSE 1 END, sort_order ASC
    `).all(date) as EntryRow[];
    return { date: plan.date, intention: plan.intention ?? undefined, completedAt: plan.completed_at ?? undefined,
      createdAt: plan.created_at, updatedAt: plan.updated_at,
      entries: entries.map((entry) => ({ actionId: entry.action_id, sortOrder: entry.sort_order, bucket: entry.bucket })),
    };
  }

  save(plan: TodayPlan): void {
    const transaction = this.db.transaction(() => {
      this.db.prepare(`
        INSERT INTO today_plans (date, intention, completed_at, created_at, updated_at)
        VALUES (@date, @intention, @completedAt, @createdAt, @updatedAt)
        ON CONFLICT(date) DO UPDATE SET intention = excluded.intention, completed_at = excluded.completed_at, updated_at = excluded.updated_at
      `).run({ ...plan, intention: plan.intention ?? null, completedAt: plan.completedAt ?? null });
      this.db.prepare('DELETE FROM today_plan_actions WHERE plan_date = ?').run(plan.date);
      const insert = this.db.prepare(`INSERT INTO today_plan_actions (plan_date, action_id, sort_order, bucket) VALUES (?, ?, ?, ?)`);
      for (const entry of plan.entries) insert.run(plan.date, entry.actionId, entry.sortOrder, entry.bucket);
    });
    transaction();
  }
}

interface PlanRow { date: string; intention: string | null; completed_at: string | null; created_at: string; updated_at: string; }
interface EntryRow { action_id: string; sort_order: number; bucket: TodayPlanEntry['bucket']; }
