import React, { useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronDown, Clock3, MoreHorizontal, Play, Plus, RefreshCw, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarContextEvent, ExternalReminder, Goal, GoalAction, ProgressEvent, SkipReason, TodayPlan } from '@shared/types';
import { QuickDatePicker } from './QuickDatePicker';
import { ApplePermissionModal } from './ApplePermissionModal';
import { BeaconCompanion } from './BeaconCompanion';
import { deriveTodayActionGroups } from './today-action-groups';
import { hasProgressToday, recentProgressEvents } from './today-activity';

interface TodayViewProps {
  plan: TodayPlan | null; actions: GoalAction[]; goals: Goal[]; history: ProgressEvent[]; loading: boolean; error: string | null;
  onComplete: (id: string) => void; onSkip: (id: string, reason: SkipReason) => void;
  onMoveLater: (id: string) => void; onReschedule: (id: string, targetDate: string) => void;
  onFocus: (goalId: string, actionId: string, minutes: number) => void; onAddAction: () => void;
  onBringToToday: (id: string) => void; onRefresh: () => void;
}

const dateLabel = () => new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
const greeting = () => new Date().getHours() < 12 ? 'Good morning.' : new Date().getHours() < 18 ? 'Good afternoon.' : 'Good evening.';

export const TodayView: React.FC<TodayViewProps> = (props) => {
  const { plan, actions, goals, history, loading, error, onComplete, onSkip, onMoveLater, onReschedule, onFocus, onAddAction, onBringToToday, onRefresh } = props;
  const [laterOpen, setLaterOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasGrantedApple, setHasGrantedApple] = useState(() => localStorage.getItem('beacon:apple-permission-granted') === 'true');
  const [calendar, setCalendar] = useState<CalendarContextEvent[] | null>(null);
  const [reminders, setReminders] = useState<ExternalReminder[] | null>(null);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleError, setAppleError] = useState<string | null>(null);
  const [optionsFor, setOptionsFor] = useState<GoalAction | null>(null);
  const [startFor, setStartFor] = useState<GoalAction | null>(null);
  const { focus: todays, later, unplanned, completedFocusCount: moved, plannedFocusCount } = useMemo(
    () => deriveTodayActionGroups(actions, plan),
    [actions, plan],
  );
  const hasOpenActions = todays.length + later.length + unplanned.length > 0;
  const recentActivity = useMemo(() => recentProgressEvents(history), [history]);
  const hasTodayContent = hasOpenActions || Boolean(plan?.entries.length) || hasProgressToday(history);

  const loadCalendar = async () => {
    try {
      setAppleLoading(true);
      setAppleError(null);
      setCalendar(await window.beacon.apple.calendarToday());
    } catch (error) {
      setAppleError(error instanceof Error ? error.message : 'Calendar is unavailable.');
    } finally {
      setAppleLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      setAppleLoading(true);
      setAppleError(null);
      setReminders(await window.beacon.apple.reminders());
    } catch (error) {
      setAppleError(error instanceof Error ? error.message : 'Reminders are unavailable.');
    } finally {
      setAppleLoading(false);
    }
  };

  const handleToggleAppleContext = () => {
    if (!contextOpen && !hasGrantedApple) {
      setShowPermissionModal(true);
      return;
    }
    setContextOpen((open) => !open);
    if (!contextOpen && hasGrantedApple && !calendar && !reminders) {
      void loadCalendar();
      void loadReminders();
    }
  };

  const handleGrantPermission = () => {
    setHasGrantedApple(true);
    localStorage.setItem('beacon:apple-permission-granted', 'true');
    setShowPermissionModal(false);
    setContextOpen(true);
    void loadCalendar();
    void loadReminders();
  };

  if (loading) return <Shell><div style={{ color: 'var(--text-muted)', paddingTop: 32 }}>Preparing your day…</div></Shell>;

  return <Shell>
    <header style={headerStyle}>
      <div style={greetingPanelStyle}>
        <BeaconCompanion state="smiling" size="large" interactive={false} label="Beacon companion: smiling" />
        <div><div style={dateStyle}>{dateLabel()}</div><h1 style={titleStyle}>{greeting()}</h1><p style={subtitleStyle}>Choose a few useful moves. The rest stays in sight.</p></div>
      </div>
      <button className="btn-ghost" onClick={onAddAction} style={addButtonStyle}><Plus size={15} /> Add action</button>
    </header>
    {error && <div role="alert" style={errorStyle}>Couldn’t refresh Today. <button className="btn-ghost" onClick={onRefresh} style={{ padding: 0, color: 'inherit', textDecoration: 'underline' }}>Try again</button></div>}
    <main style={{ display: 'grid', gap: 10 }} aria-label="Today's commitments">
      {todays.length > 0 && <div style={sectionLabelStyle}>Today focus</div>}
      {todays.map((action, index) => <CommitmentCard key={action.id} index={index + 1} action={action} goal={goals.find((goal) => goal.id === action.goalId)} onComplete={onComplete} onStart={setStartFor} onMore={setOptionsFor} />)}
      {!hasTodayContent && <EmptyToday onAddAction={onAddAction} />}
    </main>
    {unplanned.length > 0 && <section style={openActionsStyle} aria-label="All open actions"><div style={sectionLabelStyle}>All open actions · {unplanned.length}</div>{unplanned.map((action) => <UnplannedAction key={action.id} action={action} goal={goals.find((goal) => goal.id === action.goalId)} onBringToToday={onBringToToday} onStart={setStartFor} />)}</section>}
    {recentActivity.length > 0 && <RecentActivity events={recentActivity} goals={goals} />}
    <section style={contextStripStyle} aria-label="Today at a glance"><span><strong>{moved}</strong> / {Math.max(plannedFocusCount, todays.length)} commitments moved</span><span style={contextDotStyle}>•</span><span>Focus is ready when you are</span></section>
    {later.length > 0 && <section style={disclosureStyle}><button className="btn-ghost" style={disclosureButtonStyle} onClick={() => setLaterOpen((open) => !open)} aria-expanded={laterOpen}><ChevronDown size={14} style={{ transform: laterOpen ? 'rotate(180deg)' : undefined, transition: 'transform var(--transition-fast)' }} /> Later today · {later.length}</button>{laterOpen && <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>{later.map((action) => <LaterAction key={action.id} action={action} goal={goals.find((goal) => goal.id === action.goalId)} onStart={setStartFor} onMore={setOptionsFor} />)}</div>}</section>}
    <section style={disclosureStyle}>
      <button className="btn-ghost" style={disclosureButtonStyle} onClick={handleToggleAppleContext} aria-expanded={contextOpen}>
        <CalendarDays size={14} /> Apple Calendar & Reminders {hasGrantedApple && <span style={{ fontSize: 10, color: 'var(--accent-primary)', marginLeft: 4 }}>• Connected</span>}
      </button>
      {contextOpen && <AppleContext calendar={calendar} reminders={reminders} loading={appleLoading} error={appleError} goals={goals} onCalendar={loadCalendar} onReminders={loadReminders} />}
    </section>
    {showPermissionModal && <ApplePermissionModal onAllow={handleGrantPermission} onClose={() => setShowPermissionModal(false)} />}
    {startFor && <StartSheet action={startFor} goal={goals.find((goal) => goal.id === startFor.goalId)} onClose={() => setStartFor(null)} onStart={(minutes) => { onFocus(startFor.goalId, startFor.id, minutes); setStartFor(null); }} />}
    {optionsFor && <OptionsSheet action={optionsFor} onClose={() => setOptionsFor(null)} onMoveLater={() => { onMoveLater(optionsFor.id); setOptionsFor(null); }} onReschedule={(date) => { onReschedule(optionsFor.id, date); setOptionsFor(null); }} onSkip={(reason) => { onSkip(optionsFor.id, reason); setOptionsFor(null); }} />}
  </Shell>;
};

