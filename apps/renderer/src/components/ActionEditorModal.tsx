import React, { useEffect, useState } from 'react';
import { Goal } from '@shared/types';
import { Clock, Target, Zap } from 'lucide-react';

export const ActionEditorModal: React.FC<{
  goals: Goal[];
  onClose: () => void;
  onSave: (input: { goalId: string; title: string; estimatedMinutes?: number }) => Promise<void>;
  initialGoalId?: string;
}> = ({ goals, onClose, onSave, initialGoalId }) => {
  const [goalId, setGoalId] = useState(initialGoalId ?? goals[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!goalId || !title.trim()) return;
    setSaving(true);
    try {
      await onSave({ goalId, title: title.trim(), estimatedMinutes: minutes ? Number(minutes) : undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Add next action"
    >
      <form
        onSubmit={submit}
        className="modal-content"
        style={{ width: 400, display: 'grid', gap: 16 }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18, letterSpacing: '-0.02em' }}>Add next action</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
            Make the next step small, visible, and planned for today.
          </p>
        </div>

        <label htmlFor="action-goal-select" style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Target size={13} color="var(--accent-primary)" /> Goal
          </span>
          <select
            id="action-goal-select"
            className="input"
            value={goalId}
            onChange={(event) => setGoalId(event.target.value)}
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.name}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="action-title-input" style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Zap size={13} color="var(--accent-primary)" /> Action
          </span>
          <input
            id="action-title-input"
            autoFocus
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Outline the first section"
          />
        </label>

        <div style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}>
          <label htmlFor="action-minutes-input" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={13} color="var(--accent-primary)" /> Estimate{' '}
            <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(minutes, optional)</span>
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              id="action-minutes-input"
              type="number"
              min="1"
              max="1440"
              className="input"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              placeholder="25"
              style={{ flex: 1 }}
            />
            <div style={{ display: 'flex', gap: 4 }}>
              {[15, 25, 45].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={Number(minutes) === m ? 'btn-primary' : 'btn-ghost'}
                  onClick={() => setMinutes(String(m))}
                  style={{ fontSize: 11, padding: '4px 8px' }}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button disabled={saving || !title.trim() || !goalId} className="btn-primary" type="submit">
            {saving ? 'Adding…' : 'Add to Today'}
          </button>
        </div>
      </form>
    </div>
  );
};
