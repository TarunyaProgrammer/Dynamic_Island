// packages/core/commands/goal-commands.ts
import { GoalDraft, GoalUpdateDraft } from '@shared/types';

export type GoalCommand =
  | { type: 'CREATE_GOAL'; draft: GoalDraft }
  | { type: 'UPDATE_GOAL'; id: string; update: GoalUpdateDraft }
  | { type: 'DELETE_GOAL'; id: string }
  | { type: 'ARCHIVE_GOAL'; id: string }
  | { type: 'COMPLETE_GOAL'; id: string }
  | { type: 'INCREMENT_PROGRESS'; goalId: string; delta?: number; note?: string }
  | { type: 'SET_PROGRESS'; goalId: string; value: number; note?: string }
  | { type: 'ADD_MILESTONE'; goalId: string; title: string; targetContribution?: number }
  | { type: 'TOGGLE_MILESTONE'; goalId: string; milestoneId: string }
  | { type: 'DELETE_MILESTONE'; goalId: string; milestoneId: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };
