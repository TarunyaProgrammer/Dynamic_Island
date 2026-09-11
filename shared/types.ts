// shared/types.ts - Shared Domain Types & DTOs for Beacon

// ─── Goal Taxonomy ──────────────────────────────────────────────────────────

/** How a goal tracks progress. One of six canonical paradigms. */
export type GoalParadigm =
  | 'habit'           // Recurring: X sessions per period (week/day/month)
  | 'accumulative'    // Monotonic: collect N total items/hours/dollars
  | 'deadline'        // Velocity: X% by a specific date
  | 'milestone'       // Project: ordered checkpoints
  | 'duration'        // Time-budget: N hours per period (feeds from Focus timer)
  | 'avoidance';      // Abstinence: days streak without violation

/** Legacy alias kept for backwards compatibility with v1 data */
export type GoalType = 'numeric' | 'percentage' | 'count' | 'binary' | 'milestone';

export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived';
export type GoalPriority = 'critical' | 'high' | 'normal' | 'low';
export type GoalArea = 'Health' | 'Learning' | 'Career' | 'Projects' | 'Finance' | 'Personal' | string;

/** Temporal granularity of a goal's target */
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'total';

/** ISO weekday: 0 = Sunday … 6 = Saturday */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ─── Schedule Config ─────────────────────────────────────────────────────────

/**
 * Controls *when* and *how often* a habit/duration goal resets and what
 * days are valid sessions vs. forced rest.
 */
export interface ScheduleConfig {
  /** For habits: flexible count per period (e.g. any 5 days a week) */
  flexibleCount?: number;
  /** Specific weekdays required (e.g. [1,3,5] = Mon/Wed/Fri) */
  scheduledDays?: Weekday[];
  /** Days the system will never flag as missed (e.g. [0,6] = weekends) */
  restDays?: Weekday[];
  /** Week start day, defaults to 1 (Monday) */
  weekStartsOn?: Weekday;
  /** Custom period: ISO 8601 duration string e.g. "P3D" for every 3 days */
  customInterval?: string;
}

// ─── Streak Config ───────────────────────────────────────────────────────────

export type StreakType =
  | 'daily'             // Must complete every calendar day
  | 'scheduled'         // Must complete on all scheduledDays
  | 'period_threshold'; // Must hit flexibleCount within the period

export interface StreakConfig {
  enabled: boolean;
  type: StreakType;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate?: string; // ISO date YYYY-MM-DD
  /** Streak freeze days remaining (like Duolingo streak shield) */
  freezeDaysRemaining?: number;
}

// ─── Check-In ────────────────────────────────────────────────────────────────

export type CheckInState = 'completed' | 'skipped' | 'missed' | 'partial';
export type SkipReason = 'sick' | 'travel' | 'rest' | 'vacation' | 'custom';

export interface CheckIn {
  id: string;
  goalId: string;
  date: string;        // YYYY-MM-DD
  state: CheckInState;
  value: number;       // Sessions completed or minutes tracked
  skipReason?: SkipReason;
  note?: string;
  timestamp: string;   // Full ISO timestamp
}

// ─── Daily Execution Layer ──────────────────────────────────────────────────

/** A visible, completable next step belonging to exactly one goal. */
export type GoalActionStatus = 'open' | 'completed' | 'skipped' | 'archived';
export type GoalActionSource = 'manual' | 'onboarding' | 'reminder' | 'calendar' | 'automation';
export type TodayPlanBucket = 'today' | 'later';

export interface GoalAction {
  id: string;
  goalId: string;
  title: string;
  status: GoalActionStatus;
  plannedDate?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  estimatedMinutes?: number;
  source: GoalActionSource;
  externalLink?: string;
  /** Stable provider ID prevents importing the same Apple Reminder twice. */
  externalSourceId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  skippedAt?: string;
  skipReason?: SkipReason;
}

export interface TodayPlanEntry {
  actionId: string;
  sortOrder: number;
  bucket: TodayPlanBucket;
}

export interface TodayPlan {
  date: string;
  intention?: string;
  entries: TodayPlanEntry[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Persisted now so reminders can be introduced without a disruptive migration. */
export interface ReminderPolicy {
  goalId: string;
  enabled: boolean;
  time?: string;
  weekdays?: Weekday[];
  onlyWhenIncomplete: boolean;
  quietStart?: string;
  quietEnd?: string;
  updatedAt: string;
}

export interface CalendarContextEvent { id: string; title: string; start: string; end: string; calendar: string; }
export interface ExternalReminder { id: string; title: string; dueDate?: string; list: string; }

/** Append-only unit for future multi-device sync; never sync the SQLite file. */
export interface SyncOperation {
  id: string;
  deviceId: string;
  sequence: number;
  entityType: 'goal' | 'action' | 'today-plan' | 'reminder-policy' | 'milestone' | 'check-in' | 'progress-event' | 'focus-session';
  entityId: string;
  kind: 'upsert' | 'delete';
  payload?: Record<string, unknown>;
  createdAt: string;
  acknowledgedAt?: string;
}

export interface WeeklyReviewGoal {
  goalId: string;
  goalName: string;
  completedCheckIns: number;
  progressEvents: number;
  trajectory: string;
}

export interface WeeklyReview {
  weekEnding: string;
  commitmentsKept: number;
  commitmentsTotal: number;
  focusMinutes: number;
  friction: string[];
  adjustment: string;
  goals: WeeklyReviewGoal[];
}

// ─── Goal Health ─────────────────────────────────────────────────────────────

export type GoalHealthStatus = 'on_track' | 'ahead' | 'at_risk' | 'behind' | 'paused' | 'completed';

export interface GoalHealth {
  status: GoalHealthStatus;
  /** Fraction 0–1 of actual progress */
  actualProgress: number;
  /** Fraction 0–1 of expected progress given elapsed time (deadline goals only) */
  expectedProgress?: number;
  /** Ratio of actual / expected — >1 = ahead, <0.9 = at risk */
  velocityRatio?: number;
  /** How many sessions still needed this period (habit goals) */
  sessionsRemainingThisPeriod?: number;
  /** Days remaining until deadline */
  daysRemaining?: number;
  /** 30-day consistency percentage (0-100) */
  consistencyPercentage?: number;
  /** Momentum change vs prior 30-day period (+/- %) */
  momentumDelta?: number;
  /** Descriptive trajectory tag e.g. 'Ahead of pace', 'On track', 'At risk' */
  trajectoryLabel?: string;
}

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
  /** Weight 0–100; if undefined all milestones are equal */
  weight?: number;
  /** @deprecated use weight instead */
  targetContribution?: number;
  createdAt: string;
  completedAt?: string;
  sortOrder?: number;
}

export interface ProgressEvent {
  id: string;
  goalId: string;
  previousValue: number;
  newValue: number;
  delta: number;
  resultingValue: number;
  timestamp: string;
  note?: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;

