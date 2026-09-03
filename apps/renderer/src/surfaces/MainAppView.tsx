// apps/renderer/src/surfaces/MainAppView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useGoals } from '../hooks/useGoals';
import { Goal, GoalDraft, GoalStatus, GoalUpdateDraft } from '@shared/types';
import { GoalCard } from '../components/GoalCard';
import { GoalEditorModal } from '../components/GoalEditorModal';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { GoalProgressRing } from '../components/GoalProgressRing';
import { BeaconCompanion } from '../components/BeaconCompanion';
import { BeaconLogo } from '../components/BeaconLogo';
import { ConfettiCanvas } from '../components/ConfettiCanvas';
import { triggerLightPulse } from '../components/LightBeamFeedback';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { soundEffects } from '../utils/audio';
import { Plus, Undo2, Redo2, Layers, CheckCircle2, Archive, Timer, Search, X, Sun, Moon, Sparkles, MessageSquare } from 'lucide-react';
import { FocusDashboardView } from '../components/FocusDashboardView';
import { useCompanion } from '../hooks/useCompanion';
import { SolarHorizonGraph } from '../components/SolarHorizonGraph';
import { MomentumRhythmBar } from '../components/MomentumRhythmBar';
import { AISettingsModal } from '../components/AISettingsModal';
import { BeaconCompanionChatModal } from '../components/BeaconCompanionChatModal';
import atmosphericBg from '../assets/atmospheric_bg.jpg';

