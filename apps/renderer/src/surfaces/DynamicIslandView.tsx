// apps/renderer/src/surfaces/DynamicIslandView.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGoals } from '../hooks/useGoals';
import { useActivities } from '../hooks/useActivities';
import { useMedia } from '../hooks/useMedia';
import { GoalProgressRing } from '../components/GoalProgressRing';
import { ProgressBar } from '../components/ProgressBar';
import { BeaconCompanion } from '../components/BeaconCompanion';
import { ConfettiCanvas } from '../components/ConfettiCanvas';
import { soundEffects } from '../utils/audio';
import { useCompanion } from '../hooks/useCompanion';
import {
  ExternalLink,
  Minus,
  CheckCircle2,
  Calendar,
  Timer,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Volume2,
  Sparkles,
} from 'lucide-react';

export const DynamicIslandView: React.FC = () => {
  const { goals, stats, incrementProgress, completeGoal } = useGoals('active');
  const { focusState, startFocus, pauseFocus, resumeFocus, stopFocus, extendFocus } = useActivities();
  const { mediaState, playPause, nextTrack, previousTrack, setVolume } = useMedia();
  const { state: companionState, message: companionMessage, celebrate } = useCompanion('island');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'goal' | 'focus' | 'media'>('goal');
  
  const collapseTimer = useRef<NodeJS.Timeout | null>(null);
  const primaryGoal = goals[0];
  const primaryFrac =
    primaryGoal && primaryGoal.targetValue > 0
      ? Math.min(1.0, primaryGoal.currentValue / primaryGoal.targetValue)
      : 0;

  const percent = stats ? Math.round(stats.overallProgressFraction * 100) : 0;

  const [selectedFocusGoalId, setSelectedFocusGoalId] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(25);

  // Auto-select first goal if not set
  useEffect(() => {
    if (!selectedFocusGoalId && goals.length > 0) {
      setSelectedFocusGoalId(goals[0].id);
    }
  }, [goals, selectedFocusGoalId]);

  // Format Focus Timer
  const focusMins = Math.floor(focusState.remainingSeconds / 60);
  const focusSecs = (focusState.remainingSeconds % 60).toString().padStart(2, '0');
  const focusTimeStr = `${focusMins}:${focusSecs}`;
  const focusProgress =
    focusState.durationSeconds > 0
      ? (focusState.durationSeconds - focusState.remainingSeconds) / focusState.durationSeconds
      : 0;

  const handlePrimaryProgress = useCallback(async (delta: number) => {
    if (!primaryGoal) return;
    await incrementProgress(primaryGoal.id, delta);
    celebrate(delta > 0 ? 'Progress logged' : 'Progress adjusted');
  }, [celebrate, incrementProgress, primaryGoal]);

  const handleCompletePrimaryGoal = useCallback(async () => {
    if (!primaryGoal) return;
    const completedGoal = await completeGoal(primaryGoal.id);
    celebrate(`${completedGoal.name} completed`);
  }, [celebrate, completeGoal, primaryGoal]);

  // Keyboard navigation & quick shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExpanded) return;

      if (e.key === 'ArrowRight') {
        setActiveTab((prev) => (prev === 'goal' ? 'focus' : prev === 'focus' ? 'media' : 'goal'));
      } else if (e.key === 'ArrowLeft') {
        setActiveTab((prev) => (prev === 'media' ? 'focus' : prev === 'focus' ? 'goal' : 'media'));
      } else if (e.key === ' ' && activeTab === 'focus') {
        e.preventDefault();
        if (focusState.isActive) {
          if (focusState.isPaused) resumeFocus();
          else pauseFocus();
        } else {
          startFocus(25, primaryGoal?.id);
        }
      } else if (e.key === ' ' && activeTab === 'media') {
        e.preventDefault();
        playPause();
      } else if ((e.key === '+' || e.key === '=') && primaryGoal) {
        void handlePrimaryProgress(primaryGoal.defaultIncrement || 1);
      } else if (e.key === '-' && primaryGoal) {
        void handlePrimaryProgress(-(primaryGoal.defaultIncrement || 1));
      } else if (e.key === 'Escape') {
        setIsExpanded(false);
        window.beacon?.windows?.setIslandExpanded?.(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, focusState, handlePrimaryProgress, isExpanded, playPause, primaryGoal, resumeFocus, startFocus, pauseFocus]);

  const resetCollapseTimer = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
  };

  const handleMouseEnter = () => {
    resetCollapseTimer();
    setIsExpanded(true);
    window.beacon?.windows?.setIslandExpanded?.(true);
  };

  const handleMouseLeave = () => {
    collapseTimer.current = setTimeout(() => {
      setIsExpanded(false);
      window.beacon?.windows?.setIslandExpanded?.(false);
    }, 600);
  };

  // 7-Day Calendar Strip
  const today = new Date();
  const monthName = today.toLocaleDateString('en-US', { month: 'short' });
  const calendarDays = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(today.getDate() + offset);
    return {
      date: d.getDate().toString().padStart(2, '0'),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday: offset === 0,
    };
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        paddingTop: '0px',
        backgroundColor: 'transparent',
        boxSizing: 'border-box',
        pointerEvents: 'none', // outer transparent area never captures clicks/hover
      }}
    >
      <ConfettiCanvas />
      {/* Notch Shell Container — hover here triggers expand/collapse.
          The window is always 660×180 (no resize). Expansion is pure CSS.
          pointerEvents: auto so this pill intercepts mouse events even
          when the Electron window is in setIgnoreMouseEvents(true, {forward:true}) mode,
          which still delivers mousemove to web content for hover detection. */}
      <div
        style={{
          width: isExpanded ? '640px' : '200px',
          minHeight: isExpanded ? '146px' : '32px',
          maxHeight: isExpanded ? '160px' : '32px',
          backgroundColor: '#07080b',
          position: 'relative',
          borderLeft: isExpanded ? '1px solid rgba(255, 255, 255, 0.14)' : 'none',
          borderRight: isExpanded ? '1px solid rgba(255, 255, 255, 0.14)' : 'none',
          borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.16)' : 'none',
          borderTop: 'none',
          borderRadius: isExpanded ? '0 0 22px 22px' : '0 0 12px 12px',
          boxShadow: isExpanded
            ? '0 18px 48px rgba(0, 0, 0, 0.75), 0 2px 8px rgba(0, 0, 0, 0.5), inset 0 -1px 0 rgba(255, 255, 255, 0.08)'
            : '0 2px 8px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: isExpanded ? 'default' : 'pointer',
          overflow: 'visible',
          pointerEvents: 'auto', // pill always intercepts events
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Seamless Inverted Notch Ear Fillets */}
        {isExpanded && (
          <>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-14px',
                width: '14px',
                height: '14px',
                backgroundColor: 'transparent',
                borderTopRightRadius: '14px',
                boxShadow: '5px -5px 0 5px #000000',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: '-14px',
                width: '14px',
                height: '14px',
                backgroundColor: 'transparent',
                borderTopLeftRadius: '14px',
                boxShadow: '-5px -5px 0 5px #000000',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />
          </>
        )}

        {/* Top Notch Bar (Exactly 32pt tall to match 14-inch MacBook hardware notch) */}
        <div
          style={{
            height: '32px',
            minHeight: '32px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {!isExpanded ? (
            /* Stealth Notch State: Fits inside the 200px MacBook Camera Notch without Overflow */
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '32px',
                userSelect: 'none',
              }}
            >
              <BeaconCompanion state={companionState} size="tiny" label={companionMessage} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em' }}>
                {focusState.isActive ? 'Focus' : 'Beacon'}
              </span>
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: focusState.isActive ? 'var(--accent-solar, #ff7a00)' : 'var(--accent-cyan, #38bdf8)',
                  boxShadow: focusState.isActive ? '0 0 6px var(--accent-solar, #ff7a00)' : '0 0 6px var(--accent-cyan, #38bdf8)',
                }}
              />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                {focusState.isActive ? focusTimeStr : `${percent}%`}
              </span>
            </div>
          ) : (
            /* Expanded Top Notch Header: Navigation Tabs + Open Main App Action */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCollapseTimer();
                    setActiveTab('goal');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: activeTab === 'goal' ? 'rgba(255, 122, 0, 0.18)' : 'transparent',
                    border: activeTab === 'goal' ? '1px solid rgba(255, 122, 0, 0.45)' : '1px solid transparent',
                    color: activeTab === 'goal' ? 'var(--accent-solar, #ff7a00)' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === 'goal' ? '0 0 10px rgba(255, 122, 0, 0.25)' : 'none',
                  }}
                  title="Goals View"
                >
                  <BeaconCompanion state={companionState} size="tiny" label={companionMessage} />
                  <span>Beacon</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCollapseTimer();
                    setActiveTab('focus');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: activeTab === 'focus' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    border: activeTab === 'focus' ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid transparent',
                    color: activeTab === 'focus' ? 'var(--accent-cyan, #38bdf8)' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '11px',
                    fontWeight: activeTab === 'focus' ? 700 : 500,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === 'focus' ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none',
                  }}
                  title="Focus Timer"
                >
                  <Timer size={11} color={activeTab === 'focus' ? 'var(--accent-cyan, #38bdf8)' : 'currentColor'} />
                  <span>{focusState.isActive ? focusTimeStr : 'Focus'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCollapseTimer();
                    setActiveTab('media');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: activeTab === 'media' ? 'rgba(168, 85, 247, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    border: activeTab === 'media' ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid transparent',
                    color: activeTab === 'media' ? '#c084fc' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '11px',
                    fontWeight: activeTab === 'media' ? 700 : 500,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === 'media' ? '0 0 10px rgba(168, 85, 247, 0.25)' : 'none',
                  }}
                  title="Media Controls"
                >
                  <Music size={11} color={activeTab === 'media' ? '#c084fc' : 'currentColor'} />
                  <span>Media</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCollapseTimer();
                    window.beacon.windows.toggleMain();
                  }}
                  className="btn-ghost"
                  title="Open Main App (⌘⇧B)"
                  style={{ padding: '3px 6px', color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer' }}
                >
                  <ExternalLink size={12} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Expanded 3-Column Beacon Dynamic Island Body (Strictly Below Notch) */}
        {isExpanded && (
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.75fr) minmax(0, 1.25fr) minmax(0, 0.85fr)',
              gap: '10px',
              padding: '6px 14px 14px 14px',
              boxSizing: 'border-box',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Column 1: Active Focus Goal OR Focus Sprint Timer OR Media Controller */}
            {activeTab === 'goal' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  backgroundColor: 'rgba(18, 20, 28, 0.95)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.16)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  minWidth: 0,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 122, 0, 0.12)',
                    border: '1px solid rgba(255, 122, 0, 0.28)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 12px rgba(255, 122, 0, 0.15)',
                  }}
                >
                  <BeaconCompanion state={companionState} size="compact" label={companionMessage} />
                </div>

                {primaryGoal ? (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '2px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {primaryGoal.name}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
                      {primaryGoal.currentValue} / {primaryGoal.targetValue} {primaryGoal.unit || ''}
                    </span>
                    <div style={{ marginTop: '2px' }}>
                      <ProgressBar progressFraction={primaryFrac} color="var(--accent-solar, #ff7a00)" height={3} />
                    </div>

                    {/* Increment Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handlePrimaryProgress(-(primaryGoal.defaultIncrement || 1));
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 5px', fontSize: '9px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                      >
                        <Minus size={9} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handlePrimaryProgress(primaryGoal.defaultIncrement || 1);
                        }}
                        style={{
                          padding: '2px 8px',
                          fontSize: '9px',
                          fontWeight: 700,
                          backgroundColor: 'rgba(255, 122, 0, 0.2)',
                          border: '1px solid rgba(255, 122, 0, 0.45)',
                          color: 'var(--accent-solar, #ff7a00)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 0 8px rgba(255, 122, 0, 0.2)',
                        }}
                      >
                        +{primaryGoal.defaultIncrement || 1} {primaryGoal.unit || ''}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCompletePrimaryGoal();
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 5px', fontSize: '9px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                        title="Complete Goal"
                      >
                        <CheckCircle2 size={10} color="#10b981" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetCollapseTimer();
                      window.beacon.windows.toggleMain();
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      padding: '4px 6px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                      minWidth: 0,
                    }}
                    title="Open Beacon to Create a Goal"
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>No Active Goals</span>
                    <span style={{ fontSize: '10px', color: '#5ac8fa', fontWeight: 500 }}>✦ Click to create one</span>
                  </button>
                )}
              </div>
            )}

            {activeTab === 'focus' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '3px', minWidth: 0 }}>
                  {/* Active Header & Timer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', minWidth: 0 }}>
                    {!focusState.isActive ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, flexShrink: 0 }}>Goal:</span>
                        <select
                          value={selectedFocusGoalId}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedFocusGoalId(e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            backgroundColor: '#16161a',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.14)',
                            borderRadius: '5px',
                            padding: '1px 4px',
                            fontSize: '10px',
                            fontWeight: 600,
                            flex: 1,
                            minWidth: 0,
                            maxWidth: '110px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <option value="">⚡️ Independent</option>
                          {goals.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#ffffff',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {focusState.goalName ? `Sprint: ${focusState.goalName}` : 'Independent Timer'}
                      </span>
                    )}

                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {focusTimeStr}
                    </span>
                  </div>

                  {focusState.isActive && (
                    <div style={{ marginTop: '1px' }}>
                      <ProgressBar progressFraction={focusProgress} color="#ffffff" height={3} />
                    </div>
                  )}

                  {/* Duration Presets (When Idle) & Actions */}
                  {!focusState.isActive ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginTop: '2px', minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                        {[5, 15, 25, 45, 60].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDuration(mins);
                            }}
                            style={{
                              padding: '2px 4px',
                              fontSize: '9px',
                              fontWeight: selectedDuration === mins ? 700 : 500,
                              borderRadius: '4px',
                              backgroundColor: selectedDuration === mins ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
                              color: selectedDuration === mins ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                              cursor: 'pointer',
                              border: 'none',
                            }}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.playTickSound();
                          startFocus(selectedDuration, selectedFocusGoalId || undefined);
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 6px', fontSize: '9px', fontWeight: 700, backgroundColor: 'rgba(255, 255, 255, 0.16)', color: '#ffffff', flexShrink: 0 }}
                      >
                        <Play size={9} style={{ marginRight: '2px' }} /> Start
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', minWidth: 0 }}>
                      {focusState.isPaused ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.playTickSound();
                            resumeFocus();
                          }}
                          className="btn-ghost"
                          style={{ padding: '2px 7px', fontSize: '9px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.14)', color: '#ffffff' }}
                        >
                          <Play size={9} style={{ marginRight: '2px' }} /> Resume
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.playTickSound();
                            pauseFocus();
                          }}
                          className="btn-ghost"
                          style={{ padding: '2px 7px', fontSize: '9px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
                        >
                          <Pause size={9} style={{ marginRight: '2px' }} /> Pause
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.playMilestonePop();
                          extendFocus(5);
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 5px', fontSize: '9px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                        title="Add 5 minutes"
                      >
                        +5m
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.playMilestonePop();
                          stopFocus(!!focusState.goalId);
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 5px', fontSize: '9px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                        title="End timer"
                      >
                        {focusState.goalId ? 'Stop & Log' : 'Stop'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Music size={18} color="#ffffff" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '2px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#ffffff',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {mediaState.title || 'No Media Playing'}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.55)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {mediaState.artist || 'System Audio'} {mediaState.album ? `• ${mediaState.album}` : ''}
                  </span>

                  {/* Playback Progress */}
                  {mediaState.durationSeconds > 0 && (
                    <div style={{ marginTop: '1px' }}>
                      <ProgressBar
                        progressFraction={mediaState.progressSeconds / mediaState.durationSeconds}
                        color="#ffffff"
                        height={2.5}
                      />
                    </div>
                  )}

                  {/* Playback Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetCollapseTimer();
                        previousTrack();
                      }}
                      className="btn-ghost"
                      style={{ padding: '2px 4px', cursor: 'pointer' }}
                      title="Previous Track"
                    >
                      <SkipBack size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetCollapseTimer();
                        playPause();
                      }}
                      className="btn-ghost"
                      style={{ padding: '2px 8px', backgroundColor: 'rgba(255, 255, 255, 0.14)', color: '#ffffff', cursor: 'pointer' }}
                      title={mediaState.isPlaying ? 'Pause' : 'Play'}
                    >
                      {mediaState.isPlaying ? <Pause size={11} /> : <Play size={11} />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetCollapseTimer();
                        nextTrack();
                      }}
                      className="btn-ghost"
                      style={{ padding: '2px 4px', cursor: 'pointer' }}
                      title="Next Track"
                    >
                      <SkipForward size={11} />
                    </button>

                    {/* Quick Volume Steppers */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: 'auto', flexShrink: 0 }}>
                      <Volume2 size={10} color="rgba(255, 255, 255, 0.5)" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetCollapseTimer();
                          setVolume(Math.max(0, (mediaState.volume ?? 50) - 10));
                        }}
                        className="btn-ghost"
                        style={{ padding: '1px 3px', fontSize: '9px', cursor: 'pointer' }}
                        title="Volume Down (-10%)"
                      >
                        -
                      </button>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.6)', fontVariantNumeric: 'tabular-nums' }}>
                        {mediaState.volume ?? 50}%
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetCollapseTimer();
                          setVolume(Math.min(100, (mediaState.volume ?? 50) + 10));
                        }}
                        className="btn-ghost"
                        style={{ padding: '1px 3px', fontSize: '9px', cursor: 'pointer' }}
                        title="Volume Up (+10%)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Column 2: Date / Calendar & Streak Strip */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 10px',
                backgroundColor: 'rgba(18, 20, 28, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.16)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                minWidth: 0,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-solar, #ff7a00)', flexShrink: 0 }}>{monthName}</span>
                <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                  {calendarDays.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetCollapseTimer();
                        window.beacon.windows.toggleMain();
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '2px 4px',
                        borderRadius: '5px',
                        backgroundColor: c.isToday ? 'var(--accent-solar, #ff7a00)' : 'transparent',
                        color: c.isToday ? '#07080b' : 'rgba(255, 255, 255, 0.45)',
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                        boxShadow: c.isToday ? '0 0 8px rgba(255, 122, 0, 0.4)' : 'none',
                      }}
                      title={c.isToday ? 'Today (Click to open Beacon)' : `Day ${c.date} (Click to open Beacon)`}
                    >
                      <span style={{ fontSize: '7px', fontWeight: 600, textTransform: 'uppercase' }}>{c.dayName}</span>
                      <span style={{ fontSize: '9px', fontWeight: c.isToday ? 800 : 500 }}>{c.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: 'rgba(255, 255, 255, 0.65)', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Calendar size={10} color="rgba(255, 255, 255, 0.7)" />
                  <span>{goals.length > 0 ? `${goals.length} active` : 'Nothing today'}</span>
                </div>
                {goals.some((g) => (g.streakConfig?.currentStreak ?? 0) > 0) && (
                  <>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-solar, #ff7a00)', fontWeight: 700 }}>
                      <Sparkles size={10} color="var(--accent-solar, #ff7a00)" />
                      <span>{Math.max(...goals.map((g) => g.streakConfig?.currentStreak ?? 0))}d streak</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Column 3: Overall Progress Ring & Quick Actions */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                resetCollapseTimer();
                window.beacon.windows.toggleMain();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'rgba(18, 20, 28, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.16)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                cursor: 'pointer',
                minWidth: 0,
                overflow: 'hidden',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
              title="Open Beacon Main Dashboard"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}>
                <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Overall</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-solar, #ff7a00)' }}>{percent}%</span>
                <span style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.45)' }}>{stats?.activeGoals ?? 0} active</span>
              </div>

              <GoalProgressRing
                progressFraction={stats?.overallProgressFraction ?? 0}
                size={38}
                strokeWidth={3}
                color="var(--accent-solar, #ff7a00)"
                showText={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
