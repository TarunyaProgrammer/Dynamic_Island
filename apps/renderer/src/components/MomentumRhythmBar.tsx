import React, { useState } from 'react';

export interface DayActivity {
  dayLabel: string;
  count: number;
  isToday?: boolean;
}

const DEFAULT_DAYS: DayActivity[] = [
  { dayLabel: 'M', count: 3 },
  { dayLabel: 'T', count: 4 },
  { dayLabel: 'W', count: 2 },
  { dayLabel: 'T', count: 5 },
  { dayLabel: 'F', count: 4 },
  { dayLabel: 'S', count: 1 },
  { dayLabel: 'S', count: 3, isToday: true },
];

export const MomentumRhythmBar: React.FC<{ days?: DayActivity[] }> = ({ days = DEFAULT_DAYS }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxCount = Math.max(...days.map((d) => d.count), 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {/* Header Stat & Energetic Word Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 122, 0, 0.12)',
            color: 'var(--accent-solar, #ff7a00)',
            border: '1px solid rgba(255, 122, 0, 0.28)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span>✦</span>
          <span>Momentum Surge</span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-amber, #f59e0b)' }}>
          +14% vs last week
        </span>
      </div>

      {/* 7-Day Velocity Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
          alignItems: 'flex-end',
          height: '56px',
          padding: '4px 0',
        }}
      >
        {days.map((d, idx) => {
          const heightPct = Math.max(16, (d.count / maxCount) * 100);
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={`${d.dayLabel}-${idx}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                height: '100%',
                justifyContent: 'flex-end',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    backgroundColor: 'rgba(18, 20, 26, 0.95)',
                    border: '1px solid rgba(255, 122, 0, 0.3)',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    fontSize: '9px',
                    fontWeight: 600,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                >
                  {d.count} actions
                </div>
              )}

              {/* Vertical Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '18px',
                  height: `${heightPct}%`,
                  borderRadius: '4px',
                  backgroundColor: d.isToday
                    ? 'var(--accent-solar, #ff7a00)'
                    : d.count > 0
                    ? 'rgba(255, 158, 66, 0.38)'
                    : 'rgba(255, 255, 255, 0.06)',
                  backgroundImage: d.isToday
                    ? 'linear-gradient(to top, #ff7a00, #f59e0b)'
                    : isHovered
                    ? 'linear-gradient(to top, rgba(255, 122, 0, 0.5), rgba(245, 158, 11, 0.6))'
                    : 'none',
                  boxShadow: d.isToday ? '0 0 10px rgba(255, 122, 0, 0.4)' : 'none',
                  transition: 'all 0.15s ease',
                  border: d.isToday ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
                }}
              />

              {/* Day Label */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: d.isToday ? 700 : 500,
                  color: d.isToday ? 'var(--accent-solar, #ff7a00)' : 'var(--text-muted, #585a66)',
                }}
              >
                {d.dayLabel}
              </span>
            </div>
          );
        })}
      </div>

      <span style={{ fontSize: '11px', color: 'var(--text-secondary, #9496a1)', lineHeight: 1.4 }}>
        You're in your highest momentum rhythm this month. Keep building!
      </span>
    </div>
  );
};
