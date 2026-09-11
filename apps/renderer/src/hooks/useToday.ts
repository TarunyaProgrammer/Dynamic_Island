import { useCallback, useEffect, useState } from 'react';
import { GoalAction, SkipReason, TodayPlan } from '@shared/types';

export function useToday() {
  const [plan, setPlan] = useState<TodayPlan | null>(null);
  const [actions, setActions] = useState<GoalAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [nextPlan, activeGoals] = await Promise.all([
        window.beacon.today.get(),
        window.beacon.goals.list('active'),
      ]);
      const openActions = await window.beacon.actions.listOpenForGoals(activeGoals.map((goal) => goal.id));
      const openActionIds = new Set(openActions.map((action) => action.id));
      const nonOpenPlanned = await Promise.all(
        [...new Set(nextPlan.entries.map((entry) => entry.actionId))]
          .filter((actionId) => !openActionIds.has(actionId))
          .map((actionId) => window.beacon.actions.get(actionId)),
      );
      setPlan(nextPlan);
      setActions([...openActions, ...nonOpenPlanned.filter((action): action is GoalAction => action !== null)]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load today’s actions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return window.beacon.onTodayChanged(refresh);
  }, [refresh]);

  return {
    plan, actions, loading, error, refresh,
    planAction: (actionId: string) => window.beacon.today.planAction(actionId),
    createAction: (input: { goalId: string; title: string; estimatedMinutes?: number }) => window.beacon.actions.create(input),
    complete: (actionId: string) => window.beacon.actions.complete(actionId),
    skip: (actionId: string, reason: SkipReason = 'custom') => window.beacon.actions.skip(actionId, reason),
    move: (actionId: string, bucket: 'today' | 'later') => window.beacon.today.moveAction(actionId, bucket),
    reschedule: (actionId: string, targetDate: string) => window.beacon.today.rescheduleAction(actionId, targetDate),
  };
}