const Shell: React.FC<React.PropsWithChildren> = ({ children }) => <div style={{ flex: 1, overflowY: 'auto', padding: '34px clamp(24px, 6vw, 72px) 48px', maxWidth: 920, width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>{children}</div>;
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 30 };
const greetingPanelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 18, minWidth: 0, padding: '16px 18px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)' };
const dateStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.11em', color: 'var(--text-muted)', marginBottom: 11 };
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 31, lineHeight: 1.06, letterSpacing: '-.045em', fontWeight: 700 };
const subtitleStyle: React.CSSProperties = { color: 'var(--text-secondary)', fontSize: 15, margin: '8px 0 0' };
const addButtonStyle: React.CSSProperties = { padding: '8px 10px', fontSize: 12, flexShrink: 0 };
const sectionLabelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)', margin: '8px 0 2px' };
const openActionsStyle: React.CSSProperties = { display: 'grid', gap: 6, marginTop: 24, paddingTop: 4 };
const errorStyle: React.CSSProperties = { marginBottom: 14, padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.28)', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.08)', fontSize: 12 };
const commitmentStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '52px minmax(0, 1fr) auto', gap: 18, alignItems: 'center', padding: '23px 22px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)' };
const rankStyle: React.CSSProperties = { alignSelf: 'start', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', paddingTop: 2 };
const actionLabelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)', marginBottom: 8 };

