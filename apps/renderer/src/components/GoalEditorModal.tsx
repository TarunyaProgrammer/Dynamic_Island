// apps/renderer/src/components/GoalEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { Goal, GoalDraft, GoalType, GoalUpdateDraft } from '@shared/types';
import { X, Target } from 'lucide-react';

interface GoalEditorModalProps {
  goal?: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: GoalDraft | GoalUpdateDraft) => void;
}

export const GoalEditorModal: React.FC<GoalEditorModalProps> = ({
  goal,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<GoalType>('numeric');
  const [targetValue, setTargetValue] = useState<string>('100');
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [unit, setUnit] = useState('');
  const [defaultIncrement, setDefaultIncrement] = useState<string>('1');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setDescription(goal.description || '');
      setCategory(goal.category || '');
      setType(goal.type);
      setTargetValue(goal.targetValue.toString());
      setCurrentValue(goal.currentValue.toString());
      setUnit(goal.unit || '');
      setDefaultIncrement(goal.defaultIncrement.toString());
      setDeadline(goal.deadline ? goal.deadline.split('T')[0] : '');
    } else {
      setName('');
      setDescription('');
      setCategory('');
      setType('numeric');
      setTargetValue('100');
      setCurrentValue('0');
      setUnit('');
      setDefaultIncrement('1');
      setDeadline('');
    }
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      type,
      targetValue: parseFloat(targetValue) || 0,
      currentValue: parseFloat(currentValue) || 0,
      unit: unit.trim() || undefined,
      defaultIncrement: parseFloat(defaultIncrement) || 1,
      deadline: deadline ? `${deadline}T23:59:59.000Z` : undefined,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'rgba(24, 26, 34, 0.95)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{goal ? 'Edit Goal' : 'Create New Goal'}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Goal Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Goal Name</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Read 20 Books, Learn Rust, Ship MVP..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Goal Type & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Goal Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GoalType)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(30, 32, 42, 0.95)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="numeric">Numeric (hours, etc.)</option>
                <option value="percentage">Percentage (0-100%)</option>
                <option value="count">Count (items, books)</option>
                <option value="binary">Binary (Done / Not Done)</option>
                <option value="milestone">Milestones Only</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Category (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Career, Health, OSS"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Target Value, Current Value & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Current</label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Target</label>
              <input
                type="number"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Unit</label>
              <input
                type="text"
                placeholder="hrs, pages..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Increment & Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Quick Increment Step</label>
              <input
                type="number"
                step="any"
                value={defaultIncrement}
                onChange={(e) => setDefaultIncrement(e.target.value)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Target Deadline (Optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {goal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
