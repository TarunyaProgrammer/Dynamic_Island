// apps/renderer/src/surfaces/DynamicIslandView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useGoals } from '../hooks/useGoals';
import { useActivities } from '../hooks/useActivities';
import { useMedia } from '../hooks/useMedia';
import { GoalProgressRing } from '../components/GoalProgressRing';
import { ProgressBar } from '../components/ProgressBar';
import { BeaconLogo } from '../components/BeaconLogo';
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
  SkipBack,
  SkipForward,
  Music,
  Volume2,
} from 'lucide-react';

export const DynamicIslandView: React.FC = () => {
  const { goals, stats, incrementProgress, completeGoal } = useGoals('active');
  const { focusState, startFocus, pauseFocus, resumeFocus, stopFocus, extendFocus } = useActivities();
  const { mediaState, playPause, nextTrack, previousTrack, setVolume } = useMedia();
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
        incrementProgress(primaryGoal.id, primaryGoal.defaultIncrement || 1);
      } else if (e.key === '-' && primaryGoal) {
        incrementProgress(primaryGoal.id, -(primaryGoal.defaultIncrement || 1));
      } else if (e.key === 'Escape') {
        setIsExpanded(false);
        window.beacon?.windows?.setIslandExpanded?.(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, activeTab, focusState, primaryGoal, incrementProgress, startFocus, pauseFocus, resumeFocus, playPause]);

  const handleMouseEnter = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    setIsExpanded(true);
    window.beacon?.windows?.setIslandExpanded?.(true);
  };

  const handleMouseLeave = () => {
    collapseTimer.current = setTimeout(() => {
      setIsExpanded(false);
      window.beacon?.windows?.setIslandExpanded?.(false);
    }, 450);
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
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ConfettiCanvas />
      {/* Notch Shell Container with Inverted Bezels (Calibrated for 14-inch MacBook Pro: 185x32pt) */}
      <div
        style={{
          width: isExpanded ? '640px' : '240px',
          minHeight: isExpanded ? '146px' : '32px',
          maxHeight: isExpanded ? '160px' : '32px',
          backgroundColor: isExpanded ? 'rgba(10, 10, 14, 0.86)' : '#000000',
          backdropFilter: isExpanded ? 'blur(32px) saturate(190%)' : 'none',
          WebkitBackdropFilter: isExpanded ? 'blur(32px) saturate(190%)' : 'none',
          position: 'relative',
          borderLeft: isExpanded ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
          borderRight: isExpanded ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
          borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
          borderTop: 'none',
          borderRadius: isExpanded ? '0 0 22px 22px' : '0 0 12px 12px',
          boxShadow: isExpanded
            ? '0 10px 26px rgba(0, 0, 0, 0.28), 0 1px 3px rgba(0, 0, 0, 0.15)'
            : '0 2px 6px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          overflow: 'visible',
        }}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
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
          {/* Left Wing / Activity Switcher Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              onClick={() => {
                if (isExpanded) {
                  setActiveTab('goal');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '9999px',
                backgroundColor: activeTab === 'goal' && isExpanded ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <BeaconLogo size={13} />
              <span>{focusState.isActive ? 'Focus Sprint' : 'Beacon'}</span>
            </div>

            {isExpanded && (
              <>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('focus');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    backgroundColor: activeTab === 'focus' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.05)',
                    color: activeTab === 'focus' ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  <Timer size={11} />
                  <span>{focusState.isActive ? focusTimeStr : 'Focus'}</span>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('media');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    backgroundColor: activeTab === 'media' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.05)',
                    color: activeTab === 'media' ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  <Music size={11} />
                  <span>Media</span>
                </div>
              </>
            )}
          </div>

          {/* Right Wing / Metrics & Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isExpanded ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>
                  {focusState.isActive ? focusTimeStr : `${percent}%`}
                </span>
                <GoalProgressRing
                  progressFraction={focusState.isActive ? focusProgress : (stats?.overallProgressFraction ?? 0)}
                  size={16}
                  strokeWidth={2.2}
                  showText={false}
                  color="#ffffff"
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.beacon.windows.toggleMain();
                  }}
                  className="btn-ghost"
                  title="Open Main App"
                  style={{ padding: '3px 6px', color: 'rgba(255, 255, 255, 0.8)' }}
                >
                  <ExternalLink size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expanded 3-Column Beacon Dynamic Island Body (Strictly Below Notch) */}
        {isExpanded && (
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '1.4fr 1.2fr 0.9fr',
              gap: '12px',
              padding: '6px 16px 14px 16px',
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
                  gap: '12px',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <BeaconLogo size={28} />
                </div>

                {primaryGoal ? (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '3px' }}>
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
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.55)' }}>
                      {primaryGoal.currentValue} / {primaryGoal.targetValue} {primaryGoal.unit || ''}
                    </span>
                    <div style={{ marginTop: '2px' }}>
                      <ProgressBar progressFraction={primaryFrac} color="#ffffff" height={3} />
                    </div>

                    {/* Increment Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          incrementProgress(primaryGoal.id, -(primaryGoal.defaultIncrement || 1));
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                      >
                        <Minus size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          incrementProgress(primaryGoal.id, primaryGoal.defaultIncrement || 1);
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.14)', color: '#ffffff' }}
                      >
                        +{primaryGoal.defaultIncrement || 1} {primaryGoal.unit || ''}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          completeGoal(primaryGoal.id);
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                        title="Complete Goal"
                      >
                        <CheckCircle2 size={11} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>No Active Goals</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>Click to create one</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'focus' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  minWidth: 0,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
                  {/* Active Header & Timer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    {!focusState.isActive ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, flexShrink: 0 }}>Goal:</span>
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
                            borderRadius: '6px',
                            padding: '2px 6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            maxWidth: '130px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <option value="">⚡️ Independent Timer</option>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginTop: '3px' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {[5, 15, 25, 45, 60].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDuration(mins);
                            }}
                            style={{
                              padding: '2px 5px',
                              fontSize: '10px',
                              fontWeight: selectedDuration === mins ? 700 : 500,
                              borderRadius: '4px',
                              backgroundColor: selectedDuration === mins ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
                              color: selectedDuration === mins ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                              cursor: 'pointer',
                            }}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.playTickSound();
                          startFocus(selectedDuration, selectedFocusGoalId || undefined);
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, backgroundColor: 'rgba(255, 255, 255, 0.16)', color: '#ffffff' }}
                      >
                        <Play size={10} style={{ marginRight: '3px' }} /> Start
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      {focusState.isPaused ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.playTickSound();
                            resumeFocus();
                          }}
                          className="btn-ghost"
                          style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.14)', color: '#ffffff' }}
                        >
                          <Play size={10} style={{ marginRight: '3px' }} /> Resume
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.playTickSound();
                            pauseFocus();
                          }}
                          className="btn-ghost"
                          style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
                        >
                          <Pause size={10} style={{ marginRight: '3px' }} /> Pause
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.playMilestonePop();
                          extendFocus(5);
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                        title="Add 5 minutes"
                      >
                        +5m
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.playMilestonePop();
                          stopFocus(!!focusState.goalId);
                        }}
                        className="btn-ghost"
                        style={{ padding: '2px 6px', fontSize: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
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
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Music size={20} color="#ffffff" />
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
                    {mediaState.title}
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
                    {mediaState.artist} {mediaState.album ? `• ${mediaState.album}` : ''}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        previousTrack();
                      }}
                      className="btn-ghost"
                      style={{ padding: '2px 4px' }}
                      title="Previous Track"
                    >
                      <SkipBack size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPause();
                      }}
                      className="btn-ghost"
                      style={{ padding: '2px 8px', backgroundColor: 'rgba(255, 255, 255, 0.14)', color: '#ffffff' }}
                      title={mediaState.isPlaying ? 'Pause' : 'Play'}
                    >
                      {mediaState.isPlaying ? <Pause size={11} /> : <Play size={11} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextTrack();
                      }}
                      className="btn-ghost"
                      style={{ padding: '2px 4px' }}
                      title="Next Track"
                    >
                      <SkipForward size={11} />
                    </button>

                    {/* Quick Volume Steppers */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}>
                      <Volume2 size={10} color="rgba(255, 255, 255, 0.5)" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVolume(Math.max(0, (mediaState.volume ?? 50) - 10));
                        }}
                        className="btn-ghost"
                        style={{ padding: '1px 4px', fontSize: '9px' }}
                        title="Volume Down (-10%)"
                      >
                        -
                      </button>
                      <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.6)', fontVariantNumeric: 'tabular-nums' }}>
                        {mediaState.volume ?? 50}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVolume(Math.min(100, (mediaState.volume ?? 50) + 10));
                        }}
                        className="btn-ghost"
                        style={{ padding: '1px 4px', fontSize: '9px' }}
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
                gap: '8px',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{monthName}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {calendarDays.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '2px 4px',
                        borderRadius: '6px',
                        backgroundColor: c.isToday ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        color: c.isToday ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                      }}
                    >
                      <span style={{ fontSize: '8px', fontWeight: 500, textTransform: 'uppercase' }}>{c.dayName}</span>
                      <span style={{ fontSize: '10px', fontWeight: c.isToday ? 700 : 500 }}>{c.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>
                <Calendar size={11} />
                <span>{goals.length > 0 ? `${goals.length} active goals tracked` : 'Nothing for today'}</span>
              </div>
            </div>

            {/* Column 3: Overall Progress Ring & Quick Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>Overall</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{percent}%</span>
                <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.4)' }}>{stats?.activeGoals ?? 0} active</span>
              </div>

              <GoalProgressRing
                progressFraction={stats?.overallProgressFraction ?? 0}
                size={44}
                strokeWidth={3.5}
                color="#ffffff"
                showText={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