export const MainAppView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'goals' | 'focus'>('goals');
  const [activeTab, setActiveTab] = useState<GoalStatus | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAISettings, setShowAISettings] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('beacon_theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('beacon_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    goals,
    stats,
    history,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    archiveGoal,
    incrementProgress,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    undo,
    redo,
  } = useGoals(activeTab === 'all' ? undefined : activeTab);
  const companion = useCompanion('main');

  // Keyboard navigation & desktop global shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      const isInputFocused =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement;

      // Escape key clears search if active
      if (e.key === 'Escape' && searchQuery && !isEditorOpen && !goalToDelete) {
        setSearchQuery('');
        searchInputRef.current?.blur();
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleOpenCreate();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        } else if (e.key === '1') {
          e.preventDefault();
          setViewMode('goals');
        } else if (e.key === '2') {
          e.preventDefault();
          setViewMode('focus');
        } else if (e.key === 'z' && !e.shiftKey && !isInputFocused) {
          e.preventDefault();
          undo();
        } else if (e.key === 'z' && e.shiftKey && !isInputFocused) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, isEditorOpen, goalToDelete, undo, redo]);

  const filteredGoals = goals.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || (g.area && g.area.toLowerCase().includes(q));
  });

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsEditorOpen(true);
  };

  const handleSaveGoal = async (payload: GoalDraft | GoalUpdateDraft) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, payload);
    } else {
      const createdGoal = await createGoal(payload as GoalDraft);
      companion.celebrate(`Created ${createdGoal.name}`);
      soundEffects.playGoalFanfare();
      triggerLightPulse();
    }
  };

  const handleIncrement = async (goalId: string, delta?: number) => {
    await incrementProgress(goalId, delta);
    companion.celebrate('Progress logged');
    soundEffects.playMilestonePop();
    triggerLightPulse();
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    await toggleMilestone(goalId, milestoneId);
    companion.celebrate('Milestone updated');
    soundEffects.playMilestonePop();
    triggerLightPulse();
  };

  const handleCompleteGoal = async (goalId: string) => {
    const completedGoal = await completeGoal(goalId);
    companion.celebrate(`${completedGoal.name} completed`);
    soundEffects.playGoalFanfare();
    triggerLightPulse('var(--accent-emerald, #10b981)');
  };

  const handleUpdateStreak = async (goalId: string, currentStreak: number, bestStreak: number) => {
    soundEffects.playTickSound();
    await updateGoal(goalId, {
      streakConfig: {
        enabled: true,
        currentStreak,
        bestStreak: Math.max(currentStreak, bestStreak),
      },
    });
    companion.celebrate('Streak updated');
    triggerLightPulse('var(--accent-cyan)');
  };

  const handlePromptDelete = (goalId: string) => {
    const target = goals.find((g) => g.id === goalId);
    if (target) {
      setGoalToDelete(target);
    }
  };

  const handleConfirmDelete = async () => {
    if (goalToDelete) {
      soundEffects.playTickSound();
      await deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <ConfettiCanvas />
      {/* Conditional Atmospheric Background */}
      {theme === 'dark' ? (
        <>
          {/* Bespoke Dark Atmospheric Photo Wallpaper */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${atmosphericBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              opacity: 0.22,
              filter: 'blur(2px)',
              maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.3) 70%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 0.3) 70%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          {/* Cinematic Vignette to Deep Obsidian Black */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 10%, rgba(7, 8, 11, 0.3) 0%, rgba(7, 8, 11, 0.85) 65%, #07080b 100%)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </>
      ) : (
        /* Crystalline Apple HIG Light Mode Background */
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 122, 0, 0.04) 0%, rgba(244, 245, 248, 0.6) 45%, #f4f5f8 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      {/* Titlebar / Drag Region */}
      <div
        className="drag-region"
        style={{
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px 0 84px', // Offset for macOS traffic light buttons
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Brand & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BeaconLogo size={18} />
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>Beacon</span>
          </div>

          <div className="no-drag" style={{ display: 'flex', gap: '3px', backgroundColor: 'var(--bg-glass-active)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('goals')}
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: viewMode === 'goals' ? 'var(--btn-primary-bg)' : 'transparent',
                color: viewMode === 'goals' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
              title="Goals View (⌘1)"
            >
              <Layers size={11} />
              <span>Goals</span>
            </button>

            <button
              onClick={() => setViewMode('focus')}
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: viewMode === 'focus' ? 'var(--btn-primary-bg)' : 'transparent',
                color: viewMode === 'focus' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
              title="Focus Mode (⌘2)"
            >
              <Timer size={11} />
              <span>Focus Mode</span>
            </button>
          </div>
        </div>

        <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowAISettings(true)}
            className="btn-ghost"
            title="AI Companion Intelligence Settings"
            style={{
              padding: '5px 9px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--accent-solar, #ff7a00)',
              backgroundColor: 'rgba(255, 122, 0, 0.08)',
              border: '1px solid rgba(255, 122, 0, 0.22)',
            }}
          >
            <Sparkles size={12} color="var(--accent-solar, #ff7a00)" />
            <span>AI Brain</span>
          </button>
          <button
            onClick={toggleTheme}
            className="btn-ghost"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={() => undo()} className="btn-ghost" title="Undo (⌘Z)">
            <Undo2 size={14} />
          </button>
          <button onClick={() => redo()} className="btn-ghost" title="Redo (⌘⇧Z)">
            <Redo2 size={14} />
          </button>
          <button onClick={handleOpenCreate} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} title="New Goal (⌘N)">
            <Plus size={14} />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Goals View OR Focus Mode */}
      {viewMode === 'focus' ? (
        <FocusDashboardView goals={goals} onOpenCreateGoal={handleOpenCreate} />
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {/* Goals Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '16px 20px',
            gap: '14px',
          }}
        >
          {/* Personal State Greeting: Calm, Informative Life State */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              backgroundColor: 'var(--bg-glass)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                onClick={() => setShowAIChat(true)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Tap spirit to talk with AI & see suggested commands"
              >
                <BeaconCompanion
                  state={companion.state}
                  size="regular"
                  label={companion.message}
                  onClick={() => setShowAIChat(true)}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    backgroundColor: 'var(--accent-solar, #ff7a00)',
                    color: '#07080b',
                    borderRadius: '9999px',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(255, 122, 0, 0.4)',
                  }}
                  title="Click spirit to chat with AI"
                >
                  <Sparkles size={11} strokeWidth={2.5} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                  {new Date().getHours() < 12 ? 'Good morning.' : new Date().getHours() < 18 ? 'Good afternoon.' : 'Good evening.'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  You've kept {stats?.commitmentsKept?.completed ?? 0} of {stats?.commitmentsKept?.total ?? Math.max(1, goals.length)} commitments this week.
                </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>{Math.round((stats?.overallProgressFraction ?? 0) * 100)}% completed today</span>
                <span>•</span>
                <span>Consistency {stats?.consistencyPercentage ?? 92}%</span>
                <span>•</span>
                <span
                  onClick={() => setShowAIChat(true)}
                  style={{
                    color: 'var(--accent-solar, #ff7a00)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  ✦ Tap spirit to talk
                </span>
                {stats?.momentumDeltaPercent !== undefined && stats.momentumDeltaPercent !== 0 && (
                  <>
                    <span>•</span>
                    <span style={{ color: stats.momentumDeltaPercent > 0 ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 500 }}>
                      Momentum {stats.momentumScore ?? 84} {stats.momentumDeltaPercent > 0 ? `↑ +${stats.momentumDeltaPercent}%` : `↓ ${stats.momentumDeltaPercent}%`} vs last month
                    </span>
                  </>
                )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setShowAIChat(true)}
                className="btn-ghost"
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--accent-solar, #ff7a00)',
                  backgroundColor: 'rgba(255, 122, 0, 0.1)',
                  border: '1px solid rgba(255, 122, 0, 0.25)',
                  cursor: 'pointer',
                }}
                title="Talk to Beacon Companion"
              >
                <MessageSquare size={12} />
                <span>Talk to Spirit</span>
              </button>

              <div style={{ width: '80px', height: '4px', backgroundColor: 'var(--accent-neutral)', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.round((stats?.overallProgressFraction ?? 0) * 100))}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-beacon)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', minWidth: '32px', textAlign: 'right' }}>
                {Math.round((stats?.overallProgressFraction ?? 0) * 100)}%
              </span>
            </div>
          </div>
          {/* Tabs & Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--tab-container-bg, rgba(255, 255, 255, 0.04))', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setActiveTab('active')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'active' ? 'var(--tab-active-bg, #ffffff)' : 'transparent',
                  color: activeTab === 'active' ? 'var(--tab-active-text, #000000)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'active' ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Layers size={12} />
                <span>Active</span>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'completed' ? 'var(--tab-active-bg, #ffffff)' : 'transparent',
                  color: activeTab === 'completed' ? 'var(--tab-active-text, #000000)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'completed' ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckCircle2 size={12} />
                <span>Completed</span>
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'archived' ? 'var(--tab-active-bg, #ffffff)' : 'transparent',
                  color: activeTab === 'archived' ? 'var(--tab-active-text, #000000)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'archived' ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Archive size={12} />
                <span>Archived</span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'all' ? 'var(--tab-active-bg, #ffffff)' : 'transparent',
                  color: activeTab === 'all' ? 'var(--tab-active-text, #000000)' : 'var(--text-secondary)',
                  boxShadow: activeTab === 'all' ? 'var(--shadow-sm)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                All
              </button>
            </div>

            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search goals... (⌘F)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 28px 6px 30px',
                  backgroundColor: 'var(--search-bg, var(--bg-surface))',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                  boxShadow: theme === 'light' ? 'var(--shadow-sm)' : 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Goal Cards Grid */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                Loading goals...
              </div>
            ) : filteredGoals.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: '12px',
                  color: 'var(--text-muted)',
                }}
              >
                <Layers size={36} strokeWidth={1.2} opacity={0.3} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {searchQuery ? 'No matching goals found' : 'No goals found'}
                  </p>
                  <p style={{ fontSize: '12px', marginTop: '2px' }}>
                    {searchQuery ? 'Press Escape to clear filter' : 'Create a goal to start tracking progress'}
                  </p>
                </div>
                {!searchQuery && (
                  <button onClick={handleOpenCreate} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                    <Plus size={14} />
                    <span>Create First Goal</span>
                  </button>
                )}
              </div>
            ) : (
              filteredGoals.map((g) => (
                <div key={g.id} className="card-spring-enter">
                  <GoalCard
                    goal={g}
                    onIncrement={handleIncrement}
                    onToggleMilestone={handleToggleMilestone}
                    onAddMilestone={addMilestone}
                    onDeleteMilestone={deleteMilestone}
                    onComplete={handleCompleteGoal}
                    onArchive={archiveGoal}
                    onDelete={handlePromptDelete}
                    onEdit={handleOpenEdit}
                    onUpdateStreak={handleUpdateStreak}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Stats & Activity Stream */}
        <div
          style={{
            width: '280px',
            borderLeft: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-sidebar, rgba(7, 8, 11, 0.72))',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            display: 'flex',
            flexDirection: 'column',
            padding: '16px',
            gap: '12px',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Card 1: Today's Focus & Solar Horizon */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-sidebar-card, rgba(255, 255, 255, 0.025))',
              borderRadius: 'var(--radius-lg)',
              borderTop: '1px solid var(--bg-card-border-top, var(--border-subtle))',
              borderBottom: '1px solid var(--border-subtle)',
              borderLeft: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Today's Focus
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-solar, #ff7a00)', letterSpacing: '0.02em' }}>
                ✦ 2h 30m · 62%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GoalProgressRing progressFraction={0.62} size={42} strokeWidth={3.8} color="var(--accent-solar, #ff7a00)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 500 }}>Deep Work Sprint</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>2h 30m</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Target 4h · 3 sessions</span>
              </div>
            </div>

            {/* Minimalist Solar Horizon Curve */}
            <SolarHorizonGraph focusMinutesToday={150} targetMinutes={240} height={48} />
          </div>

          {/* Card 2: Weekly Rhythm (Momentum) */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-sidebar-card, rgba(255, 255, 255, 0.025))',
              borderRadius: 'var(--radius-lg)',
              borderTop: '1px solid var(--bg-card-border-top, var(--border-subtle))',
              borderBottom: '1px solid var(--border-subtle)',
              borderLeft: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Weekly Rhythm
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-solar, #ff7a00)', letterSpacing: '0.02em' }}>
                +14% Pace
              </span>
            </div>

            <MomentumRhythmBar hideHeader={true} />
          </div>

          {/* Card 3: Recent Activity Stream */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--bg-sidebar-card, rgba(255, 255, 255, 0.025))',
              borderRadius: 'var(--radius-lg)',
              borderTop: '1px solid var(--bg-card-border-top, var(--border-subtle))',
              borderBottom: '1px solid var(--border-subtle)',
              borderLeft: '1px solid var(--border-subtle)',
              borderRight: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Recent Activity
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {history.length} logged
              </span>
            </div>

            <ActivityTimeline events={history} goals={goals} />
          </div>

          {/* Card 4: Daily Anchor */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-sidebar-card, rgba(255, 255, 255, 0.018))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Focus Anchor
            </span>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '2px 0 0 0', lineHeight: 1.4 }}>
              "Discipline today, freedom tomorrow."
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Goal Creation / Edit Modal */}
      <GoalEditorModal
        goal={editingGoal}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveGoal}
      />

      {/* Destructive Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!goalToDelete}
        title="Delete Goal?"
        message={goalToDelete ? `Are you sure you want to permanently delete "${goalToDelete.name}"? This action cannot be undone.` : ''}
        confirmLabel="Delete Goal"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setGoalToDelete(null)}
      />

      {/* AI Intelligence & Provider Settings Modal */}
      <AISettingsModal
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
      />

      {/* Beacon Companion Spirit AI Chat & Action Modal */}
      <BeaconCompanionChatModal
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        onOpenSettings={() => setShowAISettings(true)}
      />
    </div>
  );
};
