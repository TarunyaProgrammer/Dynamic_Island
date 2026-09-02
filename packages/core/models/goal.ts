// packages/core/models/goal.ts
import {
  CheckIn,
  Goal,
  GoalArea,
  GoalDraft,
  GoalParadigm,
  GoalPeriod,
  GoalPriority,
  GoalStatus,
  GoalType,
  Milestone,
  ScheduleConfig,
  StreakConfig,
} from '@shared/types';
import { randomUUID } from 'crypto';

export class GoalEntity implements Goal {
  id: string;
  name: string;
  description?: string;

  paradigm: GoalParadigm;
  type: GoalType;

  currentValue: number;
  targetValue: number;
  unit?: string;
  defaultIncrement: number;

  area: GoalArea;
  priority: GoalPriority;
  period: GoalPeriod;
  scheduleConfig?: ScheduleConfig;
  streakConfig?: StreakConfig;

  startDate: string;
  deadline?: string;
  pausedUntil?: string;
  status: GoalStatus;

  milestones: Milestone[];
  recentCheckIns?: CheckIn[];

  createdAt: string;
  updatedAt: string;

  constructor(data: Goal) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.paradigm = data.paradigm ?? 'accumulative';
    this.type = data.type ?? 'numeric';
    this.currentValue = data.currentValue;
    this.targetValue = data.targetValue;
    this.unit = data.unit;
    this.defaultIncrement = data.defaultIncrement;
    this.area = data.area ?? 'Personal';
    this.priority = data.priority ?? 'normal';
    this.period = data.period ?? 'total';
    this.scheduleConfig = data.scheduleConfig;
    this.streakConfig = data.streakConfig;
    this.startDate = data.startDate;
    this.deadline = data.deadline;
    this.pausedUntil = data.pausedUntil;
    this.status = data.status;
    this.milestones = data.milestones || [];
    this.recentCheckIns = data.recentCheckIns;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static createFromDraft(draft: GoalDraft): GoalEntity {
    const now = new Date().toISOString();
    const id = randomUUID();

    const paradigm: GoalParadigm = draft.paradigm ?? inferParadigmFromType(draft.type);
    const period: GoalPeriod = draft.period ?? inferPeriodFromParadigm(paradigm);

    const milestones: Milestone[] = (draft.milestones || []).map((m, i) => ({
      id: randomUUID(),
      goalId: id,
      title: m.title,
      isCompleted: false,
      weight: m.weight,
      targetContribution: m.targetContribution,
      sortOrder: i,
      createdAt: now,
    }));

    const streakConfig: StreakConfig | undefined =
      paradigm === 'habit' || paradigm === 'duration' || paradigm === 'avoidance'
        ? {
            enabled: true,
            type: draft.scheduleConfig?.scheduledDays ? 'scheduled' : 'period_threshold',
            currentStreak: 0,
            bestStreak: 0,
            ...(draft.streakConfig ?? {}),
          }
        : undefined;

    return new GoalEntity({
      id,
      name: draft.name.trim(),
      description: draft.description?.trim(),
      paradigm,
      type: draft.type ?? 'numeric',
      currentValue: Math.max(0, draft.currentValue ?? 0),
      targetValue: Math.max(0, draft.targetValue ?? 1),
      unit: draft.unit?.trim(),
      defaultIncrement: draft.defaultIncrement && draft.defaultIncrement > 0 ? draft.defaultIncrement : 1,
      area: draft.area ?? (draft.category as GoalArea) ?? 'Personal',
      priority: draft.priority ?? 'normal',
      period,
      scheduleConfig: draft.scheduleConfig,
      streakConfig,
      startDate: draft.startDate || now,
      deadline: draft.deadline,
      status: 'active',
      milestones,
      createdAt: now,
      updatedAt: now,
    });
  }

  get progressFraction(): number {
    if (this.status === 'completed') return 1.0;
    if (this.targetValue <= 0) return 0.0;
    return Math.min(1.0, Math.max(0.0, this.currentValue / this.targetValue));
  }

  get progressPercent(): number {
    return Math.round(this.progressFraction * 100);
  }

  get isComplete(): boolean {
    return this.status === 'completed' || (this.targetValue > 0 && this.currentValue >= this.targetValue);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inferParadigmFromType(type?: GoalType): GoalParadigm {
  switch (type) {
    case 'milestone': return 'milestone';
    case 'binary': return 'avoidance';
    case 'count': return 'accumulative';
    default: return 'accumulative';
  }
}

function inferPeriodFromParadigm(paradigm: GoalParadigm): GoalPeriod {
  switch (paradigm) {
    case 'habit':
    case 'duration': return 'weekly';
    case 'avoidance': return 'daily';
    default: return 'total';
  }
}
