import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { QuickTimePicker } from './QuickTimePicker';

export const OnboardingModal: React.FC<{
  isOpen: boolean;
  onFinish: (commitments: string[], nextAction: string, cadence: 'daily' | 'weekly', reminderTime?: string) => Promise<void>;
}> = ({ isOpen, onFinish }) => {
  const [commitments, setCommitments] = useState(['', '', '']);
  const [nextAction, setNextAction] = useState('');
  const [saving, setSaving] = useState(false);
  const [cadence, setCadence] = useState<'daily' | 'weekly'>('weekly');
  const [reminderTime, setReminderTime] = useState('');
  if (!isOpen) return null;
  const selected = commitments.map((value) => value.trim()).filter(Boolean).slice(0, 3);
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Set up Beacon">
      <div className="modal-content" style={{ width: 520, maxWidth: 'calc(100vw - 32px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Sparkles size={19} color="var(--accent-primary)" />
          <h2 style={{ margin: 0 }}>A calmer way to move forward</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
          Choose up to three commitments. Beacon will make today’s next step visible, not noisy.
        </p>

        {commitments.map((commitment, index) => (
          <input
            key={index}
            id={`onboarding-commitment-${index}`}
            aria-label={`Commitment ${index + 1}${index === 0 ? ' (required)' : ' (optional)'}`}
            className="input"
            value={commitment}
            onChange={(event) =>
              setCommitments((all) => all.map((value, i) => (i === index ? event.target.value : value)))
            }
            placeholder={index === 0 ? 'e.g. Read more consistently' : `Commitment ${index + 1} (optional)`}
            style={{ width: '100%', marginTop: 8 }}
          />
        ))}

        <label
          htmlFor="onboarding-next-action"
          style={{ display: 'block', fontSize: 12, fontWeight: 700, marginTop: 18 }}
        >
          What is one small next action?
        </label>
        <input
          id="onboarding-next-action"
          aria-label="What is one small next action?"
          className="input"
          value={nextAction}
          onChange={(event) => setNextAction(event.target.value)}
          placeholder="e.g. Read five pages after lunch"
          style={{ width: '100%', marginTop: 6 }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <label
            htmlFor="onboarding-cadence"
            style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700 }}
          >
            Cadence
            <select
              id="onboarding-cadence"
              aria-label="Commitment cadence"
              className="input"
              value={cadence}
              onChange={(event) => setCadence(event.target.value as 'daily' | 'weekly')}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="onboarding-reminder-time"
              style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Quiet reminder{' '}
              <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>optional</span>
            </label>
            <QuickTimePicker
              id="onboarding-reminder-time"
              value={reminderTime}
              onChange={setReminderTime}
              ariaLabel="Quiet reminder time"
              placeholder="Select reminder time"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            You can add reminders and calendar context later.
          </span>
          <button
            className="btn-primary"
            disabled={!selected.length || saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onFinish(selected, nextAction.trim(), cadence, reminderTime || undefined);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? 'Setting up…' : 'Begin'} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
