import { describe, expect, it } from 'vitest';
import { Goal, ReminderPolicy } from '@shared/types';
import { isReminderDue, isWithinQuietHours, ReminderDeliveryGate } from './reminder-scheduler';

const goal = { id: 'g1', name: 'Read', status: 'active' } as Goal;
const policy: ReminderPolicy = { goalId: 'g1', enabled: true, time: '09:30', weekdays: [1], onlyWhenIncomplete: true, updatedAt: '2026-01-01T00:00:00Z' };
const mondayAtTime = new Date(2026, 8, 7, 9, 30);

describe('reminder scheduler', () => {
  it('honours local time, weekdays, goal lifecycle, and quiet hours', () => {
    expect(isReminderDue(policy, goal, mondayAtTime)).toBe(true);
    expect(isReminderDue(policy, { ...goal, status: 'completed' }, mondayAtTime)).toBe(false);
    expect(isReminderDue({ ...policy, quietStart: '22:00', quietEnd: '07:00' }, goal, mondayAtTime)).toBe(true);
    expect(isReminderDue({ ...policy, quietStart: '09:00', quietEnd: '10:00' }, goal, mondayAtTime)).toBe(false);
    expect(isWithinQuietHours('23:30', '22:00', '07:00')).toBe(true);
    expect(isWithinQuietHours('06:30', '22:00', '07:00')).toBe(true);
  });

  it('delivers no more than once for the same goal on a local date', () => {
    const gate = new ReminderDeliveryGate();
    expect(gate.shouldDeliver(policy, goal, mondayAtTime)).toBe(true);
    expect(gate.shouldDeliver(policy, goal, mondayAtTime)).toBe(false);
    expect(gate.shouldDeliver(policy, goal, new Date(2026, 8, 14, 9, 30))).toBe(true);
  });

  it('can reset a delivery gate for an explicit snooze', () => {
    const gate = new ReminderDeliveryGate();
    expect(gate.shouldDeliver(policy, goal, mondayAtTime)).toBe(true);
    gate.reset(goal.id);
    expect(gate.shouldDeliver(policy, goal, mondayAtTime)).toBe(true);
  });
});
