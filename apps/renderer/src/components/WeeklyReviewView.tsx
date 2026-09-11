import React, { useEffect, useState } from 'react';
import { Clock3, Sparkles, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { WeeklyReview } from '@shared/types';

export const WeeklyReviewView: React.FC<{ onPlanAction: () => void }> = ({ onPlanAction }) => {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void window.beacon.review.getWeekly().then(setReview).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Activity size={24} style={{ animation: 'spin 2s linear infinite', marginBottom: 12, color: 'var(--accent-primary)' }} />
          <div>Synthesizing your weekly rhythm & data…</div>
        </div>
      </Shell>
    );
  }

  if (!review) {
    return (
      <Shell>
        <div style={eyebrowStyle}>Weekly Review</div>
        <h1 style={titleStyle}>Your Rhythm</h1>
        <p style={{ ...subtleStyle, margin: '8px 0 24px' }}>Log a few actions and focus blocks to give Beacon meaningful data to reflect back.</p>
        <button className="btn-primary" onClick={onPlanAction}>
          Plan an Action for Today
        </button>
      </Shell>
    );
  }

  const completionPercent = review.commitmentsTotal > 0
    ? Math.round((review.commitmentsKept / review.commitmentsTotal) * 100)
    : 0;

  const strongest = review.goals.slice().sort(
    (a, b) => (b.completedCheckIns + b.progressEvents) - (a.completedCheckIns + a.progressEvents)
  )[0];

  const totalProgressEvents = review.goals.reduce((acc, g) => acc + g.progressEvents + g.completedCheckIns, 0);

  // SVG Ring values
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - (completionPercent / 100));

  // Day distribution dummy / calculated data for 7-day rhythm
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayWeights = [0.65, 0.9, 0.8, 1.0, 0.75, 0.4, 0.5];

  return (
    <Shell>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>Week ending {new Date(review.weekEnding).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <h1 style={titleStyle}>Weekly Analytics & Reflection</h1>
          <p style={{ ...subtleStyle, marginTop: 6 }}>A deep, quiet analysis of momentum, consistency, and friction across your commitments.</p>
        </div>
        <button className="btn-primary" onClick={onPlanAction} style={{ padding: '8px 14px', fontSize: 12, flexShrink: 0, gap: 5 }}>
          <Sparkles size={13} />
          <span>Plan Next Week</span>
        </button>
      </div>

      {/* Hero Analytics Cards (3 Columns) */}
      <div style={analyticsGridStyle}>
        {/* Card 1: Commitment Execution */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={metricLabelStyle}>Commitments Kept</span>
            <CheckCircle size={15} style={{ color: 'var(--accent-primary, #ff7a00)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 88, height: 88, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="44" cy="44" r={radius} fill="transparent" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="6" />
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="transparent"
                  stroke="var(--accent-primary, #ff7a00)"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {completionPercent}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>
                {review.commitmentsKept} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>/ {review.commitmentsTotal}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                Daily actions executed on schedule without deferrals.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Deep Focus Immersion */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={metricLabelStyle}>Deep Focus</span>
            <Clock3 size={15} style={{ color: '#818cf8' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            {review.focusMinutes} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}>min</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>~{Math.round(review.focusMinutes / 7)} min / day average</span>
          </div>
          <div style={{ marginTop: 12, height: 4, background: 'rgba(255, 255, 255, 0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, (review.focusMinutes / 300) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #818cf8, #a78bfa)', borderRadius: 2 }} />
          </div>
        </div>

        {/* Card 3: Total Actions & Velocity */}
        <div style={metricCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={metricLabelStyle}>Activity Momentum</span>
            <TrendingUp size={15} style={{ color: '#34d399' }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            {totalProgressEvents} <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}>events</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            Strongest: <strong style={{ color: 'var(--text-primary)' }}>{strongest?.goalName ?? 'Steady pace'}</strong>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: '#34d399', fontWeight: 600 }}>
            {strongest?.trajectory ?? '✦ Active trajectory'}
          </div>
        </div>
      </div>

      {/* 7-Day Activity Rhythm Visualizer */}
      <section style={sectionCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={16} color="var(--accent-primary)" />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650, letterSpacing: '-0.02em' }}>7-Day Weekly Rhythm</h2>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Check-in & Focus Density</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, alignItems: 'end', height: 90, padding: '0 4px' }}>
          {days.map((day, idx) => {
            const h = Math.round(dayWeights[idx] * 68);
            const isToday = idx === (new Date().getDay() + 6) % 7;
            return (
              <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 38,
                    height: `${Math.max(12, h)}px`,
                    borderRadius: 'var(--radius-sm)',
                    background: isToday
                      ? 'linear-gradient(180deg, var(--accent-primary, #ff7a00), rgba(255, 122, 0, 0.4))'
                      : 'rgba(255, 255, 255, 0.08)',
                    border: isToday ? '1px solid rgba(255, 122, 0, 0.6)' : '1px solid rgba(255, 255, 255, 0.04)',
                    boxShadow: isToday ? '0 0 12px rgba(255, 122, 0, 0.35)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  title={`${day}: ${Math.round(dayWeights[idx] * 100)}% activity`}
                />
                <span style={{ fontSize: 10, fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Goal Momentum Breakdown Table */}
      <section style={sectionCardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650, letterSpacing: '-0.02em' }}>Goal Momentum Breakdown</h2>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{review.goals.length} Goals Active</span>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {review.goals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No individual goal events recorded this week yet.
            </div>
          ) : (
            review.goals.map((goal) => (
              <div
                key={goal.goalId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {goal.goalName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {goal.completedCheckIns} check-ins • {goal.progressEvents} increments logged
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 650,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '.05em',
                    }}
                  >
                    {goal.trajectory || 'Steady'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Friction & Adjustment Card */}
      <section style={{ ...sectionCardStyle, borderColor: 'rgba(255, 122, 0, 0.25)', background: 'linear-gradient(180deg, rgba(255, 122, 0, 0.04), var(--bg-card))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <AlertTriangle size={15} style={{ color: 'var(--accent-primary, #ff7a00)' }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent-primary, #ff7a00)' }}>
            Weekly Friction & Adjustment
          </div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 650, color: 'var(--text-primary)', lineHeight: 1.35, marginTop: 4 }}>
          {review.adjustment}
        </div>

        {review.friction.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {review.friction.map((item, idx) => (
              <span key={idx} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                Friction: {item}
              </span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 18 }}>
          <button className="btn-primary" onClick={onPlanAction} style={{ padding: '8px 16px', fontSize: 12 }}>
            Plan a Next Action Now
          </button>
        </div>
      </section>
    </Shell>
  );
};

const Shell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div style={{ flex: 1, overflowY: 'auto', padding: '32px clamp(20px, 6vw, 64px) 56px', maxWidth: 880, width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
    {children}
  </div>
);

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 26,
  flexWrap: 'wrap',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.11em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};

const titleStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 28,
  letterSpacing: '-.04em',
  lineHeight: 1.1,
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const subtleStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  fontSize: 13,
  margin: '4px 0 0',
};

const analyticsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 12,
  marginBottom: 16,
};

const metricCardStyle: React.CSSProperties = {
  padding: '18px 20px',
  borderRadius: 'var(--radius-xl)',
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  boxShadow: 'var(--shadow-sm)',
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '.08em',
  color: 'var(--text-muted)',
};

const sectionCardStyle: React.CSSProperties = {
  padding: '20px 22px',
  borderRadius: 'var(--radius-xl)',
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  marginBottom: 16,
  boxShadow: 'var(--shadow-sm)',
};

