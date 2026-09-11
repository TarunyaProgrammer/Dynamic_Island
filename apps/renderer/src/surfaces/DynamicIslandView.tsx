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
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [artworkFailed, setArtworkFailed] = useState(false);
  const [pairingMessage, setPairingMessage] = useState<string | null>(null);

  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearCollapseTimer = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
  }, []);
  const requestExpanded = useCallback((next: boolean) => {
    clearCollapseTimer();
    setIsExpanded(next);
    void window.beacon.windows.setIslandExpanded(next);
  }, [clearCollapseTimer]);
  const primaryGoal = goals.find((goal) => goal.id === selectedGoalId) ?? goals[0];
  const primaryFrac =
    primaryGoal && primaryGoal.targetValue > 0
      ? Math.min(1.0, primaryGoal.currentValue / primaryGoal.targetValue)
      : 0;

  const percent = stats ? Math.round(stats.overallProgressFraction * 100) : 0;
  const hasMediaTarget = mediaState.title !== 'No Media Playing';
  const showArtwork = Boolean(mediaState.artworkUrl && !artworkFailed);
  const copyBrowserPairingDetails = useCallback(async () => {
    try {
      const connection = await window.beacon.media.copyBrowserConnection();
      setPairingMessage(`Port ${connection.port} and token copied`);
    } catch {
      setPairingMessage('Restart Beacon, then pair Chrome');
    }
  }, []);

  useEffect(() => {
    setArtworkFailed(false);
  }, [mediaState.artworkUrl]);

  const [selectedFocusGoalId, setSelectedFocusGoalId] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(25);

  // Auto-select first goal if not set
  useEffect(() => {
    if (goals.length === 0) {
      if (selectedGoalId) setSelectedGoalId('');
      return;
    }
    if (!goals.some((goal) => goal.id === selectedGoalId)) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

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

  const today = new Date();
  const monthName = today.toLocaleDateString('en-US', { month: 'short' });
  const calendarDays = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return {
      date: date.getDate().toString().padStart(2, '0'),
      dayName: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      isToday: offset === 0,
    };
  });

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
        requestExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, focusState, handlePrimaryProgress, isExpanded, playPause, primaryGoal, requestExpanded, resumeFocus, startFocus, pauseFocus]);

  // Auto-collapse when window loses focus (e.g. user clicks another window or switches spaces)
  useEffect(() => {
    const handleBlur = () => {
      if (isExpanded) {
        requestExpanded(false);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isExpanded, requestExpanded]);

  useEffect(() => () => clearCollapseTimer(), [clearCollapseTimer]);

  const resetCollapseTimer = clearCollapseTimer;

  const handleMouseEnter = () => {
    resetCollapseTimer();
    requestExpanded(true);
  };

  const handleMouseLeave = () => {
    collapseTimer.current = setTimeout(() => {
      requestExpanded(false);
    }, 600);
  };

  return (
    <main
      aria-label="Beacon Dynamic Island"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        paddingTop: '0px',
        backgroundColor: 'transparent',
        boxSizing: 'border-box',
        pointerEvents: isExpanded ? 'auto' : 'none',
      }}
    >
      <ConfettiCanvas />
      {/* Notch Shell Container — hover or click here triggers expand/collapse.
          Dynamically resizes between 200×32 (stealth notch) and 640×160 (expanded). */}
      <section
        aria-label={isExpanded ? 'Beacon Island controls' : 'Beacon Island summary'}
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
          transition: 'background-color 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: isExpanded ? 'default' : 'pointer',
          overflow: 'visible',
          pointerEvents: 'auto',
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
            <button
              type="button"
              aria-label="Expand Beacon Island"
              onClick={handleMouseEnter}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                height: '32px',
                userSelect: 'none',
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
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
                  backgroundColor: '#ffffff',
                  boxShadow: focusState.isActive ? '0 0 6px rgba(255, 255, 255, 0.6)' : 'none',
                }}
              />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                {focusState.isActive ? focusTimeStr : `${percent}%`}
              </span>
            </button>
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
                    backgroundColor: activeTab === 'goal' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    border: activeTab === 'goal' ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid transparent',
                    color: activeTab === 'goal' ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                    boxShadow: 'none',
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
                    backgroundColor: activeTab === 'focus' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                    border: activeTab === 'focus' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                    color: activeTab === 'focus' ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '11px',
                    fontWeight: activeTab === 'focus' ? 700 : 500,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                    boxShadow: 'none',
                  }}
                  title="Focus Timer"
                >
                  <Timer size={11} color={activeTab === 'focus' ? '#ffffff' : 'currentColor'} />
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
                    backgroundColor: activeTab === 'media' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                    border: activeTab === 'media' ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                    color: activeTab === 'media' ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '11px',
                    fontWeight: activeTab === 'media' ? 700 : 500,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
                    boxShadow: 'none',
                  }}
                  title="Media Controls"
                >
                  <Music size={11} color={activeTab === 'media' ? '#ffffff' : 'currentColor'} />
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
              gridTemplateColumns: 'minmax(0, 1fr)',
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
                    <select
                      aria-label="Choose goal"
                      value={primaryGoal.id}
                      onChange={(event) => setSelectedGoalId(event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        minWidth: 0,
                        width: '100%',
                        padding: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>{goal.name}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 500 }}>
                      {primaryGoal.currentValue} / {primaryGoal.targetValue} {primaryGoal.unit || ''}
                    </span>
                    <div style={{ marginTop: '2px' }}>
                      <ProgressBar progressFraction={primaryFrac} color="#ffffff" height={3} />
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
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          boxShadow: 'none',
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
                        <CheckCircle2 size={10} color="#ffffff" />
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
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>✦ Click to create one</span>
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
                  gap: '12px',
                  padding: '10px 12px',
                  background: showArtwork
                    ? 'linear-gradient(105deg, rgba(124, 108, 255, 0.16), rgba(255, 255, 255, 0.045) 42%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  borderRadius: '18px',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    boxShadow: showArtwork ? '0 8px 18px rgba(0, 0, 0, 0.28)' : undefined,
                  }}
                >
                  {showArtwork ? (
                    <img
                      src={mediaState.artworkUrl}
                      alt=""
                      onError={() => setArtworkFailed(true)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Music size={22} color="rgba(255, 255, 255, 0.92)" />
                  )}
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
                    {hasMediaTarget ? (mediaState.artist || 'Unknown artist') : 'System volume is ready'} {mediaState.album ? `• ${mediaState.album}` : ''}
                  </span>

                  {!hasMediaTarget && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetCollapseTimer();
                        void copyBrowserPairingDetails();
                      }}
                      className="btn-ghost"
                      style={{ alignSelf: 'flex-start', padding: '1px 0', fontSize: '9px', color: pairingMessage ? 'rgba(140, 211, 255, 0.92)' : 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}
                      title="Copy details to pair the Beacon Chrome Media Companion"
                    >
                      {pairingMessage ?? 'Pair Chrome companion'}
                    </button>
                  )}

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
                      disabled={!hasMediaTarget}
                      style={{ padding: '2px 4px', cursor: hasMediaTarget ? 'pointer' : 'not-allowed', opacity: hasMediaTarget ? 1 : 0.35 }}
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
                      disabled={!hasMediaTarget}
                      style={{ padding: '4px 9px', backgroundColor: 'rgba(255, 255, 255, 0.16)', color: '#ffffff', cursor: hasMediaTarget ? 'pointer' : 'not-allowed', opacity: hasMediaTarget ? 1 : 0.35, borderRadius: '8px' }}
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
                      disabled={!hasMediaTarget}
                      style={{ padding: '2px 4px', cursor: hasMediaTarget ? 'pointer' : 'not-allowed', opacity: hasMediaTarget ? 1 : 0.35 }}
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
                display: 'none',
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
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', flexShrink: 0 }}>{monthName}</span>
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
                        backgroundColor: c.isToday ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        color: c.isToday ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                        boxShadow: 'none',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ffffff', fontWeight: 700 }}>
                      <Sparkles size={10} color="#ffffff" />
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
                display: 'none',
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
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>{percent}%</span>
                <span style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.45)' }}>{stats?.activeGoals ?? 0} active</span>
              </div>

              <GoalProgressRing
                progressFraction={stats?.overallProgressFraction ?? 0}
                size={38}
                strokeWidth={3}
                color="#ffffff"
                showText={false}
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
