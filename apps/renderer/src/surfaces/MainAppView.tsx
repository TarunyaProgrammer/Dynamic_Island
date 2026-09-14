// apps/renderer/src/surfaces/MainAppView.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Plus, Undo2, Redo2, Layers, CheckCircle2, Archive, Timer, Search, X, Sparkles, MessageSquare, Database, Settings as SettingsIcon, CalendarDays } from 'lucide-react';
import { FocusDashboardView } from '../components/FocusDashboardView';
import { useCompanion } from '../hooks/useCompanion';
import { SolarHorizonGraph } from '../components/SolarHorizonGraph';
import { MomentumRhythmBar } from '../components/MomentumRhythmBar';
import { AISettingsModal } from '../components/AISettingsModal';
import { BeaconCompanionChatModal } from '../components/BeaconCompanionChatModal';
import { TodayView } from '../components/TodayView';
import { ActionEditorModal } from '../components/ActionEditorModal';
import { useToday } from '../hooks/useToday';
import { useSettings } from '../hooks/useSettings';
import { OnboardingModal } from '../components/OnboardingModal';
import { ReminderPolicyModal } from '../components/ReminderPolicyModal';
import { DataTrustModal } from '../components/DataTrustModal';
import { WeeklyReviewView } from '../components/WeeklyReviewView';
import { SettingsView } from '../components/SettingsView';