  // Paradigm & legacy type
  paradigm: GoalParadigm;
  type: GoalType;              // kept for backwards compat; mirrors paradigm for v1 goals

  // Core numeric tracking (works for accumulative, duration, deadline)
  currentValue: number;
  targetValue: number;
  unit?: string;
  defaultIncrement: number;

  // Meta
  area: GoalArea;
  priority: GoalPriority;

  // Scheduling
  period: GoalPeriod;
  scheduleConfig?: ScheduleConfig;
  streakConfig?: StreakConfig;

  // Timeline
  startDate: string;
  deadline?: string;
  pausedUntil?: string;
  status: GoalStatus;

  // Relations
  milestones: Milestone[];
  recentCheckIns?: CheckIn[];  // last 7-14 days, pre-loaded for display

  // Computed health (not persisted, computed at read time)
  health?: GoalHealth;

  createdAt: string;
  updatedAt: string;
}

// ─── Companion Presence ─────────────────────────────────────────────────────

export type CompanionState =
  | 'idle'
  | 'greeting'
  | 'thinking'
  | 'celebrating'
  | 'concerned'
  | 'sleeping'
  | 'error'
  | 'smiling'
  | 'tickled';

export type CompanionSource = 'main' | 'tray' | 'island';

export interface CompanionEvent {
  id: string;
  state: CompanionState;
  source: CompanionSource;
  message?: string;
  occurredAt: string;
}

export interface GoalDraft {
  name: string;
  description?: string;
  paradigm?: GoalParadigm;
  type?: GoalType;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  defaultIncrement?: number;
  area?: GoalArea;
  priority?: GoalPriority;
  period?: GoalPeriod;
  scheduleConfig?: ScheduleConfig;
  streakConfig?: Partial<StreakConfig>;
  startDate?: string;
  deadline?: string;
  category?: string;          // deprecated alias for area
  milestones?: { title: string; weight?: number; targetContribution?: number }[];
}

export interface GoalUpdateDraft {
  name?: string;
  description?: string;
  paradigm?: GoalParadigm;
  type?: GoalType;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  defaultIncrement?: number;
  area?: GoalArea;
  priority?: GoalPriority;
  period?: GoalPeriod;
  scheduleConfig?: ScheduleConfig;
  streakConfig?: Partial<StreakConfig>;
  startDate?: string;
  deadline?: string;
  status?: GoalStatus;
  pausedUntil?: string;
  category?: string;
}

export type IslandPosition = 'notch' | 'floating';

export interface AppSettings {
  launchAtLogin: boolean;
  islandPosition: IslandPosition;
  autoCollapseDelay: number;
  showInAllSpaces: boolean;
  globalShortcut: string;
  theme?: 'dark' | 'system';
  soundMode?: 'silent' | 'subtle' | 'full';
  /** Kept locally; setup never requires a Beacon account. */
  onboardingCompleted?: boolean;
}

export interface BeaconStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overallProgressFraction: number;
  todayIncrementsCount: number;
  consistencyPercentage?: number;
  momentumScore?: number;
  momentumDeltaPercent?: number;
  commitmentsKept?: {
    completed: number;
    total: number;
  };
}

/* ==========================================================================
   Live Activity Layer & Priority Stacking Models
   ========================================================================== */

export type ActivityPriority = 'critical' | 'high' | 'normal' | 'low';
export type ActivityType = 'goal' | 'focus' | 'media' | 'timer' | 'system' | 'calendar';

export interface LiveActivity {
  id: string;
  type: ActivityType;
  priority: ActivityPriority;
  title: string;
  subtitle?: string;
  progressFraction?: number;
  iconName?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface FocusSessionState {
  goalId?: string;
  actionId?: string;
  goalName?: string;
  durationSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  isPaused: boolean;
}

export interface FocusCompletedEvent {
  goalId?: string;
  actionId?: string;
  goalName?: string;
  durationMinutes: number;
  timestamp: string;
}

export interface MediaActivityState {
  title: string;
  artist: string;
  album?: string;
  /** Artwork supplied by a trusted media provider, when one is available. */
  artworkUrl?: string;
  isPlaying: boolean;
  progressSeconds: number;
  durationSeconds: number;
  volume?: number;
}
