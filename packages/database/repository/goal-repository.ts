// packages/database/repository/goal-repository.ts - SQLite Goal Repository
import Database from 'better-sqlite3';
import { BeaconStats, Goal, GoalStatus, Milestone, ProgressEvent } from '@shared/types';

export interface IGoalRepository {
  getAllGoals(status?: GoalStatus): Goal[];
  getGoalById(id: string): Goal | null;
  saveGoal(goal: Goal): void;
  deleteGoal(id: string): boolean;
  saveMilestone(milestone: Milestone): void;
  deleteMilestone(id: string): boolean;
  saveProgressEvent(event: ProgressEvent): void;
  getProgressEvents(goalId?: string, limit?: number): ProgressEvent[];
  deleteProgressEvent(eventId: string): boolean;
  getStats(): BeaconStats;
}

export class SQLiteGoalRepository implements IGoalRepository {
  constructor(private db: Database.Database) {}

  getAllGoals(status?: GoalStatus): Goal[] {
    let query = 'SELECT * FROM goals';
    const params: unknown[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY updated_at DESC';

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((row) => this.mapGoalRow(row));
  }

  getGoalById(id: string): Goal | null {
    const row = this.db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.mapGoalRow(row);
  }

  saveGoal(goal: Goal): void {
    const stmt = this.db.prepare(`
      INSERT INTO goals (
        id, name, description, type, current_value, target_value, unit,
        default_increment, start_date, deadline, status, category, created_at, updated_at
      ) VALUES (
        @id, @name, @description, @type, @currentValue, @targetValue, @unit,
        @defaultIncrement, @startDate, @deadline, @status, @category, @createdAt, @updatedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        type = excluded.type,
        current_value = excluded.current_value,
        target_value = excluded.target_value,
        unit = excluded.unit,
        default_increment = excluded.default_increment,
        start_date = excluded.start_date,
        deadline = excluded.deadline,
        status = excluded.status,
        category = excluded.category,
        updated_at = excluded.updated_at
    `);

    const transaction = this.db.transaction(() => {
      stmt.run({
        id: goal.id,
        name: goal.name,
        description: goal.description || null,
        type: goal.type,
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        unit: goal.unit || null,
        defaultIncrement: goal.defaultIncrement || 1,
        startDate: goal.startDate,
        deadline: goal.deadline || null,
        status: goal.status,
        category: goal.category || null,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      });

      // Synchronize milestones if provided
      if (goal.milestones) {
        for (const m of goal.milestones) {
          this.saveMilestone(m);
        }
      }
    });

    transaction();
  }

  deleteGoal(id: string): boolean {
    const result = this.db.prepare('DELETE FROM goals WHERE id = ?').run(id);
    return result.changes > 0;
  }

  saveMilestone(milestone: Milestone): void {
    const stmt = this.db.prepare(`
      INSERT INTO milestones (
        id, goal_id, title, is_completed, target_contribution, created_at, completed_at
      ) VALUES (
        @id, @goalId, @title, @isCompleted, @targetContribution, @createdAt, @completedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        is_completed = excluded.is_completed,
        target_contribution = excluded.target_contribution,
        completed_at = excluded.completed_at
    `);

    stmt.run({
      id: milestone.id,
      goalId: milestone.goalId,
      title: milestone.title,
      isCompleted: milestone.isCompleted ? 1 : 0,
      targetContribution: milestone.targetContribution || null,
      createdAt: milestone.createdAt,
      completedAt: milestone.completedAt || null,
    });
  }

  deleteMilestone(id: string): boolean {
    const result = this.db.prepare('DELETE FROM milestones WHERE id = ?').run(id);
    return result.changes > 0;
  }

  saveProgressEvent(event: ProgressEvent): void {
    const stmt = this.db.prepare(`
      INSERT INTO progress_events (
        id, goal_id, previous_value, new_value, delta, resulting_value, timestamp, note
      ) VALUES (
        @id, @goalId, @previousValue, @newValue, @delta, @resultingValue, @timestamp, @note
      )
    `);

    stmt.run({
      id: event.id,
      goalId: event.goalId,
      previousValue: event.previousValue,
      newValue: event.newValue,
      delta: event.delta,
      resultingValue: event.resultingValue,
      timestamp: event.timestamp,
      note: event.note || null,
    });
  }

  getProgressEvents(goalId?: string, limit = 50): ProgressEvent[] {
    let query = 'SELECT * FROM progress_events';
    const params: unknown[] = [];

    if (goalId) {
      query += ' WHERE goal_id = ?';
      params.push(goalId);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((r) => ({
      id: r.id,
      goalId: r.goal_id,
      previousValue: r.previous_value,
      newValue: r.new_value,
      delta: r.delta,
      resultingValue: r.resulting_value,
      timestamp: r.timestamp,
      note: r.note || undefined,
    }));
  }

  deleteProgressEvent(eventId: string): boolean {
    const result = this.db.prepare('DELETE FROM progress_events WHERE id = ?').run(eventId);
    return result.changes > 0;
  }

  getStats(): BeaconStats {
    const totalGoals = (this.db.prepare('SELECT COUNT(*) as count FROM goals').get() as any).count;
    const activeGoals = (this.db.prepare("SELECT COUNT(*) as count FROM goals WHERE status = 'active'").get() as any).count;
    const completedGoals = (this.db.prepare("SELECT COUNT(*) as count FROM goals WHERE status = 'completed'").get() as any).count;

    const todayIso = new Date().toISOString().split('T')[0];
    const todayIncrementsCount = (
      this.db.prepare('SELECT COUNT(*) as count FROM progress_events WHERE timestamp >= ?').get(`${todayIso}T00:00:00.000Z`) as any
    ).count;

    const activeList = this.getAllGoals('active');
    let totalFraction = 0;
    if (activeList.length > 0) {
      for (const g of activeList) {
        if (g.targetValue > 0) {
          totalFraction += Math.min(1.0, g.currentValue / g.targetValue);
        }
      }
      totalFraction /= activeList.length;
    }

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      overallProgressFraction: totalFraction,
      todayIncrementsCount,
    };
  }

  private mapGoalRow(row: any): Goal {
    const milestones = this.db
      .prepare('SELECT * FROM milestones WHERE goal_id = ? ORDER BY created_at ASC')
      .all(row.id) as any[];

    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      type: row.type,
      currentValue: row.current_value,
      targetValue: row.target_value,
      unit: row.unit || undefined,
      defaultIncrement: row.default_increment,
      startDate: row.start_date,
      deadline: row.deadline || undefined,
      status: row.status,
      category: row.category || undefined,
      milestones: milestones.map((m) => ({
        id: m.id,
        goalId: m.goal_id,
        title: m.title,
        isCompleted: Boolean(m.is_completed),
        targetContribution: m.target_contribution || undefined,
        createdAt: m.created_at,
        completedAt: m.completed_at || undefined,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
