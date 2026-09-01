// apps/renderer/src/surfaces/DynamicIslandView.tsx
import React, { useState, useRef } from 'react';
import { useGoals } from '../hooks/useGoals';
import { GoalProgressRing } from '../components/GoalProgressRing';
import { QuickIncrementButton } from '../components/QuickIncrementButton';
import { Compass, Sparkles } from 'lucide-react';

export const DynamicIslandView: React.FC = () => {
  const { goals, stats, incrementProgress } = useGoals('active');
  const [isExpanded, setIsExpanded] = useState(false);
  const collapseTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    collapseTimer.current = setTimeout(() => {
      setIsExpanded(false);
    }, 400);
  };

  const percent = stats ? Math.round(stats.overallProgressFraction * 100) : 0;

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
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          width: isExpanded ? '340px' : '190px',
          maxHeight: isExpanded ? '180px' : '32px',
          backgroundColor: '#000000',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: isExpanded ? '20px' : '16px',
          padding: isExpanded ? '12px 14px' : '0 12px',
          boxShadow: isExpanded ? '0 12px 30px rgba(0, 0, 0, 0.7)' : '0 4px 12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          gap: isExpanded ? '10px' : '0',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
      >
        {/* Compact Pill State */}
        {!isExpanded && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              height: '32px',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={12} color="var(--accent-primary)" />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>
                {stats?.activeGoals ?? 0} {stats?.activeGoals === 1 ? 'goal' : 'goals'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <GoalProgressRing progressFraction={stats?.overallProgressFraction ?? 0} size={18} strokeWidth={2.5} showText={false} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8' }}>{percent}%</span>
            </div>
          </div>
        )}

        {/* Expanded Surface State */}
        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} color="var(--accent-primary)" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>Active Focus</span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)' }}>{percent}% overall</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto' }}>
              {goals.slice(0, 2).map((g) => (
                <div
                  key={g.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.name}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      {g.currentValue} / {g.targetValue} {g.unit || ''}
                    </span>
                  </div>

                  <QuickIncrementButton
                    amount={g.defaultIncrement || 1}
                    unit={g.unit}
                    onClick={() => incrementProgress(g.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