export const MainAppView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'today' | 'goals' | 'focus' | 'review' | 'calendar' | 'settings' | 'help'>('today');
  const [focusGoalId, setFocusGoalId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<GoalStatus | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAISettings, setShowAISettings] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [activeMenuGoalId, setActiveMenuGoalId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [isActionEditorOpen, setIsActionEditorOpen] = useState(false);
  const [actionEditorGoalId, setActionEditorGoalId] = useState<string | undefined>(undefined);
  const [reminderGoal, setReminderGoal] = useState<Goal | null>(null);
  const [showDataTrust, setShowDataTrust] = useState(false);

  // Listen for hash change (#focus)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#focus') {
        setViewMode('focus');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => window.beacon.onNavigate(setViewMode), []);

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
  const today = useToday();
  const { settings, updateSettings } = useSettings();

  const finishOnboarding = async (commitments: string[], nextAction: string, cadence: 'daily' | 'weekly', reminderTime?: string) => {
    const created: Goal[] = [];
    for (const name of commitments) {
      created.push(await createGoal({ name, paradigm: 'habit', period: cadence, targetValue: 1, defaultIncrement: 1, area: 'Personal' }));
    }
    if (created[0] && nextAction) {
      const action = await today.createAction({ goalId: created[0].id, title: nextAction });
      await today.planAction(action.id);
    }
    if (reminderTime) {
      await Promise.all(created.map((goal) => window.beacon.reminders.savePolicy({ goalId: goal.id, enabled: true, time: reminderTime, weekdays: [], onlyWhenIncomplete: true })));
    }
    await updateSettings({ onboardingCompleted: true });
  };

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
          setViewMode('today');
        } else if (e.key === '2') {
          e.preventDefault();
          setViewMode('goals');
        } else if (e.key === '3') {
          e.preventDefault();
          setViewMode('focus');
        } else if (e.key === '4') {
          e.preventDefault();
          setViewMode('review');
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

  const handleMenuToggle = useCallback((goalId: string, isOpen: boolean) => {
    setActiveMenuGoalId((current) => {
      if (isOpen) return goalId;
      return current === goalId ? null : current;
    });
  }, []);

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
    triggerLightPulse('var(--accent-solar)');
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
    triggerLightPulse();
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
      {/* Titlebar: Left & Right interactive clusters with central drag handle */}
      <div
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
        {/* Brand & View Switcher (Left Cluster: 100% Clickable) */}
        <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BeaconLogo size={18} />
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>Beacon</span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '3px',
              backgroundColor: 'var(--bg-glass-active)',
              padding: '2px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setViewMode('today'); }}
              style={{ padding: '3px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 600, backgroundColor: viewMode === 'today' ? 'var(--btn-primary-bg)' : 'transparent', color: viewMode === 'today' ? 'var(--btn-primary-text)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
            >Today</button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('goals');
              }}
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('focus');
              }}
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
              <span>Focus</span>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setViewMode('review'); }}
              style={{ padding: '3px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 600, backgroundColor: viewMode === 'review' ? 'var(--btn-primary-bg)' : 'transparent', color: viewMode === 'review' ? 'var(--btn-primary-text)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.15s ease' }}
              title="Weekly review"
            >Review</button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setViewMode('calendar'); }}
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: viewMode === 'calendar' ? 'var(--btn-primary-bg)' : 'transparent',
                color: viewMode === 'calendar' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
              title="Calendar (⌘4)"
            >
              <CalendarDays size={11} />
              <span>Calendar</span>
            </button>
          </div>
        </div>

        {/* Window Drag Handle: Dedicated central region */}
        <div
          className="drag-region"
          style={{
            flex: 1,
            height: '100%',
            minWidth: '40px',
            cursor: 'default',
          }}
          title="Drag window"
        />

        {/* Action Controls (Right Cluster: 100% Clickable) */}
        <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); setShowDataTrust(true); }} className="btn-ghost" title="Backups and exports" style={{ padding: '5px 7px' }}><Database size={14} /></button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setViewMode(viewMode === 'settings' ? 'today' : 'settings'); }}
            className="btn-ghost"
            title="Settings (⌘,)"
            style={{
              padding: '5px 7px',
              color: viewMode === 'settings' ? 'var(--accent-primary)' : undefined,
              background: viewMode === 'settings' ? 'rgba(217,119,6,0.1)' : undefined,
              borderRadius: '6px',
            }}
          >
            <SettingsIcon size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              undo();
            }}
            className="btn-ghost"
            title="Undo (⌘Z)"
            style={{ cursor: 'pointer' }}
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              redo();
            }}
            className="btn-ghost"
            title="Redo (⌘⇧Z)"
            style={{ cursor: 'pointer' }}
          >
            <Redo2 size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCreate();
            }}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}
            title="New Goal (⌘N)"
          >
            <Plus size={14} />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Goals View OR Focus Mode */}
      {viewMode === 'focus' ? (
        <FocusDashboardView
          goals={goals}
          initialGoalId={focusGoalId}
          onOpenCreateGoal={handleOpenCreate}
        />
      ) : viewMode === 'review' ? (
        <WeeklyReviewView onPlanAction={() => { setViewMode('today'); setIsActionEditorOpen(true); }} />
      ) : viewMode === 'settings' ? (
        <SettingsView />
      ) : viewMode === 'calendar' ? (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 24px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>Calendar</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Your Schedule</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Full calendar view coming soon — see today's events in the Today tab.
          </div>
        </div>
      ) : viewMode === 'today' ? (
        <TodayView
          plan={today.plan}
          actions={today.actions}
          goals={goals}
          history={history}
          loading={today.loading}
          error={today.error}
          onComplete={(id) => { void today.complete(id); }}
                onSkip={(id, reason) => { void today.skip(id, reason); }}
                onMoveLater={(id) => { void today.move(id, 'later'); }}
          onReschedule={(id, targetDate) => { void today.reschedule(id, targetDate); }}
                onFocus={(goalId, actionId, minutes) => { void window.beacon.focus.start(minutes, goalId, actionId); setFocusGoalId(goalId); setViewMode('focus'); }}
          onAddAction={() => setIsActionEditorOpen(true)}
          onBringToToday={(id) => { void today.planAction(id); }}
          onRefresh={() => { void today.refresh(); }}
        />
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
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 0 6px rgba(255, 255, 255, 0.15)',
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
                    color: 'var(--text-secondary)',
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
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      Momentum {stats.momentumScore ?? 84} {stats.momentumDeltaPercent > 0 ? `↑ +${stats.momentumDeltaPercent}%` : `↓ ${stats.momentumDeltaPercent}%`} vs last month
                    </span>
                  </>
                )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
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
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
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
                    backgroundColor: '#ffffff',
                    borderRadius: '2px',
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
                  boxShadow: 'none',
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
              filteredGoals.map((g) => {
                const isMenuActive = activeMenuGoalId === g.id;
                return (
                  <div
                    key={g.id}
                    className="card-spring-enter"
                    style={{
                      position: 'relative',
                      zIndex: isMenuActive ? 100 : 1,
                    }}
                  >
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
                      onOpenFocusMode={(goalId) => {
                        setFocusGoalId(goalId);
                        setViewMode('focus');
                      }}
                      onConfigureReminder={setReminderGoal}
                      onPlanAction={(goalId) => {
                        setActionEditorGoalId(goalId);
                        setIsActionEditorOpen(true);
                      }}
                      onMenuToggle={(isOpen) => {
                        handleMenuToggle(g.id, isOpen);
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar: Stats & Activity Stream */}
        <div
          style={{
            width: '280px',
            minWidth: '280px',
            flexShrink: 0,
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
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
                ✦ 2h 30m · 62%
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GoalProgressRing progressFraction={0.62} size={42} strokeWidth={3.8} color="#ffffff" />
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
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.02em' }}>
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
      {isActionEditorOpen && (
        <ActionEditorModal
          goals={goals.filter((goal) => goal.status === 'active')}
          initialGoalId={actionEditorGoalId}
          onClose={() => {
            setIsActionEditorOpen(false);
            setActionEditorGoalId(undefined);
          }}
          onSave={async (input) => {
            const action = await today.createAction(input);
            await today.planAction(action.id);
          }}
        />
      )}
      <OnboardingModal isOpen={settings?.onboardingCompleted === false} onFinish={finishOnboarding} />
      <ReminderPolicyModal goal={reminderGoal} onClose={() => setReminderGoal(null)} />
      <DataTrustModal isOpen={showDataTrust} onClose={() => setShowDataTrust(false)} />

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