const CommitmentCard: React.FC<{ index: number; action: GoalAction; goal?: Goal; onComplete: (id: string) => void; onStart: (action: GoalAction) => void; onMore: (action: GoalAction) => void }> = ({ index, action, goal, onComplete, onStart, onMore }) => <article style={commitmentStyle}><span style={rankStyle}>{String(index).padStart(2, '0')}</span><div style={{ minWidth: 0 }}><div style={actionLabelStyle}>{index === 1 ? 'Primary' : goal?.name ?? 'Goal'}</div><div style={{ fontSize: 19, fontWeight: 650, lineHeight: 1.25, letterSpacing: '-.025em' }}>{action.title}</div><div style={{ marginTop: 7, color: 'var(--text-secondary)', fontSize: 13 }}>{index === 1 ? goal?.name ?? 'Goal' : action.estimatedMinutes ? `${action.estimatedMinutes} minute next action` : 'Next action'}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', justifyContent: 'flex-end' }}><button className="btn-ghost" onClick={() => onMore(action)} aria-label={`More options for ${action.title}`} title="More options" style={{ padding: 8 }}><MoreHorizontal size={16} /></button><button className="btn-ghost" onClick={() => onStart(action)} style={{ padding: '8px 11px', fontSize: 12 }}><Play size={14} fill="currentColor" /> Start Focus</button><button className="btn-primary" onClick={() => onComplete(action.id)} style={{ padding: '8px 11px', fontSize: 12 }}><Check size={14} /> Mark Done</button></div></article>;
const EmptyToday: React.FC<{ onAddAction: () => void }> = ({ onAddAction }) => <div style={{ padding: '34px 24px', textAlign: 'center', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-xl)', color: 'var(--text-secondary)' }}><Clock3 size={21} style={{ marginBottom: 9 }} /><div style={{ color: 'var(--text-primary)', fontWeight: 650 }}>A clear day starts with one next action.</div><p style={{ margin: '7px 0 14px', fontSize: 13 }}>Choose a small, visible step from a goal.</p><button className="btn-primary" onClick={onAddAction}>Add next action</button></div>;
const contextStripStyle: React.CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 22, padding: '13px 2px', color: 'var(--text-secondary)', fontSize: 12, borderBottom: '1px solid var(--border-subtle)' };
const contextDotStyle: React.CSSProperties = { color: 'var(--text-muted)' };
const disclosureStyle: React.CSSProperties = { marginTop: 12 };
const disclosureButtonStyle: React.CSSProperties = { padding: '7px 2px', color: 'var(--text-secondary)', fontSize: 12, gap: 6, cursor: 'pointer' };
const LaterAction: React.FC<{ action: GoalAction; goal?: Goal; onStart: (action: GoalAction) => void; onMore: (action: GoalAction) => void }> = ({ action, goal, onStart, onMore }) => <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{action.title}</div><div style={{ marginTop: 3, color: 'var(--text-muted)', fontSize: 11 }}>{goal?.name ?? 'Goal'}</div></div><button className="btn-ghost" onClick={() => onStart(action)} style={{ padding: 6 }} aria-label={`Start focus for ${action.title}`}><Play size={14} /></button><button className="btn-ghost" onClick={() => onMore(action)} style={{ padding: 6 }} aria-label={`More options for ${action.title}`}><MoreHorizontal size={15} /></button></div>;
const UnplannedAction: React.FC<{ action: GoalAction; goal?: Goal; onBringToToday: (id: string) => void; onStart: (action: GoalAction) => void }> = ({ action, goal, onBringToToday, onStart }) => <article style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 650 }}>{action.title}</div><div style={{ marginTop: 3, color: 'var(--text-muted)', fontSize: 11 }}>{goal?.name ?? 'Goal'}{action.estimatedMinutes ? ` · ${action.estimatedMinutes} min` : ''}</div></div><button className="btn-ghost" onClick={() => onStart(action)} style={{ padding: 6 }} aria-label={`Start focus for ${action.title}`} title="Start focus"><Play size={14} /></button><button className="btn-primary" onClick={() => onBringToToday(action.id)} style={{ padding: '6px 9px', fontSize: 11 }}>Bring to Today</button></article>;

