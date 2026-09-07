// apps/renderer/src/components/MilestoneList.tsx
import React, { useState } from 'react';
import { Milestone } from '@shared/types';
import { Check, Plus, Trash2 } from 'lucide-react';

interface MilestoneListProps {
  goalId: string;
  milestones: Milestone[];
  onToggle: (goalId: string, milestoneId: string) => void;
  onAdd: (goalId: string, title: string, contribution?: number) => void;
  onDelete: (goalId: string, milestoneId: string) => void;
  readOnly?: boolean;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({
  goalId,
  milestones,
  onToggle,
  onAdd,
  onDelete,
  readOnly = false,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newContribution, setNewContribution] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const contrib = newContribution ? parseFloat(newContribution) : undefined;
    onAdd(goalId, newTitle.trim(), contrib);
    setNewTitle('');
    setNewContribution('');
    setIsAdding(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {milestones.map((m) => (
        <div
          key={m.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            transition: 'background-color 0.15s ease',
          }}
        >
          <div
            onClick={() => onToggle(goalId, m.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              flex: 1,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                border: m.isCompleted
                  ? '1px solid var(--accent-solar, #ff7a00)'
                  : '1px solid rgba(255, 255, 255, 0.25)',
                backgroundColor: m.isCompleted ? 'var(--accent-solar, #ff7a00)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {m.isCompleted && <Check size={12} color="#ffffff" strokeWidth={3} />}
            </div>
            <span
              style={{
                fontSize: '12px',
                color: m.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: m.isCompleted ? 'line-through' : 'none',
              }}
            >
              {m.title}
            </span>
            {m.targetContribution && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                (+{m.targetContribution})
              </span>
            )}
          </div>

          {!readOnly && (
            <button
              onClick={() => onDelete(goalId, m.id)}
              style={{
                color: 'var(--text-muted)',
                padding: '2px 4px',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: 0.6,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.6')}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      ))}

      {!readOnly && (
        <>
          {isAdding ? (
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <input
                type="text"
                autoFocus
                placeholder="Milestone title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
              <input
                type="number"
                placeholder="+ Val"
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                style={{
                  width: '60px',
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                Add
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsAdding(false)}
                style={{ padding: '4px 6px', fontSize: '11px' }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px 0',
                opacity: 0.8,
              }}
            >
              <Plus size={12} />
              <span>Add milestone</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};
