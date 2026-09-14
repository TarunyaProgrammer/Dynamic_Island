// apps/renderer/src/components/TodayView.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Play, Check, MoreHorizontal, Plus, ChevronDown, Clock3,
  Calendar as CalendarIcon, RefreshCw, AlertCircle, Zap,
  SkipForward, Flame, Target, Timer, TrendingUp, Sun,
} from 'lucide-react';
import {
  CalendarContextEvent, ExternalReminder, Goal, GoalAction,
  ProgressEvent, SkipReason, TodayPlan,
} from '@shared/types';
import { QuickDatePicker } from './QuickDatePicker';
import { ApplePermissionModal } from './ApplePermissionModal';
import { deriveTodayActionGroups } from './today-action-groups';
import { recentProgressEvents } from './today-activity';
import { BeaconCompanion } from './BeaconCompanion';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TodayViewProps {
  plan: TodayPlan | null;
  actions: GoalAction[];
  goals: Goal[];
  history: ProgressEvent[];
  loading: boolean;
  error: string | null;
  onComplete: (id: string) => void;
  onSkip: (id: string, reason: SkipReason) => void;
  onMoveLater: (id: string) => void;
  onReschedule: (id: string, targetDate: string) => void;
  onFocus: (goalId: string, actionId: string, minutes: number) => void;
  onAddAction: () => void;
  onBringToToday: (id: string) => void;
  onRefresh: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const dateLabel = () =>
  new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Still up?';
  if (h < 12) return 'Good morning.';
  if (h < 18) return 'Good afternoon.';
  return 'Good evening.';
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const fmtDuration = (startIso: string, endIso: string) => {
  const mins = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const relativeTime = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  const mins = Math.round(diff / 60_000);
  if (mins < 0) return `${Math.abs(mins)}m ago`;
  if (mins === 0) return 'now';
  if (mins < 60) return `in ${mins}m`;
  return `in ${Math.floor(mins / 60)}h`;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const TodayView: React.FC<TodayViewProps> = (props) => {
  const {
    plan, actions, goals, history, loading, error,
    onComplete, onSkip, onMoveLater, onReschedule,
    onFocus, onAddAction, onBringToToday, onRefresh,
  } = props;

  const [optionsFor, setOptionsFor] = useState<GoalAction | null>(null);
  const [startFor, setStartFor] = useState<GoalAction | null>(null);
  const [laterOpen, setLaterOpen] = useState(false);

  // Calendar
  const [calendar, setCalendar] = useState<CalendarContextEvent[] | null>(null);
  const [reminders, setReminders] = useState<ExternalReminder[] | null>(null);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleError, setAppleError] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasGrantedApple, setHasGrantedApple] = useState(
    () => localStorage.getItem('beacon:apple-permission-granted') === 'true',
  );

  const { focus: todays, later, unplanned, completedFocusCount: moved, plannedFocusCount } =
    useMemo(() => deriveTodayActionGroups(actions, plan), [actions, plan]);

  const recentActivity = useMemo(() => recentProgressEvents(history), [history]);
  const totalGoals = goals.filter((g) => g.status === 'active').length;

  // Today's upcoming calendar events (next 8 hours)
  const upcomingToday = useMemo(() => {
    if (!calendar) return [];
    const now = Date.now();
    const cutoff = now + 8 * 60 * 60 * 1000;
    return calendar
      .filter((e) => new Date(e.end).getTime() > now && new Date(e.start).getTime() < cutoff)
      .slice(0, 4);
  }, [calendar]);

  // Auto-load calendar when permission already granted
  useEffect(() => {
    if (hasGrantedApple && !calendar && !appleLoading) {
      void loadCalendar();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGrantedApple]);

  const loadCalendar = async (): Promise<boolean> => {
    setAppleLoading(true);
    setAppleError(null);
    try {
      const [cal, rem] = await Promise.allSettled([
        window.beacon.apple.calendarToday(),
        window.beacon.apple.reminders(),
      ]);
      setCalendar(cal.status === 'fulfilled' ? cal.value : []);
      setReminders(rem.status === 'fulfilled' ? rem.value : []);
      if (cal.status === 'rejected') {
        setAppleError(cal.reason instanceof Error ? cal.reason.message : 'Calendar unavailable.');
        setHasGrantedApple(false);
        localStorage.removeItem('beacon:apple-permission-granted');
        return false;
      }
      return true;
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGrantPermission = async () => {
    setShowPermissionModal(false);
    if (await loadCalendar()) {
      setHasGrantedApple(true);
      localStorage.setItem('beacon:apple-permission-granted', 'true');
    }
  };

  if (loading) {
    return (
      <div style={shellStyle}>
        <div style={{ color: 'var(--text-muted)', padding: '48px 0', textAlign: 'center' }}>
          Preparing your day…
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header style={topBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <BeaconCompanion state="smiling" size="regular" interactive={false} label="companion" />
          <div>
            <div style={dateLabelStyle}>{dateLabel()}</div>
            <div style={greetingStyle}>{greeting()}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {error && (
            <button onClick={onRefresh} style={ghostPillStyle} title="Refresh">
              <RefreshCw size={12} /> Retry
            </button>
          )}
          <button onClick={onAddAction} style={primaryPillStyle}>
            <Plus size={13} /> Add action
          </button>
        </div>
      </header>

      {/* ── Bento Grid ──────────────────────────────────────────────────── */}
      <div style={gridStyle}>

        {/* ── Col 1: Actions (main) ──────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>

          {/* Momentum strip */}
          <MomentumStrip
            moved={moved}
            total={Math.max(plannedFocusCount, todays.length, 1)}
            activeGoals={totalGoals}
            activityCount={recentActivity.length}
          />

          {/* Today's commitments */}
          <div style={cardStyle}>
            <SectionHeader
              icon={<Target size={12} />}
              title="Today's Focus"
              badge={todays.length > 0 ? String(todays.length) : undefined}
              action={<button onClick={onAddAction} style={microBtn}><Plus size={11} /></button>}
            />
            {todays.length === 0 ? (
              <EmptyActions onAdd={onAddAction} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {todays.map((action, i) => (
                  <ActionRow
                    key={action.id}
                    index={i + 1}
                    action={action}
                    goal={goals.find((g) => g.id === action.goalId)}
                    onComplete={onComplete}
                    onStart={setStartFor}
                    onMore={setOptionsFor}
                  />
                ))}
              </div>
            )}

            {/* Later (collapsed) */}
            {later.length > 0 && (
              <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                <button
                  onClick={() => setLaterOpen((o) => !o)}
                  style={{ ...microBtn, color: 'var(--text-muted)', width: '100%', justifyContent: 'flex-start', gap: '5px' }}
                >
                  <ChevronDown size={12} style={{ transform: laterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                  Later today · {later.length}
                </button>
                {laterOpen && (
                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {later.map((action) => (
                      <LaterRow
                        key={action.id}
                        action={action}
                        goal={goals.find((g) => g.id === action.goalId)}
                        onStart={setStartFor}
                        onMore={setOptionsFor}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unplanned — compact horizontal chips */}
          {unplanned.length > 0 && (
            <div style={cardStyle}>
              <SectionHeader
                icon={<Zap size={12} />}
                title="All open actions"
                badge={String(unplanned.length)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {unplanned.slice(0, 5).map((action) => (
                  <UnplannedRow
                    key={action.id}
                    action={action}
                    goal={goals.find((g) => g.id === action.goalId)}
                    onBringToToday={onBringToToday}
                    onStart={setStartFor}
                  />
                ))}
                {unplanned.length > 5 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '4px 2px' }}>
                    +{unplanned.length - 5} more in Goals tab
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Col 2: Context panels ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>

          {/* Calendar panel */}
          <CalendarPanel
            events={upcomingToday}
            allEvents={calendar}
            loading={appleLoading}
            error={appleError}
            hasGranted={hasGrantedApple}
            onRequest={() => setShowPermissionModal(true)}
            onRefresh={loadCalendar}
          />

          {/* Reminders panel */}
          {hasGrantedApple && (
            <RemindersPanel
              reminders={reminders}
              goals={goals}
              loading={appleLoading}
            />
          )}

          {/* Recent activity */}
          {recentActivity.length > 0 && (
            <ActivityPanel events={recentActivity} goals={goals} />
          )}
        </div>
      </div>

      {/* Modals */}
      {showPermissionModal && (
        <ApplePermissionModal onAllow={handleGrantPermission} onClose={() => setShowPermissionModal(false)} />
      )}
      {startFor && (
        <StartSheet
          action={startFor}
          goal={goals.find((g) => g.id === startFor.goalId)}
          onClose={() => setStartFor(null)}
          onStart={(minutes) => { onFocus(startFor.goalId, startFor.id, minutes); setStartFor(null); }}
        />
      )}
      {optionsFor && (
        <OptionsSheet
          action={optionsFor}
          onClose={() => setOptionsFor(null)}
          onMoveLater={() => { onMoveLater(optionsFor.id); setOptionsFor(null); }}
          onReschedule={(d) => { onReschedule(optionsFor.id, d); setOptionsFor(null); }}
          onSkip={(r) => { onSkip(optionsFor.id, r); setOptionsFor(null); }}
        />
      )}
    </div>
  );
};

// ─── Layout Styles ────────────────────────────────────────────────────────────

const shellStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '20px 24px 32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  boxSizing: 'border-box',
};

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  paddingBottom: '4px',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 320px',
  gap: '10px',
  alignItems: 'start',
};

const cardStyle: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '12px',
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

// ─── Typography helpers ───────────────────────────────────────────────────────

const dateLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--text-muted)',
};
const greetingStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  letterSpacing: '-0.03em',
  color: 'var(--text-primary)',
  lineHeight: 1.2,
};

const ghostPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '5px 10px',
  borderRadius: '7px',
  border: '1px solid var(--border-subtle)',
  background: 'transparent',
  color: 'var(--text-secondary)',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
};

const primaryPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '6px 12px',
  borderRadius: '7px',
  border: 'none',
  background: 'rgba(217,119,6,0.15)',
  color: '#D97706',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};

const microBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '3px',
  padding: '3px 6px',
  borderRadius: '5px',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-muted)',
  fontSize: '11px',
  cursor: 'pointer',
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  badge?: string;
  action?: React.ReactNode;
}> = ({ icon, title, badge, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', flex: 1 }}>
      {title}
    </span>
    {badge && (
      <span style={{
        fontSize: '10px', fontWeight: 700,
        padding: '1px 6px', borderRadius: '999px',
        background: 'rgba(255,255,255,0.07)',
        color: 'var(--text-muted)',
      }}>
        {badge}
      </span>
    )}
    {action}
  </div>
);

// ─── Momentum Strip ───────────────────────────────────────────────────────────

const MomentumStrip: React.FC<{
  moved: number; total: number;
  activeGoals: number; activityCount: number;
}> = ({ moved, total, activeGoals, activityCount }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  }}>
    {[
      { label: 'Committed', value: `${moved} / ${total}`, icon: <Flame size={13} style={{ color: '#D97706' }} />, sub: 'actions today' },
      { label: 'Active goals', value: String(activeGoals), icon: <Target size={13} style={{ color: '#60a5fa' }} />, sub: 'in progress' },
      { label: 'Activity', value: String(activityCount), icon: <TrendingUp size={13} style={{ color: '#4ade80' }} />, sub: 'recent events' },
    ].map(({ label, value, icon, sub }) => (
      <div key={label} style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {icon} {label}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{sub}</div>
      </div>
    ))}
  </div>
);

// ─── Action Row ───────────────────────────────────────────────────────────────

const ActionRow: React.FC<{
  index: number;
  action: GoalAction;
  goal?: Goal;
  onComplete: (id: string) => void;
  onStart: (a: GoalAction) => void;
  onMore: (a: GoalAction) => void;
}> = ({ index, action, goal, onComplete, onStart, onMore }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '9px',
    background: index === 1 ? 'rgba(217,119,6,0.06)' : 'rgba(255,255,255,0.02)',
    border: `1px solid ${index === 1 ? 'rgba(217,119,6,0.18)' : 'rgba(255,255,255,0.05)'}`,
  }}>
    <span style={{
      flexShrink: 0,
      fontSize: '10px',
      fontWeight: 700,
      fontFamily: 'JetBrains Mono, monospace',
      color: index === 1 ? '#D97706' : 'var(--text-muted)',
      minWidth: '18px',
    }}>
      {String(index).padStart(2, '0')}
    </span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {action.title}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
        {goal?.name ?? 'Goal'}{action.estimatedMinutes ? ` · ${action.estimatedMinutes}m` : ''}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
      <button onClick={() => onMore(action)} style={microBtn} title="Options">
        <MoreHorizontal size={13} />
      </button>
      <button onClick={() => onStart(action)} style={{ ...microBtn, padding: '4px 8px', color: 'var(--text-secondary)' }} title="Start Focus">
        <Play size={12} fill="currentColor" />
      </button>
      <button
        onClick={() => onComplete(action.id)}
        style={{
          padding: '4px 10px', borderRadius: '6px', border: 'none',
          background: 'rgba(74,222,128,0.1)', color: '#4ade80',
          fontSize: '11px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        <Check size={11} /> Done
      </button>
    </div>
  </div>
);

// ─── Later Row ────────────────────────────────────────────────────────────────

const LaterRow: React.FC<{
  action: GoalAction; goal?: Goal;
  onStart: (a: GoalAction) => void; onMore: (a: GoalAction) => void;
}> = ({ action, goal, onStart, onMore }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '7px', background: 'rgba(255,255,255,0.02)' }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.title}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{goal?.name ?? 'Goal'}</div>
    </div>
    <button onClick={() => onStart(action)} style={microBtn}><Play size={11} /></button>
    <button onClick={() => onMore(action)} style={microBtn}><MoreHorizontal size={11} /></button>
  </div>
);

// ─── Unplanned Row ────────────────────────────────────────────────────────────

const UnplannedRow: React.FC<{
  action: GoalAction; goal?: Goal;
  onBringToToday: (id: string) => void; onStart: (a: GoalAction) => void;
}> = ({ action, goal, onBringToToday, onStart }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '7px', background: 'rgba(255,255,255,0.02)' }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.title}</div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{goal?.name ?? 'Goal'}</div>
    </div>
    <button onClick={() => onStart(action)} style={microBtn}><Play size={11} /></button>
    <button
      onClick={() => onBringToToday(action.id)}
      style={{ padding: '3px 8px', borderRadius: '5px', border: 'none', background: 'rgba(217,119,6,0.1)', color: '#D97706', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}
    >
      Today
    </button>
  </div>
);

// ─── Empty Actions ────────────────────────────────────────────────────────────

const EmptyActions: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div style={{ textAlign: 'center', padding: '16px 0' }}>
    <Clock3 size={18} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Clear day ahead</div>
    <div style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 10px' }}>Choose one next action to focus on.</div>
    <button onClick={onAdd} style={{ ...primaryPillStyle, fontSize: '11px' }}>
      <Plus size={11} /> Add action
    </button>
  </div>
);

// ─── Calendar Panel ───────────────────────────────────────────────────────────

const CalendarPanel: React.FC<{
  events: CalendarContextEvent[];
  allEvents: CalendarContextEvent[] | null;
  loading: boolean;
  error: string | null;
  hasGranted: boolean;
  onRequest: () => void;
  onRefresh: () => void;
}> = ({ events, allEvents, loading, error, hasGranted, onRequest, onRefresh }) => (
  <div style={cardStyle}>
    <SectionHeader
      icon={<CalendarIcon size={12} />}
      title="Today's Calendar"
      badge={allEvents ? String(allEvents.length) : undefined}
      action={
        hasGranted ? (
          <button onClick={onRefresh} disabled={loading} style={microBtn} title="Refresh">
            <RefreshCw size={10} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        ) : undefined
      }
    />

    {!hasGranted ? (
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {error ?? 'See today\'s events alongside your actions'}
        </div>
        <button onClick={onRequest} style={primaryPillStyle}>
          <CalendarIcon size={11} /> {error ? 'Grant Calendar Access' : 'Connect Calendar'}
        </button>
      </div>
    ) : loading && !allEvents ? (
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '8px 0' }}>Loading events…</div>
    ) : error ? (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '8px',
        padding: '10px', borderRadius: '8px',
        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
        fontSize: '11px', color: '#fca5a5', lineHeight: 1.5,
      }}>
        <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>Calendar unavailable</div>
          <div>{error}</div>
          <button onClick={onRefresh} style={{ ...microBtn, color: '#fca5a5', padding: '4px 0', marginTop: '6px' }}>
            <RefreshCw size={10} /> Try again
          </button>
        </div>
      </div>
    ) : events.length === 0 ? (
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '4px 0' }}>
        {allEvents?.length === 0 ? '✅ No events today — full focus day' : 'No upcoming events in the next 8 hours'}
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {events.map((event) => {
          const isNow = new Date(event.start) <= new Date() && new Date(event.end) >= new Date();
          const isStartingSoon = !isNow && new Date(event.start).getTime() - Date.now() < 15 * 60_000;
          return (
            <div key={event.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: isNow ? 'rgba(217,119,6,0.08)' : isStartingSoon ? 'rgba(96,165,250,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isNow ? 'rgba(217,119,6,0.2)' : isStartingSoon ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.04)'}`,
            }}>
              <div style={{ width: '3px', height: '36px', borderRadius: '2px', background: isNow ? '#D97706' : '#FF6B6B', flexShrink: 0, marginTop: '1px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {event.title}
                  {isNow && <span style={{ marginLeft: '6px', fontSize: '9px', background: 'rgba(217,119,6,0.2)', color: '#D97706', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>NOW</span>}
                  {isStartingSoon && <span style={{ marginLeft: '6px', fontSize: '9px', background: 'rgba(96,165,250,0.15)', color: '#60a5fa', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>SOON</span>}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {fmtTime(event.start)} – {fmtTime(event.end)} · {fmtDuration(event.start, event.end)} · {event.calendar}
                </div>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>
                {relativeTime(isNow ? event.end : event.start)}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ─── Reminders Panel ──────────────────────────────────────────────────────────

const RemindersPanel: React.FC<{
  reminders: ExternalReminder[] | null;
  goals: Goal[];
  loading: boolean;
}> = ({ reminders, goals, loading }) => {
  if (loading && !reminders) return null;
  if (!reminders || reminders.length === 0) return null;

  return (
    <div style={cardStyle}>
      <SectionHeader icon={<Sun size={12} />} title="Reminders" badge={String(reminders.length)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {reminders.slice(0, 5).map((reminder) => (
          <div key={reminder.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '7px', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{reminder.title}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{reminder.list}</div>
            </div>
            <select
              className="input"
              defaultValue=""
              style={{ fontSize: '10px', padding: '3px 6px', maxWidth: '110px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
              onChange={async (e) => {
                if (e.target.value) {
                  await window.beacon.apple.importReminder(e.target.value, reminder);
                  (e.currentTarget as HTMLSelectElement).disabled = true;
                }
              }}
            >
              <option value="" disabled>→ goal…</option>
              {goals.filter((g) => g.status === 'active').map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        ))}
        {reminders.length > 5 && (
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '2px 8px' }}>+{reminders.length - 5} more</div>
        )}
      </div>
    </div>
  );
};

// ─── Activity Panel ───────────────────────────────────────────────────────────

const ActivityPanel: React.FC<{ events: ProgressEvent[]; goals: Goal[] }> = ({ events, goals }) => {
  const goalNames = useMemo(() => new Map(goals.map((g) => [g.id, g.name])), [goals]);

  return (
    <div style={cardStyle}>
      <SectionHeader icon={<Timer size={12} />} title="Recent Activity" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {events.slice(0, 5).map((event) => (
          <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              padding: '2px 5px', borderRadius: '4px',
              background: event.delta > 0 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
              color: event.delta > 0 ? '#4ade80' : '#f87171',
              minWidth: '28px', textAlign: 'center', flexShrink: 0,
            }}>
              {event.delta > 0 ? `+${event.delta}` : event.delta}
            </span>
            <span style={{ flex: 1, fontSize: '12px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
              {goalNames.get(event.goalId) ?? 'Past goal'}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
              {new Date(event.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── StartSheet ───────────────────────────────────────────────────────────────

const actionLabelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px',
};

const StartSheet: React.FC<{ action: GoalAction; goal?: Goal; onClose: () => void; onStart: (minutes: number) => void }> = ({ action, goal, onClose, onStart }) => (
  <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Start focus">
    <div className="modal-content" style={{ width: 360 }}>
      <div style={actionLabelStyle}>Focus on</div>
      <h2 style={{ margin: '0 0 4px', fontSize: '18px' }}>{action.title}</h2>
      <p style={{ margin: '0 0 18px', color: 'var(--text-secondary)', fontSize: '13px' }}>{goal?.name ?? 'Goal'}</p>
      <div style={{ display: 'grid', gap: '8px' }}>
        <button className="btn-primary" onClick={() => onStart(25)}><Play size={14} fill="currentColor" /> Start · 25 min</button>
        <button className="btn-ghost" onClick={() => onStart(50)}>Start · 50 min</button>
      </div>
      <button className="btn-ghost" onClick={onClose} style={{ marginTop: '12px', width: '100%' }}>Not now</button>
    </div>
  </div>
);

// ─── OptionsSheet ─────────────────────────────────────────────────────────────

const OptionsSheet: React.FC<{
  action: GoalAction;
  onClose: () => void;
  onMoveLater: () => void;
  onReschedule: (date: string) => void;
  onSkip: (reason: SkipReason) => void;
}> = ({ action, onClose, onMoveLater, onReschedule, onSkip }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [date, setDate] = useState(tomorrow.toISOString().slice(0, 10));

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Action options">
      <div className="modal-content" style={{ width: 400 }}>
        <h2 style={{ marginTop: 0, fontSize: '17px' }}>{action.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>What happened?</p>
        <div style={{ display: 'grid', gap: '12px' }}>
          <button className="btn-ghost" onClick={onMoveLater} style={{ justifyContent: 'flex-start' }}>Keep for later today</button>
          <div style={{ display: 'grid', gap: '8px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reschedule</span>
            <QuickDatePicker value={date} onChange={setDate} />
            <button className="btn-primary" disabled={!date} onClick={() => onReschedule(date)} style={{ justifySelf: 'start', padding: '6px 14px', fontSize: '12px' }}>
              Reschedule to {date}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(['rest', 'travel', 'sick', 'vacation', 'custom'] as SkipReason[]).map((reason) => (
              <button key={reason} className="btn-ghost" onClick={() => onSkip(reason)} style={{ fontSize: '11px', padding: '4px 9px' }}>
                <SkipForward size={10} /> {reason === 'custom' ? 'Skip today' : reason[0].toUpperCase() + reason.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-ghost" onClick={onClose} style={{ marginTop: '16px', width: '100%' }}>Keep it planned</button>
      </div>
    </div>
  );
};
