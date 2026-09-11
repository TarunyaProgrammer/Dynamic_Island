import { describe, expect, it } from 'vitest';
import type { GoalAction, TodayPlan } from '@shared/types';
import { deriveTodayActionGroups } from './today-action-groups';

const action = (id: string, status: GoalAction['status'] = 'open'): GoalAction => ({
  id, goalId: 'goal-1', title: id, status, source: 'manual',
  createdAt: '2026-09-11T08:00:00.000Z', updatedAt: '2026-09-11T08:00:00.000Z',
  ...(status === 'completed' ? { completedAt: '2026-09-11T09:00:00.000Z' } : {}),
});

describe('deriveTodayActionGroups', () => {
  it('partitions planned and unplanned actions without duplicates', () => {
    const plan: TodayPlan = {
      date: '2026-09-11', createdAt: '2026-09-11T08:00:00.000Z', updatedAt: '2026-09-11T08:00:00.000Z',
      entries: [
        { actionId: 'focus', bucket: 'today', sortOrder: 0 },
        { actionId: 'completed', bucket: 'today', sortOrder: 1 },
        { actionId: 'later', bucket: 'later', sortOrder: 0 },
      ],
    };

    expect(deriveTodayActionGroups([action('unplanned'), action('later'), action('completed', 'completed'), action('focus')], plan)).toMatchObject({
      focus: [expect.objectContaining({ id: 'focus' })],
      later: [expect.objectContaining({ id: 'later' })],
      unplanned: [expect.objectContaining({ id: 'unplanned' })],
      completedFocusCount: 1,
      plannedFocusCount: 2,
    });
  });
});
