// apps/renderer/src/components/ActivityTimeline.tsx
import React from 'react';
import { Goal, ProgressEvent } from '@shared/types';
import { Activity, Clock } from 'lucide-react';

interface ActivityTimelineProps {
  events: ProgressEvent[];
  goals: Goal[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, goals }) => {
  const goalMap = new Map(goals.map((g) => [g.id, g]));

  if (events.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 10px',
          color: 'var(--text-muted)',
          gap: '6px',
        }}
      >
        <Activity size={13} strokeWidth={1.5} opacity={0.5} />
        <span style={{ fontSize: '11px' }}>No activity logged yet today</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {events.map((event) => {
        const goal = goalMap.get(event.goalId);
        const time = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isPositive = event.delta >= 0;

        return (
          <div
            key={event.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              backgroundColor: 'var(--btn-ghost-bg, rgba(255, 255, 255, 0.02))',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isPositive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  color: isPositive ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {isPositive ? `+${event.delta}` : `${event.delta}`}
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {goal?.name || 'Deleted Goal'}
                </span>
                {event.note && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{event.note}</span>
                )}
              </div>
            </div>

            <span
              style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                flexShrink: 0,
              }}
            >
              <Clock size={10} />
              {time}
            </span>
          </div>
        );
      })}
    </div>
  );
};
