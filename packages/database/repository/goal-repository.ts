// packages/database/repository/goal-repository.ts - SQLite Goal Repository
import Database from 'better-sqlite3';
import {
  BeaconStats,
  CheckIn,
  CheckInState,
  Goal,
  GoalArea,
  GoalParadigm,
  GoalPeriod,
  GoalPriority,
  GoalStatus,
  Milestone,
  ProgressEvent,
  ScheduleConfig,
  SkipReason,
  StreakConfig,
} from '@shared/types';

export interface IGoalRepository {
  getAllGoals(status?: GoalStatus): Goal[];
  getGoalById(id: string): Goal | null;
  saveGoal(goal: Goal): void;
  deleteGoal(id: string): boolean;
  updateGoal(goal: Goal): void;
  saveMilestone(milestone: Milestone): void;
  deleteMilestone(id: string): boolean;
  saveProgressEvent(event: ProgressEvent): void;
  getProgressEvents(goalId?: string, limit?: number): ProgressEvent[];
  deleteProgressEvent(eventId: string): boolean;
  // Check-in API (v2)
  saveCheckIn(checkIn: CheckIn): void;
  getCheckIns(goalId: string, since?: string): CheckIn[];
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
        default_increment, start_date, deadline, status, category,
        paradigm, area, priority, period,
        schedule_config, streak_config, paused_until,
        created_at, updated_at
      ) VALUES (
        @id, @name, @description, @type, @currentValue, @targetValue, @unit,
        @defaultIncrement, @startDate, @deadline, @status, @category,
        @paradigm, @area, @priority, @period,
        @scheduleConfig, @streakConfig, @pausedUntil,
        @createdAt, @updatedAt
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
        paradigm = excluded.paradigm,
        area = excluded.area,
        priority = excluded.priority,
        period = excluded.period,
        schedule_config = excluded.schedule_config,
        streak_config = excluded.streak_config,
        paused_until = excluded.paused_until,
        updated_at = excluded.updated_at
    `);

    const transaction = this.db.transaction(() => {
      stmt.run({
        id: goal.id,
        name: goal.name,
        description: goal.description || null,
        type: goal.type || 'numeric',
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        unit: goal.unit || null,
        defaultIncrement: goal.defaultIncrement || 1,
        startDate: goal.startDate,
        deadline: goal.deadline || null,
        status: goal.status,
        category: (goal as any).category || null,
        paradigm: goal.paradigm || 'accumulative',
        area: goal.area || 'Personal',
        priority: goal.priority || 'normal',
        period: goal.period || 'total',
        scheduleConfig: goal.scheduleConfig ? JSON.stringify(goal.scheduleConfig) : null,
        streakConfig: goal.streakConfig ? JSON.stringify(goal.streakConfig) : null,
        pausedUntil: goal.pausedUntil || null,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      });

      if (goal.milestones) {
        for (const m of goal.milestones) {
          this.saveMilestone(m);
        }
      }
    });

    transaction();
  }

  /** Alias for saveGoal — satisfies IGoalRepository contract */
  updateGoal(goal: Goal): void {
    this.saveGoal(goal);
  }

  deleteGoal(id: string): boolean {
    const result = this.db.prepare('DELETE FROM goals WHERE id = ?').run(id);
    return result.changes > 0;
  }

  saveMilestone(milestone: Milestone): void {
    const stmt = this.db.prepare(`
      INSERT INTO milestones (
        id, goal_id, title, is_completed, weight, target_contribution, sort_order, created_at, completed_at
      ) VALUES (
        @id, @goalId, @title, @isCompleted, @weight, @targetContribution, @sortOrder, @createdAt, @completedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        is_completed = excluded.is_completed,
        weight = excluded.weight,
        target_contribution = excluded.target_contribution,
        sort_order = excluded.sort_order,
        completed_at = excluded.completed_at
    `);

    stmt.run({
      id: milestone.id,
      goalId: milestone.goalId,
      title: milestone.title,
      isCompleted: milestone.isCompleted ? 1 : 0,
      weight: milestone.weight ?? null,
      targetContribution: milestone.targetContribution || null,
      sortOrder: milestone.sortOrder ?? 0,
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

  // ─── Check-In API (v2) ───────────────────────────────────────────────────

  saveCheckIn(checkIn: CheckIn): void {
    const stmt = this.db.prepare(`
      INSERT INTO goal_checkins (id, goal_id, date, state, value, skip_reason, note, timestamp)
      VALUES (@id, @goalId, @date, @state, @value, @skipReason, @note, @timestamp)
      ON CONFLICT(goal_id, date) DO UPDATE SET
        state = excluded.state,
        value = excluded.value,
        skip_reason = excluded.skip_reason,
        note = excluded.note,
        timestamp = excluded.timestamp
    `);

    stmt.run({
      id: checkIn.id,
      goalId: checkIn.goalId,
      date: checkIn.date,
      state: checkIn.state,
      value: checkIn.value,
      skipReason: checkIn.skipReason || null,
      note: checkIn.note || null,
      timestamp: checkIn.timestamp,
    });
  }

  getCheckIns(goalId: string, since?: string): CheckIn[] {
    let query = 'SELECT * FROM goal_checkins WHERE goal_id = ?';
    const params: unknown[] = [goalId];
    if (since) {
      query += ' AND date >= ?';
      params.push(since);
    }
    query += ' ORDER BY date DESC LIMIT 60';

    const rows = this.db.prepare(query).all(...params) as any[];
    return rows.map((r) => ({
      id: r.id,
      goalId: r.goal_id,
      date: r.date,
      state: r.state as CheckInState,
      value: r.value,
      skipReason: (r.skip_reason as SkipReason) || undefined,
      note: r.note || undefined,
      timestamp: r.timestamp,
    }));
  }

  // ─── Stats ───────────────────────────────────────────────────────────────

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

    // 30-day Consistency and Momentum
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0];

    const recentCheckIns = this.db
      .prepare('SELECT state, date FROM goal_checkins WHERE date >= ?')
      .all(thirtyDaysAgo) as { state: string; date: string }[];

    const priorCheckIns = this.db
      .prepare('SELECT state, date FROM goal_checkins WHERE date >= ? AND date < ?')
      .all(sixtyDaysAgo, thirtyDaysAgo) as { state: string; date: string }[];

    const recentCompleted = recentCheckIns.filter((c) => c.state === 'completed').length;
    const consistencyPercentage =
      recentCheckIns.length > 0 ? Math.round((recentCompleted / recentCheckIns.length) * 100) : 100;

    const priorCompleted = priorCheckIns.filter((c) => c.state === 'completed').length;
    const priorConsistency =
      priorCheckIns.length > 0 ? Math.round((priorCompleted / priorCheckIns.length) * 100) : consistencyPercentage;

    const momentumDeltaPercent = consistencyPercentage - priorConsistency;
    const momentumScore = Math.min(100, Math.max(0, consistencyPercentage));

    // Weekly commitments kept
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    const mondayIso = monday.toISOString().split('T')[0];

    const weekCheckIns = this.db
      .prepare('SELECT state FROM goal_checkins WHERE date >= ?')
      .all(mondayIso) as { state: string }[];

    const weekCompleted = weekCheckIns.filter((c) => c.state === 'completed').length;
    const commitmentsKept = {
      completed: weekCompleted,
      total: Math.max(activeGoals, weekCheckIns.length),
    };

    return {
      totalGoals,
      activeGoals,
      completedGoals,
      overallProgressFraction: totalFraction,
      todayIncrementsCount,
      consistencyPercentage,
      momentumScore,
      momentumDeltaPercent,
      commitmentsKept,
    };
  }

  // ─── Row Mapping ─────────────────────────────────────────────────────────

  private mapGoalRow(row: any): Goal {
    const milestones = this.db
      .prepare('SELECT * FROM milestones WHERE goal_id = ? ORDER BY sort_order ASC, created_at ASC')
      .all(row.id) as any[];

    const recentCheckIns = this.getCheckIns(row.id, this.daysAgoIso(14));

    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      paradigm: (row.paradigm || 'accumulative') as GoalParadigm,
      type: row.type,
      currentValue: row.current_value,
      targetValue: row.target_value,
      unit: row.unit || undefined,
      defaultIncrement: row.default_increment,
      area: (row.area || 'Personal') as GoalArea,
      priority: (row.priority || 'normal') as GoalPriority,
      period: (row.period || 'total') as GoalPeriod,
      scheduleConfig: row.schedule_config ? (JSON.parse(row.schedule_config) as ScheduleConfig) : undefined,
      streakConfig: row.streak_config ? (JSON.parse(row.streak_config) as StreakConfig) : undefined,
      startDate: row.start_date,
      deadline: row.deadline || undefined,
      pausedUntil: row.paused_until || undefined,
      status: row.status as GoalStatus,
      milestones: milestones.map((m) => ({
        id: m.id,
        goalId: m.goal_id,
        title: m.title,
        isCompleted: Boolean(m.is_completed),
        weight: m.weight ?? undefined,
        targetContribution: m.target_contribution || undefined,
        sortOrder: m.sort_order ?? 0,
        createdAt: m.created_at,
        completedAt: m.completed_at || undefined,
      })),
      recentCheckIns,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private daysAgoIso(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  }
}
