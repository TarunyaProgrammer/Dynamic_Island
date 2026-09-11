import React, { useEffect, useState } from 'react';
import { Goal, ReminderPolicy } from '@shared/types';
import { QuickTimePicker } from './QuickTimePicker';

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const ReminderPolicyModal: React.FC<{ goal: Goal | null; onClose: () => void }> = ({
  goal,
  onClose,
}) => {
  const [policy, setPolicy] = useState<ReminderPolicy | null>(null);

  useEffect(() => {
    if (goal) {
      void window.beacon.reminders.getPolicy(goal.id).then((saved) =>
        setPolicy(
          saved ?? {
            goalId: goal.id,
            enabled: false,
            time: '09:00',
            weekdays: [],
            onlyWhenIncomplete: true,
            updatedAt: '',
          }
        )
      );
    }
  }, [goal]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!goal || !policy) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Reminder settings for ${goal.name}`}
    >
      <div className="modal-content" style={{ width: 440 }}>
        <h2 style={{ marginTop: 0 }}>Quiet reminder</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          For {goal.name}. Beacon only nudges when this goal still needs attention.
        </p>

        <label
          htmlFor="policy-enabled-toggle"
          style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', marginTop: 12 }}
        >
          <input
            id="policy-enabled-toggle"
            type="checkbox"
            checked={policy.enabled}
            onChange={(event) => setPolicy({ ...policy, enabled: event.target.checked })}
          />{' '}
          Enable reminder
        </label>

        <div style={{ marginTop: 14 }}>
          <label
            htmlFor="policy-reminder-time"
            style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}
          >
            Reminder time
          </label>
          <QuickTimePicker
            id="policy-reminder-time"
            value={policy.time ?? ''}
            onChange={(time) => setPolicy({ ...policy, time: time || undefined })}
            placeholder="Choose time"
            ariaLabel="Goal reminder time"
          />
        </div>

        <div style={{ marginTop: 16, fontSize: 12 }}>
          <span style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>Days</span>
          <div
            style={{ display: 'flex', gap: 6, marginTop: 4 }}
            role="group"
            aria-label="Reminder active weekdays"
          >
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, day) => {
              const selected =
                policy.weekdays?.includes(day as 0 | 1 | 2 | 3 | 4 | 5 | 6) ?? false;
              return (
                <button
                  key={`${label}-${day}`}
                  type="button"
                  className="btn-ghost"
                  aria-pressed={selected}
                  aria-label={WEEKDAY_NAMES[day]}
                  onClick={() => {
                    const current = policy.weekdays ?? [];
                    setPolicy({
                      ...policy,
                      weekdays: selected
                        ? (current.filter((value) => value !== day) as any)
                        : ([...current, day] as any),
                    });
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    background: selected ? 'var(--btn-primary-bg)' : undefined,
                    color: selected ? 'var(--btn-primary-text)' : undefined,
                    fontWeight: selected ? 700 : 500,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginTop: 16,
            alignItems: 'start',
            fontSize: 12,
          }}
        >
          <div>
            <label
              htmlFor="policy-quiet-start"
              style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}
            >
              Quiet from
            </label>
            <QuickTimePicker
              id="policy-quiet-start"
              value={policy.quietStart ?? ''}
              onChange={(time) => setPolicy({ ...policy, quietStart: time || undefined })}
              placeholder="Start time"
              ariaLabel="Quiet hours start time"
            />
          </div>
          <div>
            <label
              htmlFor="policy-quiet-end"
              style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}
            >
              Quiet to
            </label>
            <QuickTimePicker
              id="policy-quiet-end"
              value={policy.quietEnd ?? ''}
              onChange={(time) => setPolicy({ ...policy, quietEnd: time || undefined })}
              placeholder="End time"
              ariaLabel="Quiet hours end time"
            />
          </div>
        </div>

        <label
          htmlFor="policy-incomplete-only-toggle"
          style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16, cursor: 'pointer' }}
        >
          <input
            id="policy-incomplete-only-toggle"
            type="checkbox"
            checked={policy.onlyWhenIncomplete}
            onChange={(event) => setPolicy({ ...policy, onlyWhenIncomplete: event.target.checked })}
          />{' '}
          Only while incomplete
        </label>

        <div style={{ display: 'flex', gap: 8, marginTop: 22, justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={async () => {
              await window.beacon.reminders.savePolicy({
                goalId: goal.id,
                enabled: policy.enabled,
                time: policy.time,
                weekdays: policy.weekdays,
                onlyWhenIncomplete: policy.onlyWhenIncomplete,
                quietStart: policy.quietStart,
                quietEnd: policy.quietEnd,
              });
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
