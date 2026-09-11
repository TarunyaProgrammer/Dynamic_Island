import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, Pause, Play, Plus, Square, Sparkles, Edit2 } from 'lucide-react';
import { Goal, GoalAction } from '@shared/types';
import { useActivities } from '../hooks/useActivities';

interface FocusDashboardViewProps {
  goals: Goal[];
  initialGoalId?: string;
  onOpenCreateGoal: () => void;
}

const PRESET_DURATIONS = [15, 25, 45, 60, 90];

export const FocusDashboardView: React.FC<FocusDashboardViewProps> = ({ goals, initialGoalId = '', onOpenCreateGoal }) => {
  const { focusState, lastCompletedSession, clearCompletedSession, startFocus, pauseFocus, resumeFocus, stopFocus, extendFocus } = useActivities();
  const [selectedGoalId, setSelectedGoalId] = useState(initialGoalId);
  const [duration, setDuration] = useState(25);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [customInput, setCustomInput] = useState('25');
  const [focusAction, setFocusAction] = useState<GoalAction | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const activeGoals = goals.filter((goal) => goal.status === 'active');

  useEffect(() => {
    if (initialGoalId && !focusState.isActive) setSelectedGoalId(initialGoalId);
  }, [initialGoalId, focusState.isActive]);

  useEffect(() => {
    if (focusState.isActive) setSelectedGoalId(focusState.goalId ?? '');
  }, [focusState.goalId, focusState.isActive]);

  useEffect(() => {
    let live = true;
    if (!focusState.actionId) {
      setFocusAction(null);
      return () => { live = false; };
    }
    void window.beacon.actions.get(focusState.actionId).then((action) => {
      if (live) setFocusAction(action);
    });
    return () => { live = false; };
  }, [focusState.actionId]);

  useEffect(() => {
    if (isEditingDuration && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditingDuration]);

  const selectedGoal = activeGoals.find((goal) => goal.id === (focusState.isActive ? focusState.goalId : selectedGoalId));
  const remainingMins = Math.floor(focusState.remainingSeconds / 60);
  const remainingSecs = focusState.remainingSeconds % 60;
  const minutes = remainingMins.toString().padStart(2, '0');
  const seconds = remainingSecs.toString().padStart(2, '0');
  const actionName = focusAction?.title;

  const totalSessionSeconds = (duration || 25) * 60;
  const progressFraction = focusState.isActive
    ? Math.max(0, Math.min(1, 1 - (focusState.remainingSeconds / (totalSessionSeconds || 1))))
    : 0;

  const handleAdjustDuration = (delta: number) => {
    setDuration((prev) => {
      const next = Math.max(1, Math.min(240, prev + delta));
      setCustomInput(next.toString());
      return next;
    });
  };

  const handleCommitCustomDuration = () => {
    const parsed = parseInt(customInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 240) {
      setDuration(parsed);
    } else {
      setCustomInput(duration.toString());
    }
    setIsEditingDuration(false);
  };

  // SVG Progress Ring calculations
  const ringRadius = 130;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference * (1 - progressFraction);

  return (
    <div style={pageStyle}>
      {lastCompletedSession && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Focus complete">
          <div className="modal-content" style={{ width: 380, textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255, 122, 0, 0.15)', border: '1px solid rgba(255, 122, 0, 0.3)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--accent-primary, #ff7a00)' }} />
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, letterSpacing: '-0.02em' }}>Focus Complete</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 24px' }}>
              {lastCompletedSession.durationMinutes} minutes dedicated{lastCompletedSession.goalName ? ` toward ${lastCompletedSession.goalName}` : ''}. Excellent momentum!
            </p>
            <button className="btn-primary" onClick={clearCompletedSession} style={{ width: '100%', padding: '10px 0', justifyContent: 'center' }}>
              Return to Focus
            </button>
          </div>
        </div>
      )}

      <div style={workspaceStyle}>
        {/* Eyebrow / State indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: focusState.isActive ? (focusState.isPaused ? '#fbbf24' : '#34d399') : 'var(--text-muted)',
            boxShadow: focusState.isActive && !focusState.isPaused ? '0 0 8px #34d399' : 'none',
          }} />
          <div style={eyebrowStyle}>
            {focusState.isActive ? (focusState.isPaused ? 'Focus Paused' : 'Deep Work Session') : 'Focus Mode'}
          </div>
        </div>

        {/* Goal & Action Info */}
        <div style={goalStyle}>{selectedGoal?.name ?? 'Choose a goal to focus on'}</div>
        <div style={actionStyle}>
          {actionName ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Sparkles size={13} color="var(--accent-primary)" />
              {actionName}
            </span>
          ) : (
            selectedGoal ? 'A dedicated block for deliberate, distraction-free work.' : 'Pick a goal below, set your timer, and begin.'
          )}
        </div>

        {/* Visual Circular Aura & Timer Centerpiece */}
        <div style={{ position: 'relative', width: 280, height: 280, margin: '26px auto 14px', display: 'grid', placeItems: 'center' }}>
          <svg width="280" height="280" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
            <circle
              cx="140"
              cy="140"
              r={ringRadius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="6"
            />
            <circle
              cx="140"
              cy="140"
              r={ringRadius}
              fill="transparent"
              stroke={focusState.isPaused ? '#fbbf24' : 'var(--accent-primary, #ff7a00)'}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={focusState.isActive ? strokeDashoffset : circumference}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          </svg>

          {/* Central Digits / Editable Input */}
          <div style={{ textAlign: 'center', zIndex: 2 }}>
            {focusState.isActive ? (
              <div style={timerStyle}>
                {minutes}:{seconds}
              </div>
            ) : isEditingDuration ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <input
                  ref={editInputRef}
                  type="number"
                  min="1"
                  max="240"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onBlur={handleCommitCustomDuration}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommitCustomDuration();
                    if (e.key === 'Escape') setIsEditingDuration(false);
                  }}
                  style={{
                    width: 120,
                    fontSize: 48,
                    fontWeight: 700,
                    textAlign: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ffffff',
                    outline: 'none',
                    padding: '4px',
                  }}
                />
                <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>min</span>
              </div>
            ) : (
              <div
                onClick={() => {
                  setCustomInput(duration.toString());
                  setIsEditingDuration(true);
                }}
                style={{ ...timerStyle, cursor: 'pointer' }}
                title="Click to type custom duration"
              >
                {duration}:00
              </div>
            )}

            {!focusState.isActive && (
              <div
                onClick={() => {
                  setCustomInput(duration.toString());
                  setIsEditingDuration(true);
                }}
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  marginTop: 2,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Edit2 size={10} /> Click digits to edit
              </div>
            )}
          </div>
        </div>

        {/* Fine Stepper Adjustments (When Idle) */}
        {!focusState.isActive && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, margin: '6px 0 16px' }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => handleAdjustDuration(-5)}
              style={{ padding: '4px 10px', fontSize: 11, borderRadius: 'var(--radius-sm)' }}
              title="Minus 5 minutes"
            >
              -5m
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => handleAdjustDuration(-1)}
              style={{ padding: '4px 8px', fontSize: 11, borderRadius: 'var(--radius-sm)' }}
              title="Minus 1 minute"
            >
              -1m
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '0 4px', fontFamily: 'var(--font-mono)' }}>
              {duration}m
            </span>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => handleAdjustDuration(1)}
              style={{ padding: '4px 8px', fontSize: 11, borderRadius: 'var(--radius-sm)' }}
              title="Plus 1 minute"
            >
              +1m
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => handleAdjustDuration(5)}
              style={{ padding: '4px 10px', fontSize: 11, borderRadius: 'var(--radius-sm)' }}
              title="Plus 5 minutes"
            >
              +5m
            </button>
          </div>
        )}

        {/* Quick Presets */}
        {!focusState.isActive && (
          <div style={presetStyle}>
            {PRESET_DURATIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                className={duration === mins ? 'btn-primary' : 'btn-ghost'}
                onClick={() => {
                  setDuration(mins);
                  setCustomInput(mins.toString());
                  setIsEditingDuration(false);
                }}
                style={{ minWidth: 64, padding: '6px 10px', fontSize: 12, borderRadius: 'var(--radius-md)' }}
              >
                {mins} min
              </button>
            ))}
          </div>
        )}

        {/* Primary Controls */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22 }}>
          {!focusState.isActive ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => startFocus(duration, selectedGoal?.id)}
              style={{
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 650,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 20px rgba(255, 122, 0, 0.35)',
              }}
            >
              <Play size={16} fill="currentColor" /> Start Focus
            </button>
          ) : (
            <>
              {focusState.isPaused ? (
                <button type="button" className="btn-primary" onClick={resumeFocus} style={{ padding: '8px 18px', fontSize: 13 }}>
                  <Play size={15} fill="currentColor" /> Resume
                </button>
              ) : (
                <button type="button" className="btn-primary" onClick={pauseFocus} style={{ padding: '8px 18px', fontSize: 13 }}>
                  <Pause size={15} /> Pause
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={() => extendFocus(5)} style={{ padding: '8px 14px', fontSize: 12 }}>
                +5 min
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => stopFocus(Boolean(focusState.goalId))}
                style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-muted)' }}
              >
                <Square size={13} /> End & Log
              </button>
            </>
          )}
        </div>

        {/* Goal Selector */}
        {!focusState.isActive && (
          <div style={goalPickerStyle}>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em' }}>
              Select Focus Goal
            </span>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
              {activeGoals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  className={selectedGoalId === goal.id ? 'btn-primary' : 'btn-ghost'}
                  onClick={() => setSelectedGoalId(goal.id)}
                  style={{ fontSize: 12, padding: '5px 12px', borderRadius: 'var(--radius-sm)' }}
                >
                  {goal.name}
                </button>
              ))}
              {activeGoals.length === 0 && (
                <button type="button" className="btn-ghost" onClick={onOpenCreateGoal} style={{ fontSize: 12 }}>
                  <Plus size={14} /> Create a Goal
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  flex: 1,
  display: 'grid',
  placeItems: 'center',
  overflowY: 'auto',
  padding: '24px 20px',
};

const workspaceStyle: React.CSSProperties = {
  width: 'min(580px, 100%)',
  textAlign: 'center',
  padding: '36px 28px',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-xl)',
  background: 'var(--bg-card)',
  boxShadow: 'var(--shadow-md)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};

const goalStyle: React.CSSProperties = {
  marginTop: 12,
  fontSize: 24,
  lineHeight: 1.15,
  fontWeight: 700,
  letterSpacing: '-.04em',
  color: 'var(--text-primary)',
};

const actionStyle: React.CSSProperties = {
  marginTop: 6,
  color: 'var(--text-secondary)',
  fontSize: 13,
  minHeight: 20,
};

const timerStyle: React.CSSProperties = {
  fontVariantNumeric: 'tabular-nums',
  fontSize: 'clamp(52px, 10vw, 76px)',
  lineHeight: 1,
  letterSpacing: '-.06em',
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const presetStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: 7,
  flexWrap: 'wrap',
};

const goalPickerStyle: React.CSSProperties = {
  marginTop: 34,
  paddingTop: 18,
  borderTop: '1px solid var(--border-subtle)',
};