const RecentActivity: React.FC<{ events: ProgressEvent[]; goals: Goal[] }> = ({ events, goals }) => {
  const goalNames = useMemo(() => new Map(goals.map((goal) => [goal.id, goal.name])), [goals]);

  return <section style={recentActivityStyle} aria-label="Recent Beacon activity">
    <div style={sectionLabelStyle}>Recent Beacon activity</div>
    <div style={{ display: 'grid', gap: 6 }}>
      {events.map((event) => {
        const time = new Date(event.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        const delta = event.delta > 0 ? `+${event.delta}` : String(event.delta);
        return <div key={event.id} style={activityEventStyle}>
          <span style={activityDeltaStyle}>{delta}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goalNames.get(event.goalId) ?? 'Past goal'}</div>
            {event.note && <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.note}</div>}
          </div>
          <time dateTime={event.timestamp} style={activityTimeStyle}>{time}</time>
        </div>;
      })}
    </div>
  </section>;
};

const recentActivityStyle: React.CSSProperties = { display: 'grid', gap: 8, marginTop: 24 };
const activityEventStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' };
const activityDeltaStyle: React.CSSProperties = { flexShrink: 0, minWidth: 30, padding: '3px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: 11, fontWeight: 700, textAlign: 'center' };
const activityTimeStyle: React.CSSProperties = { flexShrink: 0, color: 'var(--text-muted)', fontSize: 10 };

const AppleContext: React.FC<{
  calendar: CalendarContextEvent[] | null;
  reminders: ExternalReminder[] | null;
  loading: boolean;
  error: string | null;
  goals: Goal[];
  onCalendar: () => void;
  onReminders: () => void;
}> = ({ calendar, reminders, loading, error, goals, onCalendar, onReminders }) => (
  <div style={{ padding: '12px 14px', marginTop: 8, borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn-ghost" onClick={onCalendar} disabled={loading} style={{ fontSize: 12, padding: '4px 10px' }}>
          <CalendarIcon size={13} /> {loading ? 'Syncing…' : 'Refresh Calendar'}
        </button>
        <button className="btn-ghost" onClick={onReminders} disabled={loading} style={{ fontSize: 12, padding: '4px 10px' }}>
          <RefreshCw size={13} /> Fetch Reminders
        </button>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Apple Script Bridge</span>
    </div>

    {error && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5', fontSize: 12, marginBottom: 10 }}>
        <AlertCircle size={14} />
        <span>{error}</span>
      </div>
    )}

    {calendar && calendar.length === 0 && !error && (
      <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>
        No events scheduled on your Apple Calendar for today. A clear day for deep focus!
      </div>
    )}

    {calendar && calendar.length > 0 && (
      <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)' }}>Today’s Events</div>
        {calendar.map((event) => (
          <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: 12 }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {new Date(event.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </span>
            <span style={{ flex: 1, color: 'var(--text-primary)' }}>{event.title}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{event.calendar}</span>
          </div>
        ))}
      </div>
    )}

    {reminders && (
      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)' }}>Reminders to Import</div>
        {reminders.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No open reminders found in Apple Reminders.</div>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: 12 }}>
              <span style={{ flex: 1, color: 'var(--text-primary)' }}>{reminder.title}</span>
              <select
                className="input"
                defaultValue=""
                style={{ fontSize: 11, padding: '4px 8px', maxWidth: 160 }}
                onChange={async (event) => {
                  if (event.target.value) {
                    await window.beacon.apple.importReminder(event.target.value, reminder);
                    event.currentTarget.disabled = true;
                  }
                }}
              >
                <option value="" disabled>Import to goal…</option>
                {goals.filter((goal) => goal.status === 'active').map((goal) => <option key={goal.id} value={goal.id}>{goal.name}</option>)}
              </select>
            </div>
          ))
        )}
      </div>
    )}
  </div>
);

