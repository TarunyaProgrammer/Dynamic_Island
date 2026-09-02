// shared/types.ts - Shared Domain Types & DTOs for Beacon

export type GoalType = 'numeric' | 'percentage' | 'count' | 'binary' | 'milestone';
export type GoalStatus = 'active' | 'completed' | 'archived';
export type IslandPosition = 'notch' | 'floating';

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  isCompleted: boolean;
  targetContribution?: number;
  createdAt: string;
  completedAt?: string;
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
  type: GoalType;
  currentValue: number;
  targetValue: number;
  unit?: string;
  defaultIncrement: number;
  startDate: string;
  deadline?: string;
  status: GoalStatus;
  category?: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalDraft {
  name: string;
  description?: string;
  type: GoalType;
  targetValue: number;
  currentValue?: number;
  unit?: string;
  defaultIncrement?: number;
  startDate?: string;
  deadline?: string;
  category?: string;
  milestones?: { title: string; targetContribution?: number }[];
}

export interface GoalUpdateDraft {
  name?: string;
  description?: string;
  type?: GoalType;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  defaultIncrement?: number;
  startDate?: string;
  deadline?: string;
  status?: GoalStatus;
  category?: string;
}

export interface AppSettings {
  launchAtLogin: boolean;
  islandPosition: IslandPosition;
  autoCollapseDelay: number;
  showInAllSpaces: boolean;
  globalShortcut: string;
  theme: 'system' | 'dark' | 'light';
}

export interface BeaconStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overallProgressFraction: number;
  todayIncrementsCount: number;
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
  goalName?: string;
  durationSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  isPaused: boolean;
}

export interface MediaActivityState {
  title: string;
  artist: string;
  album?: string;
  isPlaying: boolean;
  progressSeconds: number;
  durationSeconds: number;
  volume?: number;
}
