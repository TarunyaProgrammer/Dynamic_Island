// apps/renderer/src/hooks/useGoals.ts
import { useState, useEffect, useCallback } from 'react';
import { BeaconStats, Goal, GoalDraft, GoalStatus, GoalUpdateDraft, ProgressEvent } from '@shared/types';

export function useGoals(filterStatus?: GoalStatus) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<BeaconStats | null>(null);
  const [history, setHistory] = useState<ProgressEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      if (!window.beacon) return;
      const [list, s, hist] = await Promise.all([
        window.beacon.goals.list(filterStatus),
        window.beacon.stats.get(),
        window.beacon.history.getEvents(undefined, 30),
      ]);
      setGoals(list);
      setStats(s);
      setHistory(hist);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    refresh();
    if (!window.beacon) return;
    const unsubscribe = window.beacon.onGoalsChanged(() => {
      refresh();
    });
    return () => unsubscribe();
  }, [refresh]);

  const createGoal = async (draft: GoalDraft) => {
    return window.beacon.goals.create(draft);
  };

  const updateGoal = async (id: string, update: GoalUpdateDraft) => {
    return window.beacon.goals.update(id, update);
  };

  const deleteGoal = async (id: string) => {
    return window.beacon.goals.delete(id);
  };

  const completeGoal = async (id: string) => {
    return window.beacon.goals.complete(id);
  };

  const archiveGoal = async (id: string) => {
    return window.beacon.goals.archive(id);
  };

  const incrementProgress = async (goalId: string, delta?: number, note?: string) => {
    return window.beacon.goals.increment(goalId, delta, note);
  };

  const setProgress = async (goalId: string, value: number, note?: string) => {
    return window.beacon.goals.setProgress(goalId, value, note);
  };

  const addMilestone = async (goalId: string, title: string, contribution?: number) => {
    return window.beacon.milestones.create(goalId, title, contribution);
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    return window.beacon.milestones.toggle(goalId, milestoneId);
  };

  const deleteMilestone = async (goalId: string, milestoneId: string) => {
    return window.beacon.milestones.delete(goalId, milestoneId);
  };

  const undo = async () => {
    return window.beacon.history.undo();
  };

  const redo = async () => {
    return window.beacon.history.redo();
  };

  return {
    goals,
    stats,
    history,
    loading,
    refresh,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    archiveGoal,
    incrementProgress,
    setProgress,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    undo,
    redo,
  };
}
