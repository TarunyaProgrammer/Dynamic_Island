// packages/core/services/health-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { HealthCalculator } from './health-calculator';
import { Goal } from '@shared/types';

function makeGoal(overrides: Partial<Goal>): Goal {
  return {
    id: 'g1', name: 'Test', paradigm: 'accumulative', type: 'numeric',
    currentValue: 0, targetValue: 100, unit: undefined, defaultIncrement: 1,
    area: 'Personal', priority: 'normal', period: 'total',
    startDate: '2024-01-01', status: 'active', milestones: [],
    createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('HealthCalculator — deadline', () => {
  it('returns "ahead" when actual progress exceeds expected', () => {
    // 50% into the duration, at 80% done → ahead
    const goal = makeGoal({
      paradigm: 'deadline',
      startDate: '2024-01-01',
      deadline: '2024-03-01', // ~60 day window
      currentValue: 80,
      targetValue: 100,
    });
    // today is halfway through: Jan 30
    const health = HealthCalculator.compute(goal, [], '2024-01-30');
    expect(health.status).toBe('ahead');
    expect(health.velocityRatio).toBeGreaterThan(1.05);
  });

  it('returns "behind" when significantly behind schedule', () => {
    // 90% through duration but only 30% done
    const goal = makeGoal({
      paradigm: 'deadline',
      startDate: '2024-01-01',
      deadline: '2024-02-01', // 31-day window
      currentValue: 10,
      targetValue: 100,
    });
    // Today is Jan 28 — 27/31 = 87% elapsed, only 10% done
    const health = HealthCalculator.compute(goal, [], '2024-01-28');
    expect(health.status).toBe('behind');
    expect(health.velocityRatio).toBeLessThan(0.75);
  });

  it('returns "on_track" when within normal bounds', () => {
    const goal = makeGoal({
      paradigm: 'deadline',
      startDate: '2024-01-01',
      deadline: '2024-02-01',
      currentValue: 50,
      targetValue: 100,
    });
    // 50% done, ~50% elapsed → velocity ≈ 1.0
    const health = HealthCalculator.compute(goal, [], '2024-01-16');
    expect(['on_track', 'ahead']).toContain(health.status);
  });
});

describe('HealthCalculator — milestone', () => {
  it('computes progress from equal-weight milestones', () => {
    const goal = makeGoal({
      paradigm: 'milestone',
      targetValue: 100,
      milestones: [
        { id: 'm1', goalId: 'g1', title: 'A', isCompleted: true, createdAt: '' },
        { id: 'm2', goalId: 'g1', title: 'B', isCompleted: true, createdAt: '' },
        { id: 'm3', goalId: 'g1', title: 'C', isCompleted: false, createdAt: '' },
        { id: 'm4', goalId: 'g1', title: 'D', isCompleted: false, createdAt: '' },
      ],
    });
    const health = HealthCalculator.compute(goal);
    expect(health.actualProgress).toBeCloseTo(0.5);
  });

  it('respects weighted milestones', () => {
    const goal = makeGoal({
      paradigm: 'milestone',
      milestones: [
        { id: 'm1', goalId: 'g1', title: 'Small', isCompleted: true, weight: 10, createdAt: '' },
        { id: 'm2', goalId: 'g1', title: 'Big',   isCompleted: false, weight: 90, createdAt: '' },
      ],
    });
    const health = HealthCalculator.compute(goal);
    // 10 / 100 total weight = 10%
    expect(health.actualProgress).toBeCloseTo(0.1);
  });
});

describe('HealthCalculator — paused/completed', () => {
  it('returns "paused" status for paused goals', () => {
    const goal = makeGoal({ status: 'paused', currentValue: 40 });
    const health = HealthCalculator.compute(goal);
    expect(health.status).toBe('paused');
  });

  it('returns "completed" status for completed goals', () => {
    const goal = makeGoal({ status: 'completed' });
    const health = HealthCalculator.compute(goal);
    expect(health.status).toBe('completed');
    expect(health.actualProgress).toBe(1);
  });
});
