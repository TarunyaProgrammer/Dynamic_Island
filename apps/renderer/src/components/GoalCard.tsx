// apps/renderer/src/components/GoalCard.tsx
import React, { useState, useRef } from 'react';
import { Goal } from '@shared/types';
import { GoalProgressRing } from './GoalProgressRing';
import { QuickIncrementButton } from './QuickIncrementButton';
import { MilestoneList } from './MilestoneList';
import { useDesktopOverlay } from '../hooks/useDesktopOverlay';
import { CheckCircle, ChevronDown, ChevronUp, MoreHorizontal, Archive, Trash2, Edit3, Calendar, Timer, Zap, Sparkles } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onIncrement: (goalId: string, delta?: number) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onAddMilestone: (goalId: string, title: string, contribution?: number) => void;
  onDeleteMilestone: (goalId: string, milestoneId: string) => void;
  onComplete: (goalId: string) => void;
  onArchive: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onEdit: (goal: Goal) => void;
  compact?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onIncrement,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
  onComplete,
  onArchive,
  onDelete,
  onEdit,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const fraction = goal.targetValue > 0 ? Math.min(1.0, goal.currentValue / goal.targetValue) : 0;
  const isComplete = goal.status === 'completed' || (goal.targetValue > 0 && goal.currentValue >= goal.targetValue);

  // 3-dot popover overlay
  useDesktopOverlay({
    isOpen: menuOpen,
    onClose: () => setMenuOpen(false),
    containerRef: menuContainerRef,
    restoreFocusRef: menuButtonRef,
  });

  // Right-click context menu overlay
  useDesktopOverlay({
    isOpen: !!contextMenuPos,
    onClose: () => setContextMenuPos(null),
    containerRef: contextMenuRef,
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleFocusMode = () => {
    window.location.hash = '#focus';
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: compact ? '10px 12px' : '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <GoalProgressRing progressFraction={fraction} size={compact ? 36 : 42} strokeWidth={compact ? 3 : 3.5} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: compact ? '13px' : '14px',
                  fontWeight: 600,
                  color: isComplete ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: isComplete ? 'line-through' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {goal.name}
              </span>
              {goal.area && goal.area !== 'Personal' && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 500,
                  }}
                >
                  {goal.area}
                </span>
              )}

              {goal.streakConfig?.enabled && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: (goal.streakConfig.currentStreak ?? 0) > 0 ? 'rgba(90, 200, 250, 0.12)' : 'var(--bg-glass)',
                    color: (goal.streakConfig.currentStreak ?? 0) > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: `1px solid ${(goal.streakConfig.currentStreak ?? 0) > 0 ? 'rgba(90, 200, 250, 0.28)' : 'var(--border-subtle)'}`,
                  }}
                  title={`Consistency: ${goal.health?.consistencyPercentage ?? 92}% · Light Streak: ${goal.streakConfig.currentStreak ?? 0} (Best: ${goal.streakConfig.bestStreak ?? 0})`}
                >
                  <Sparkles size={10} color={(goal.streakConfig.currentStreak ?? 0) > 0 ? 'var(--accent-cyan)' : 'currentColor'} />
                  <span>{goal.streakConfig.currentStreak ?? 0} {goal.period === 'weekly' ? 'w' : 'd'}</span>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <span>
                <strong style={{ color: 'var(--text-primary)' }}>{goal.currentValue}</strong>
                {goal.targetValue > 0 && ` / ${goal.targetValue}`} {goal.unit || ''}
              </span>

              {goal.deadline && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)' }}>
                  <Calendar size={10} />
                  <span>{new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </span>
              )}
            </div>

            {/* Paradigm Texture: Habit Day Dots */}
            {goal.paradigm === 'habit' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                {Array.from({ length: Math.min(7, Math.max(goal.targetValue || 7, 5)) }).map((_, i) => {
                  const isDone = i < goal.currentValue;
                  return (
                    <div
                      key={i}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isDone ? 'var(--accent-beacon)' : 'var(--accent-neutral)',
                        boxShadow: isDone ? '0 0 5px rgba(124, 108, 255, 0.5)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      title={`Session ${i + 1}`}
                    />
                  );
                })}
              </div>
            )}

            {/* Paradigm Texture: Trajectory Comparison for Deadlines */}
            {goal.health?.expectedProgress !== undefined && goal.deadline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', marginTop: '2px' }}>
                <div style={{ position: 'relative', width: '60px', height: '3px', backgroundColor: 'var(--accent-neutral)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, fraction * 100)}%`, height: '100%', backgroundColor: 'var(--accent-cyan)' }} />
                  <div style={{ position: 'absolute', left: `${Math.min(100, goal.health.expectedProgress * 100)}%`, top: 0, bottom: 0, width: '2px', backgroundColor: '#ffffff' }} />
                </div>
                <span style={{ color: goal.health.status === 'ahead' ? 'var(--accent-emerald)' : goal.health.status === 'at_risk' ? 'var(--accent-amber)' : 'var(--text-secondary)', fontWeight: 500 }}>
                  {goal.health.trajectoryLabel || 'On track'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {!isComplete && (
            <>
              <button
                onClick={handleFocusMode}
                className="btn-ghost"
                style={{ padding: '4px 8px', fontSize: '11px', gap: '4px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}
                title="Start 25m Focus Session on this goal"
              >
                <Timer size={12} />
                <span>Focus</span>
              </button>

              <QuickIncrementButton
                amount={goal.defaultIncrement || 1}
                unit={goal.unit}
                onClick={() => onIncrement(goal.id)}
              />
            </>
          )}

          <div style={{ position: 'relative' }}>
            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn-ghost"
              style={{ padding: '4px', borderRadius: 'var(--radius-sm)' }}
              aria-label="More actions"
            >
              <MoreHorizontal size={14} />
            </button>

            {menuOpen && (
              <div
                ref={menuContainerRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 50,
                  width: '130px',
                  backgroundColor: 'rgba(28, 30, 39, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(goal);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-glass-active)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                >
                  <Edit3 size={12} />
                  <span>Edit Goal</span>
                </button>

                {!isComplete && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onComplete(goal.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 8px',
                      fontSize: '11px',
                      color: 'var(--accent-emerald)',
                      borderRadius: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-glass-active)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                  >
                    <CheckCircle size={12} />
                    <span>Complete</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onArchive(goal.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-glass-active)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                >
                  <Archive size={12} />
                  <span>Archive</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(goal.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px',
                    fontSize: '11px',
                    color: 'var(--accent-rose)',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-glass-active)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                >
                  <Trash2 size={12} />
                  <span>Delete...</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Native Context Menu */}
      {contextMenuPos && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: contextMenuPos.y,
            left: contextMenuPos.x,
            zIndex: 1000,
            width: '150px',
            backgroundColor: 'rgba(28, 30, 39, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {!isComplete && (
            <button
              onClick={() => {
                setContextMenuPos(null);
                onIncrement(goal.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-glass-active)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
            >
              <Zap size={13} color="var(--accent-emerald)" />
              <span>Quick +{goal.defaultIncrement || 1}</span>
            </button>
          )}

          <button
            onClick={() => {
              setContextMenuPos(null);
              onEdit(goal);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-glass-active)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
          >
            <Edit3 size={13} />
            <span>Edit Goal</span>
          </button>

          {!isComplete ? (
            <button
              onClick={() => {
                setContextMenuPos(null);
                onComplete(goal.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'var(--accent-emerald)',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-glass-active)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
            >
              <CheckCircle size={13} />
              <span>Mark Complete</span>
            </button>
          ) : null}

          <button
            onClick={() => {
              setContextMenuPos(null);
              onArchive(goal.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-glass-active)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
          >
            <Archive size={13} />
            <span>Archive</span>
          </button>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

          <button
            onClick={() => {
              setContextMenuPos(null);
              onDelete(goal.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              color: 'var(--accent-rose)',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-glass-active)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
          >
            <Trash2 size={13} />
            <span>Delete...</span>
          </button>
        </div>
      )}

      {/* Accordion Toggle for Milestones */}
      {goal.milestones && goal.milestones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px 0',
              fontSize: '11px',
              color: 'var(--text-muted)',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            <span>
              {goal.milestones.filter((m) => m.isCompleted).length}/{goal.milestones.length} milestones
            </span>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {expanded && (
            <MilestoneList
              goalId={goal.id}
              milestones={goal.milestones}
              onToggle={onToggleMilestone}
              onAdd={onAddMilestone}
              onDelete={onDeleteMilestone}
            />
          )}
        </div>
      )}
    </div>
  );
};
