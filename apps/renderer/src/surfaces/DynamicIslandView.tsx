// apps/renderer/src/surfaces/DynamicIslandView.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGoals } from '../hooks/useGoals';
import { useActivities } from '../hooks/useActivities';
import { useCompanion } from '../hooks/useCompanion';
import { useCalendar } from '../hooks/useCalendar';
import { useToday } from '../hooks/useToday';
import { GoalProgressRing } from '../components/GoalProgressRing';
import { BeaconCompanion } from '../components/BeaconCompanion';
import { ConfettiCanvas } from '../components/ConfettiCanvas';
import { soundEffects } from '../utils/audio';
import {
  ExternalLink,
  Minus,
  CheckCircle2,
  Calendar,
  Timer,
  Play,
  Pause,
  ChevronDown,
  Sparkles,
  Clock,
  Video,
} from 'lucide-react';
import '../styles/DynamicIsland.css';

export const DynamicIslandView: React.FC = () => {
  const { goals, stats, incrementProgress, completeGoal } = useGoals('active');
  const { focusState, startFocus, pauseFocus, resumeFocus, stopFocus, extendFocus } = useActivities();
  const { state: companionState, message: companionMessage, celebrate } = useCompanion('island');
  const calendar = useCalendar();
  const today = useToday();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'goal' | 'focus' | 'calendar'>('goal');
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [selectedFocusGoalId, setSelectedFocusGoalId] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(25);

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

  const handlePrimaryProgress = useCallback(async (delta: number) => {
    if (!primaryGoal) return;
    await incrementProgress(primaryGoal.id, delta);
    celebrate(delta > 0 ? '✦ Progress logged' : 'Progress adjusted');
  }, [celebrate, incrementProgress, primaryGoal]);

  const handleCompletePrimaryGoal = useCallback(async () => {
    if (!primaryGoal) return;
    const completedGoal = await completeGoal(primaryGoal.id);
    celebrate(`${completedGoal.name} complete! ✦`);
  }, [celebrate, completeGoal, primaryGoal]);

  // Keyboard navigation & quick shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExpanded) return;

      if (e.key === 'ArrowRight') {
        setActiveTab((prev) => (prev === 'goal' ? 'focus' : prev === 'focus' ? 'calendar' : 'goal'));
      } else if (e.key === 'ArrowLeft') {
        setActiveTab((prev) => (prev === 'calendar' ? 'focus' : prev === 'focus' ? 'goal' : 'calendar'));
      } else if (e.key === ' ' && activeTab === 'focus') {
        e.preventDefault();
        if (focusState.isActive) {
          if (focusState.isPaused) resumeFocus();
          else pauseFocus();
        } else {
          startFocus(selectedDuration, primaryGoal?.id);
        }
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
  }, [activeTab, focusState, handlePrimaryProgress, isExpanded, primaryGoal, requestExpanded, resumeFocus, startFocus, pauseFocus, selectedDuration]);

  // Auto-collapse when window loses focus
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
    }, 650);
  };

  // Helper to format event time
  const formatEventTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return timeStr;
    }
  };

  const todayActionIds = new Set(
    today.plan?.entries.filter((entry) => entry.bucket === 'today').map((entry) => entry.actionId) ?? [],
  );
  const nextTodayAction = today.actions.find((action) => todayActionIds.has(action.id));

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

      {/* Notch Shell Container */}
      <section
        aria-label={isExpanded ? 'Beacon Island controls' : 'Beacon Island summary'}
        className={`island-notch-shell ${isExpanded ? 'island-notch-shell--expanded' : 'island-notch-shell--collapsed'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Seamless Inverted Notch Ear Fillets */}
        {isExpanded && (
          <>
            <div className="island-fillet-left" />
            <div className="island-fillet-right" />
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
            /* Stealth Notch State: Fits inside the 200px MacBook Camera Notch */
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
                {focusState.isActive ? 'Focus' : calendar.nextEvent && calendar.minutesUntilNext !== null && calendar.minutesUntilNext <= 15 ? 'Meeting' : 'Beacon'}
              </span>
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: focusState.isActive ? '#ff7a00' : calendar.nextEvent && calendar.minutesUntilNext !== null && calendar.minutesUntilNext <= 15 ? '#f87171' : '#ffffff',
                  boxShadow: focusState.isActive ? '0 0 6px rgba(255, 122, 0, 0.8)' : 'none',
                }}
              />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', fontVariantNumeric: 'tabular-nums' }}>
                {focusState.isActive ? focusTimeStr : calendar.nextEvent && calendar.minutesUntilNext !== null && calendar.minutesUntilNext <= 15 ? `In ${calendar.minutesUntilNext}m` : `${percent}%`}
              </span>
            </button>
          ) : (
            /* Expanded Top Notch Header: Navigation Tabs + Open Main App Action */
            <>
              <div className="island-tab-pill-bar">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCollapseTimer();
                    setActiveTab('goal');
                  }}
                  className={`island-tab-btn ${activeTab === 'goal' ? 'island-tab-btn--active' : ''}`}
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
                  className={`island-tab-btn ${activeTab === 'focus' ? 'island-tab-btn--active' : ''}`}
                  title="Focus Timer"
                >
                  <Timer size={11} />
                  <span>{focusState.isActive ? focusTimeStr : 'Focus'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCollapseTimer();
                    setActiveTab('calendar');
                  }}
                  className={`island-tab-btn ${activeTab === 'calendar' ? 'island-tab-btn--active' : ''}`}
                  title="Schedule & Calendar Events"
                >
                  <Calendar size={11} />
                  <span>
                    {calendar.nextEvent && calendar.minutesUntilNext !== null && calendar.minutesUntilNext <= 60
                      ? `In ${calendar.minutesUntilNext}m`
                      : 'Calendar'}
                  </span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {calendar.nextEvent && activeTab !== 'calendar' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetCollapseTimer();
                      setActiveTab('calendar');
                    }}
                    className="island-tab-btn"
                    style={{ padding: '2px 8px', fontSize: '10px', gap: '5px', background: 'rgba(255, 122, 0, 0.12)', border: '1px solid rgba(255, 122, 0, 0.25)' }}
                    title={`Next meeting: ${calendar.nextEvent.title}`}
                  >
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#ff7a00', boxShadow: '0 0 6px rgba(255, 122, 0, 0.8)' }} />
                    <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ffaa40', fontWeight: 600 }}>
                      {calendar.nextEvent.title}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCollapseTimer();
                    window.beacon.windows.toggleMain();
                  }}
                  className="island-btn-ghost"
                  title="Open Full Workspace (⌘⇧B)"
                  style={{ padding: '3px 7px' }}
                >
                  <ExternalLink size={12} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Expanded 2-Column Balanced Liquid Bento Grid */}
        {isExpanded && (
          <div className="island-body-grid">
            {/* TAB 1: GOAL / BEACON */}
            {activeTab === 'goal' && (
              <>
                {/* Left Card: Primary Goal Hero */}
                <div className="island-card">
                  {primaryGoal ? (
                    <>
                      {/* Header Row: Companion + Goal Name + Progress Stats */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          className="island-companion-avatar"
                          onClick={(e) => {
                            e.stopPropagation();
                            celebrate('✦ Looking good!');
                          }}
                          title="Click to interact with companion"
                        >
                          <BeaconCompanion state={companionState} size="compact" label={companionMessage} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            {/* Goal Dropdown with integrated Chevron */}
                            <div className="island-goal-select-wrap">
                              <select
                                aria-label="Choose goal"
                                value={primaryGoal.id}
                                onChange={(event) => setSelectedGoalId(event.target.value)}
                                onClick={(event) => event.stopPropagation()}
                                className="island-goal-select"
                              >
                                {goals.map((goal) => (
                                  <option key={goal.id} value={goal.id} style={{ backgroundColor: '#12141a', color: '#ffffff' }}>
                                    {goal.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={11} className="island-goal-select-arrow" />
                            </div>

                            {/* Percentage badge */}
                            <span className="island-badge-solar">
                              {Math.round(primaryFrac * 100)}%
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                              {primaryGoal.currentValue.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
                              / {primaryGoal.targetValue.toLocaleString()} {primaryGoal.unit || ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Luminous Progress Bar */}
                      <div className="island-progress-track">
                        <div
                          className="island-progress-fill"
                          style={{ width: `${Math.min(100, Math.max(0, Math.round(primaryFrac * 100)))}%` }}
                        />
                      </div>

                      {/* Bottom Row: Quick Action Pill Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handlePrimaryProgress(-(primaryGoal.defaultIncrement || 1));
                          }}
                          className="island-btn-ghost"
                          title={`Subtract ${primaryGoal.defaultIncrement || 1}`}
                        >
                          <Minus size={11} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handlePrimaryProgress(primaryGoal.defaultIncrement || 1);
                          }}
                          className="island-btn-increment"
                          title={`Add ${primaryGoal.defaultIncrement || 1}`}
                        >
                          +{primaryGoal.defaultIncrement || 1} {primaryGoal.unit || ''}
                        </button>

                        {(primaryGoal.defaultIncrement || 1) > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handlePrimaryProgress(1);
                            }}
                            className="island-btn-ghost"
                            style={{ fontSize: '10px', padding: '3px 6px' }}
                            title="Add 1"
                          >
                            +1
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleCompletePrimaryGoal();
                          }}
                          className="island-btn-ghost island-btn-ghost--done"
                          title="Complete Goal"
                          style={{ marginLeft: 'auto' }}
                        >
                          <CheckCircle2 size={11} />
                          <span style={{ marginLeft: '3px', fontSize: '10px', fontWeight: 600 }}>Done</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        resetCollapseTimer();
                        window.beacon.windows.toggleMain();
                      }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '4px', cursor: 'pointer' }}
                    >
                      <Sparkles size={16} color="#ff7a00" />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>No Active Goals</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>Click to create your first goal</span>
                    </div>
                  )}
                </div>

                {/* Right Card: Today Momentum & Next Up */}
                <div
                  className="island-card island-card--interactive"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCollapseTimer();
                    window.beacon.windows.toggleMain();
                  }}
                  title="Click to open Today's Schedule & Momentum in Beacon"
                >
                  {/* Top: Progress Ring + Stat */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Today
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>
                        {percent}% Complete
                      </span>
                    </div>

                    <GoalProgressRing
                      progressFraction={stats?.overallProgressFraction ?? 0}
                      size={34}
                      strokeWidth={3.5}
                      showText={false}
                      color="#ff7a00"
                    />
                  </div>

                  {/* Bottom: Upcoming Calendar Event OR Next Action OR Streak */}
                  {calendar.nextEvent ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        padding: '4px 6px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className={`island-badge-event ${calendar.minutesUntilNext !== null && calendar.minutesUntilNext <= 15 ? 'island-badge-now' : ''}`}>
                          {calendar.minutesUntilNext !== null && calendar.minutesUntilNext <= 15
                            ? 'NOW'
                            : calendar.minutesUntilNext !== null
                              ? `${calendar.minutesUntilNext}m`
                              : formatEventTime(calendar.nextEvent.start)}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {calendar.nextEvent.title}
                        </span>
                      </div>
                    </div>
                  ) : nextTodayAction ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '4px',
                        padding: '4px 6px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, flex: 1 }}>
                        <Clock size={10} color="#ffaa40" />
                        <span style={{ fontSize: '10px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {nextTodayAction.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.45)', flexShrink: 0 }}>Next</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      <Sparkles size={11} color="#ff7a00" />
                      <span>{stats?.activeGoals ?? 0} active goals</span>
                      <span style={{ opacity: 0.4 }}>•</span>
                      <span>{stats?.todayIncrementsCount ?? 0} logged</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: FOCUS TIMER */}
            {activeTab === 'focus' && (
              <>
                {/* Left Card: Focus Timer Controller */}
                <div className="island-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    {!focusState.isActive ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>Goal:</span>
                        <div className="island-goal-select-wrap" style={{ flex: 1 }}>
                          <select
                            value={selectedFocusGoalId}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedFocusGoalId(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="island-goal-select"
                            style={{ fontSize: '11px' }}
                          >
                            <option value="" style={{ backgroundColor: '#12141a', color: '#ffffff' }}>⚡️ Independent Sprint</option>
                            {goals.map((g) => (
                              <option key={g.id} value={g.id} style={{ backgroundColor: '#12141a', color: '#ffffff' }}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="island-goal-select-arrow" />
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {focusState.goalName ? `Sprint: ${focusState.goalName}` : 'Deep Focus Sprint'}
                      </span>
                    )}

                    <span className="island-timer-digits">
                      {focusTimeStr}
                    </span>
                  </div>

                  {/* Progress track if active */}
                  {focusState.isActive && (
                    <div className="island-progress-track">
                      <div
                        className="island-progress-fill"
                        style={{
                          width: `${Math.round(focusProgress * 100)}%`,
                          background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                          boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)',
                        }}
                      />
                    </div>
                  )}

                  {/* Idle: Presets + Start Button; Active: Pause/Resume + Extend */}
                  {!focusState.isActive ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[15, 25, 45, 60].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDuration(mins);
                            }}
                            className={`island-duration-chip ${selectedDuration === mins ? 'island-duration-chip--active' : ''}`}
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
                        className="island-btn-increment"
                        style={{ gap: '4px' }}
                      >
                        <Play size={10} fill="currentColor" />
                        <span>Start</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {focusState.isPaused ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.playTickSound();
                            resumeFocus();
                          }}
                          className="island-btn-increment"
                          style={{ gap: '4px' }}
                        >
                          <Play size={10} fill="currentColor" />
                          <span>Resume</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.playTickSound();
                            pauseFocus();
                          }}
                          className="island-btn-ghost"
                          style={{ gap: '4px', background: 'rgba(255, 255, 255, 0.12)' }}
                        >
                          <Pause size={10} />
                          <span>Pause</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.playMilestonePop();
                          extendFocus(5);
                        }}
                        className="island-btn-ghost"
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
                        className="island-btn-ghost"
                        style={{ marginLeft: 'auto' }}
                        title="End session"
                      >
                        {focusState.goalId ? 'Stop & Log' : 'End'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Card: Focus Companion & Context */}
                <div className="island-card" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
                  <BeaconCompanion state={focusState.isActive ? 'thinking' : companionState} size="compact" label={focusState.isActive ? 'Focus active ✦' : companionMessage} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>
                    {focusState.isActive ? (focusState.isPaused ? 'Session Paused' : 'In The Zone') : 'Deep Work Timer'}
                  </span>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)' }}>
                    Press Space to pause/resume
                  </span>
                </div>
              </>
            )}

            {/* TAB 3: CALENDAR & EVENTS */}
            {activeTab === 'calendar' && (
              <>
                {/* Left Card: Upcoming Events List */}
                <div className="island-card" style={{ overflowY: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Today's Schedule
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.45)' }}>
                      {calendar.upcomingEvents.length} upcoming
                    </span>
                  </div>

                  {calendar.upcomingEvents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {calendar.upcomingEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px',
                            padding: '4px 6px',
                            borderRadius: '7px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, flex: 1 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: ev.source === 'google' ? '#3b82f6' : '#f87171', flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ev.title}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', fontVariantNumeric: 'tabular-nums' }}>
                              {formatEventTime(ev.start)}
                            </span>
                            {ev.location && ev.location.startsWith('http') && (
                              <a
                                href={ev.location}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="island-btn-ghost"
                                style={{ padding: '1px 4px', fontSize: '9px' }}
                                title="Join Meeting"
                              >
                                <Video size={9} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '3px' }}>
                      <Calendar size={14} color="rgba(255, 255, 255, 0.4)" />
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>No more events today</span>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>Apple & Google Calendar synced</span>
                    </div>
                  )}
                </div>

                {/* Right Card: Calendar Status & Quick Actions */}
                <div
                  className="island-card island-card--interactive"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCollapseTimer();
                    window.beacon.windows.toggleMain();
                  }}
                  title="Open Full Calendar in Beacon"
                  style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '5px' }}
                >
                  <Calendar size={18} color="#ff7a00" />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>Full Calendar</span>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)' }}>Click to view full agenda</span>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
};
