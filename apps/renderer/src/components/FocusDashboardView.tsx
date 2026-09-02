// apps/renderer/src/components/FocusDashboardView.tsx
import React, { useState, useEffect } from 'react';
import { Goal } from '@shared/types';
import { useActivities } from '../hooks/useActivities';
import { GoalProgressRing } from './GoalProgressRing';
import { soundEffects } from '../utils/audio';
import { Play, Pause, Square, Plus, Target, Radio, Clock, Zap, X, CheckCircle2 } from 'lucide-react';

interface FocusDashboardViewProps {
  goals: Goal[];
  onOpenCreateGoal: () => void;
}

export const FocusDashboardView: React.FC<FocusDashboardViewProps> = ({
  goals,
  onOpenCreateGoal,
}) => {
  const {
    focusState,
    lastCompletedSession,
    clearCompletedSession,
    startFocus,
    pauseFocus,
    resumeFocus,
    stopFocus,
    extendFocus,
  } = useActivities();
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(25);

  const activeGoals = goals.filter((g) => g.status === 'active');

  // If focus session is running on a goal, reflect that goal
  useEffect(() => {
    if (focusState.isActive) {
      setSelectedGoalId(focusState.goalId || '');
    }
  }, [focusState.isActive, focusState.goalId]);

  // Escape / Enter keyboard dismissal for completed session
  useEffect(() => {
    if (!lastCompletedSession) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        clearCompletedSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastCompletedSession, clearCompletedSession]);

  const selectedGoal = selectedGoalId ? activeGoals.find((g) => g.id === selectedGoalId) : null;

  const focusMins = Math.floor(focusState.remainingSeconds / 60);
  const focusSecs = (focusState.remainingSeconds % 60).toString().padStart(2, '0');
  const focusTimeStr = `${focusMins}:${focusSecs}`;
  const focusProgress =
    focusState.durationSeconds > 0
      ? (focusState.durationSeconds - focusState.remainingSeconds) / focusState.durationSeconds
      : 0;

  const presets = [
    { label: '5m', mins: 5 },
    { label: '15m', mins: 15 },
    { label: '25m', mins: 25 },
    { label: '45m', mins: 45 },
    { label: '60m', mins: 60 },
  ];

  const adjustDuration = (delta: number) => {
    setSelectedDuration((prev) => Math.max(1, Math.min(180, prev + delta)));
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        padding: '24px 32px',
        gap: '28px',
        backgroundColor: '#000000',
        boxSizing: 'border-box',
      }}
    >
      {/* Left Column: Hero Focus Timer & Controls */}
      <div
        style={{
          flex: 1.2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px',
          backgroundColor: '#0a0a0c',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Celebration Overlay when a session just completed */}
        {lastCompletedSession && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(10, 10, 12, 0.96)',
              backdropFilter: 'blur(20px)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              textAlign: 'center',
              animation: 'springCardIn 0.3s var(--ease-spring)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 30px rgba(52, 211, 153, 0.35)',
              }}
            >
              <CheckCircle2 size={28} color="#34d399" strokeWidth={1.5} />
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.3px' }}>
              Sprint Complete
            </h3>

            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', maxWidth: '340px', lineHeight: 1.5, marginBottom: '24px' }}>
              {lastCompletedSession.goalName ? (
                <>
                  Logged <strong style={{ color: '#34d399' }}>+{lastCompletedSession.durationMinutes} mins</strong> toward{' '}
                  <strong style={{ color: '#ffffff' }}>{lastCompletedSession.goalName}</strong>.
                </>
              ) : (
                <>
                  Awesome job! You finished a <strong style={{ color: '#34d399' }}>{lastCompletedSession.durationMinutes}-minute</strong> focus session.
                </>
              )}
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  soundEffects.playTickSound();
                  clearCompletedSession();
                  startFocus(5);
                }}
                className="btn-secondary"
                style={{ padding: '9px 18px', fontSize: '13px', gap: '6px' }}
              >
                <span>Take 5m Break</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playTickSound();
                  clearCompletedSession();
                  startFocus(selectedDuration, selectedGoal?.id);
                }}
                className="btn-primary"
                style={{ padding: '9px 20px', fontSize: '13px', gap: '6px' }}
              >
                <Play size={13} fill="#000000" />
                <span>Next Sprint ({selectedDuration}m)</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playMilestonePop();
                  clearCompletedSession();
                }}
                className="btn-ghost"
                style={{ padding: '9px 16px', fontSize: '13px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

        {/* Linked Goal / Independent Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: selectedGoal ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            marginBottom: '20px',
          }}
        >
          {selectedGoal ? (
            <>
              <Target size={14} color="#ffffff" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                Goal: {selectedGoal.name}
              </span>
              {selectedGoal.area && selectedGoal.area !== 'Personal' && (
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                  • {selectedGoal.area}
                </span>
              )}
              {!focusState.isActive && (
                <button
                  onClick={() => setSelectedGoalId('')}
                  className="btn-ghost"
                  style={{ padding: '2px', marginLeft: '4px', borderRadius: '50%' }}
                  title="Switch to Independent Timer"
                >
                  <X size={12} />
                </button>
              )}
            </>
          ) : (
            <>
              <Zap size={14} color="#ffffff" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                Independent Timer
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                • No Goal Linked
              </span>
            </>
          )}
        </div>

        {/* Large Circular Focus Clock */}
        <div style={{ position: 'relative', width: '210px', height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GoalProgressRing
            progressFraction={focusState.isActive ? focusProgress : 0}
            size={210}
            strokeWidth={8}
            showText={false}
            color="#ffffff"
          />
          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '46px', fontWeight: 800, color: '#ffffff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>
              {focusState.isActive ? focusTimeStr : `${selectedDuration}:00`}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {focusState.isActive ? (focusState.isPaused ? 'PAUSED' : 'FOCUSING') : 'READY'}
            </span>
          </div>
        </div>

        {/* Manual Steppers & Custom Minutes Entry (When Idle) */}
        {!focusState.isActive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            {/* Quick Steppers & Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => adjustDuration(-5)}
                className="btn-ghost"
                style={{ padding: '5px 8px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                title="Subtract 5 minutes"
              >
                -5m
              </button>
              <button
                onClick={() => adjustDuration(-1)}
                className="btn-ghost"
                style={{ padding: '5px 8px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                title="Subtract 1 minute"
              >
                -1m
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#141417', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={selectedDuration}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setSelectedDuration(Math.max(1, Math.min(180, val)));
                  }}
                  style={{
                    width: '38px',
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>min</span>
              </div>

              <button
                onClick={() => adjustDuration(1)}
                className="btn-ghost"
                style={{ padding: '5px 8px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                title="Add 1 minute"
              >
                +1m
              </button>
              <button
                onClick={() => adjustDuration(5)}
                className="btn-ghost"
                style={{ padding: '5px 8px', fontSize: '11px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                title="Add 5 minutes"
              >
                +5m
              </button>
            </div>

            {/* Quick Preset Chips */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {presets.map((p) => (
                <button
                  key={p.mins}
                  onClick={() => setSelectedDuration(p.mins)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: selectedDuration === p.mins ? 700 : 500,
                    backgroundColor: selectedDuration === p.mins ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                    color: selectedDuration === p.mins ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: focusState.isActive ? '24px' : '16px' }}>
          {!focusState.isActive ? (
            <button
              onClick={() => startFocus(selectedDuration, selectedGoal?.id)}
              className="btn-primary"
              style={{ padding: '10px 28px', fontSize: '14px', gap: '8px' }}
            >
              <Play size={16} fill="#000000" />
              <span>Start {selectedDuration}m {selectedGoal ? 'Sprint' : 'Timer'}</span>
            </button>
          ) : (
            <>
              {focusState.isPaused ? (
                <button
                  onClick={() => resumeFocus()}
                  className="btn-primary"
                  style={{ padding: '9px 20px', fontSize: '13px', gap: '8px' }}
                >
                  <Play size={14} fill="#000000" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  onClick={() => pauseFocus()}
                  className="btn-secondary"
                  style={{ padding: '9px 20px', fontSize: '13px', gap: '8px' }}
                >
                  <Pause size={14} />
                  <span>Pause</span>
                </button>
              )}

              {/* Live Extend Buttons */}
              <button
                onClick={() => extendFocus(5)}
                className="btn-ghost"
                style={{ padding: '9px 12px', fontSize: '12px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                title="Add 5 minutes to running timer"
              >
                +5m
              </button>

              <button
                onClick={() => stopFocus(!!focusState.goalId)}
                className="btn-ghost"
                style={{ padding: '9px 16px', fontSize: '13px', gap: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              >
                <Square size={13} />
                <span>{focusState.goalId ? 'End & Log' : 'Stop Timer'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Goal Switcher & Focus Stats */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflow: 'hidden',
        }}
      >
        {/* Goal Selector Panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            backgroundColor: '#0a0a0c',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={15} color="#ffffff" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Timer Mode / Linked Goal</span>
            </div>
            <button onClick={onOpenCreateGoal} className="btn-ghost" style={{ padding: '2px 8px', fontSize: '11px', gap: '4px' }}>
              <Plus size={12} />
              <span>New Goal</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
            {/* Card 1: Independent Timer Option */}
            <div
              onClick={() => {
                if (!focusState.isActive) {
                  setSelectedGoalId('');
                }
              }}
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: !selectedGoalId ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: !selectedGoalId ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: focusState.isActive ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={15} color="#ffffff" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>Independent Quick Timer</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Standalone timer (no goal linked)</span>
                </div>
              </div>

              {!selectedGoalId && (
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ffffff', color: '#000000' }}>
                  ACTIVE
                </span>
              )}
            </div>

            {/* Goal List Cards */}
            {activeGoals.map((g) => {
              const isSelected = (selectedGoalId === g.id);
              const frac = g.targetValue > 0 ? Math.min(1.0, g.currentValue / g.targetValue) : 0;

              return (
                <div
                  key={g.id}
                  onClick={() => {
                    if (!focusState.isActive) {
                      setSelectedGoalId(g.id);
                    }
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: focusState.isActive ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      {g.currentValue} / {g.targetValue} {g.unit || ''}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>
                      {Math.round(frac * 100)}%
                    </span>
                    <GoalProgressRing
                      progressFraction={frac}
                      size={24}
                      strokeWidth={3}
                      showText={false}
                      color="#ffffff"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Deep Work Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#0a0a0c',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', fontWeight: 500 }}>
              <Clock size={12} />
              <span>Independent & Goals</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
              Universal
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Supports manual min entry & +5m
            </span>
          </div>

          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#0a0a0c',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', fontWeight: 500 }}>
              <Radio size={12} />
              <span>Dynamic Island</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
              Live Synced
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Visible in MacBook notch
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
