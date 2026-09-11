import type { GoalAction, TodayPlan } from '@shared/types';

export interface TodayActionGroups {
  focus: GoalAction[];
  later: GoalAction[];
  unplanned: GoalAction[];
  completedFocusCount: number;
  plannedFocusCount: number;
}

export function deriveTodayActionGroups(actions: readonly GoalAction[], plan: TodayPlan | null): TodayActionGroups {
  const byId = new Map(actions.map((action) => [action.id, action]));
  const entries = [...(plan?.entries ?? [])].sort((left, right) => left.sortOrder - right.sortOrder);
  const plannedActionIds = new Set(entries.map((entry) => entry.actionId));
  const focus = entries
    .filter((entry) => entry.bucket === 'today')
    .map((entry) => byId.get(entry.actionId))
    .filter((action): action is GoalAction => action?.status === 'open');
  const later = entries
    .filter((entry) => entry.bucket === 'later')
    .map((entry) => byId.get(entry.actionId))
    .filter((action): action is GoalAction => action?.status === 'open');
  const unplanned = actions.filter((action) => action.status === 'open' && !plannedActionIds.has(action.id));
  const completedFocusCount = entries.filter((entry) => entry.bucket === 'today' && byId.get(entry.actionId)?.status === 'completed').length;

  return {
    focus,
    later,
    unplanned,
    completedFocusCount,
    plannedFocusCount: entries.filter((entry) => entry.bucket === 'today').length,
  };
}