const StartSheet: React.FC<{ action: GoalAction; goal?: Goal; onClose: () => void; onStart: (minutes: number) => void }> = ({ action, goal, onClose, onStart }) => (
  <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Start focus">
    <div className="modal-content" style={{ width: 380 }}>
      <div style={actionLabelStyle}>Focus on</div>
      <h2 style={{ margin: '0 0 4px' }}>{action.title}</h2>
      <p style={{ margin: '0 0 18px', color: 'var(--text-secondary)', fontSize: 13 }}>{goal?.name ?? 'Goal'} · choose a length that fits.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        <button className="btn-primary" onClick={() => onStart(25)}><Play size={15} fill="currentColor" /> Start · 25 min</button>
        <button className="btn-ghost" onClick={() => onStart(50)}>Start · 50 min</button>
      </div>
      <button className="btn-ghost" onClick={onClose} style={{ marginTop: 13, width: '100%' }}>Not now</button>
    </div>
  </div>
);

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
      <div className="modal-content" style={{ width: 420 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>{action.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>What happened today?</p>
        <div style={{ display: 'grid', gap: 14 }}>
          <button className="btn-ghost" onClick={onMoveLater} style={{ justifyContent: 'flex-start' }}>Keep it for later today</button>
          <div style={{ display: 'grid', gap: 8, padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Reschedule</span>
            <QuickDatePicker value={date} onChange={setDate} />
            <button className="btn-primary" disabled={!date} onClick={() => onReschedule(date)} style={{ justifySelf: 'start', padding: '6px 14px', fontSize: 12, marginTop: 4 }}>
              Reschedule to {date}
            </button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Or Skip for Today</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {(['rest', 'travel', 'sick', 'vacation', 'custom'] as SkipReason[]).map((reason) => (
                <button key={reason} className="btn-ghost" onClick={() => onSkip(reason)} style={{ fontSize: 12, padding: '5px 10px' }}>
                  {reason === 'custom' ? 'Not today' : reason[0].toUpperCase() + reason.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button className="btn-ghost" onClick={onClose} style={{ marginTop: 18, width: '100%' }}>Keep it planned</button>
      </div>
    </div>
  );
};
