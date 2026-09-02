// apps/renderer/src/surfaces/TrayPopoverView.tsx
import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import { GoalProgressRing } from '../components/GoalProgressRing';
import { QuickIncrementButton } from '../components/QuickIncrementButton';
import { GoalEditorModal } from '../components/GoalEditorModal';
import { Plus, ExternalLink, Compass, CheckCircle2 } from 'lucide-react';
import { GoalDraft, GoalUpdateDraft } from '@shared/types';

export const TrayPopoverView: React.FC = () => {
  const { goals, stats, incrementProgress, toggleMilestone, createGoal, completeGoal } = useGoals('active');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleOpenMain = () => {
    window.beacon.windows.toggleMain();
    window.beacon.windows.hidePopover();
  };

  const handleCreate = async (payload: GoalDraft | GoalUpdateDraft) => {
    await createGoal(payload as GoalDraft);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#0a0a0c',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#121216',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={15} color="#ffffff" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>Beacon Hub</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="btn-ghost"
            style={{ padding: '3px 6px', fontSize: '11px', gap: '4px' }}
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
          <button
            onClick={handleOpenMain}
            className="btn-ghost"
            title="Open Full Workspace"
            style={{ padding: '3px 6px' }}
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Progress Summary Header */}
      {stats && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GoalProgressRing progressFraction={stats.overallProgressFraction} size={36} strokeWidth={3} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                {Math.round(stats.overallProgressFraction * 100)}% Complete
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {stats.activeGoals} active • {stats.todayIncrementsCount} logged today
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Goal List (Fast Glance & Increment) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {goals.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '30px 10px',
              color: 'var(--text-muted)',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={24} opacity={0.3} />
            <span style={{ fontSize: '12px' }}>All caught up! No active goals.</span>
          </div>
        ) : (
          goals.map((g) => {
            const fraction = g.targetValue > 0 ? Math.min(1.0, g.currentValue / g.targetValue) : 0;
            return (
              <div
                key={g.id}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <GoalProgressRing progressFraction={fraction} size={28} strokeWidth={2.5} showText={false} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {g.name}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        <strong>{g.currentValue}</strong>
                        {g.targetValue > 0 && ` / ${g.targetValue}`} {g.unit || ''}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <QuickIncrementButton
                      amount={g.defaultIncrement || 1}
                      unit={g.unit}
                      onClick={() => incrementProgress(g.id)}
                    />
                    <button
                      onClick={() => completeGoal(g.id)}
                      title="Complete Goal"
                      className="btn-ghost"
                      style={{ padding: '3px', color: 'var(--text-muted)' }}
                    >
                      <CheckCircle2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Milestone quick pills if any */}
                {g.milestones && g.milestones.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                    {g.milestones.slice(0, 3).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => toggleMilestone(g.id, m.id)}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          backgroundColor: m.isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          color: m.isCompleted ? 'var(--accent-emerald)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          textDecoration: m.isCompleted ? 'line-through' : 'none',
                        }}
                      >
                        {m.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Goal Creator Modal */}
      <GoalEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleCreate}
      />
    </div>
  );
};
