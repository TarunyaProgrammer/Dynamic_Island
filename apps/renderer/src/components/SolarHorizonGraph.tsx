import React, { useState, useRef } from 'react';

export interface SolarHorizonGraphProps {
  focusMinutesToday?: number;
  targetMinutes?: number;
  height?: number;
  showTimeTicks?: boolean;
}

interface FocusSessionPoint {
  x: number; // 0 - 240
  timeLabel: string;
  sessionTitle: string;
  durationMins: number;
}

const SAMPLE_SESSIONS: FocusSessionPoint[] = [
  { x: 35, timeLabel: '9:15 AM', sessionTitle: 'Morning Setup', durationMins: 20 },
  { x: 65, timeLabel: '10:30 AM', sessionTitle: 'LeetCode Problem', durationMins: 45 },
  { x: 125, timeLabel: '1:45 PM', sessionTitle: 'Deep Code Architecture', durationMins: 55 },
  { x: 185, timeLabel: '4:15 PM', sessionTitle: 'SaaS App Core Sprint', durationMins: 40 },
];

export const SolarHorizonGraph: React.FC<SolarHorizonGraphProps> = ({
  focusMinutesToday = 150,
  targetMinutes = 240,
  height = 54,
  showTimeTicks = true,
}) => {
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<FocusSessionPoint | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute daily target progress
  const targetPct = targetMinutes > 0 ? Math.min(100, Math.round((focusMinutesToday / targetMinutes) * 100)) : 62;

  // Cubic smooth curve across 12-hour window (8 AM to 8 PM)
  // X: 0 to 240, Y: 0 to 45 (where Y=45 is baseline, Y=8 is peak focus)
  const curvePath = 'M 0,44 C 25,44 45,34 65,18 C 90,4 110,32 130,12 C 155,-4 175,22 195,15 C 215,8 230,36 240,42';
  const fillPath = `${curvePath} L 240,50 L 0,50 Z`;

  // Compute curve Y position at given X using approximate cubic interpolation
  const getYForX = (x: number): number => {
    if (x < 65) {
      const t = x / 65;
      return 44 - t * 26;
    } else if (x < 130) {
      const t = (x - 65) / 65;
      return 18 + Math.sin(t * Math.PI) * 14 - t * 6;
    } else if (x < 195) {
      const t = (x - 130) / 65;
      return 12 + Math.sin(t * Math.PI) * 10;
    } else {
      const t = (x - 195) / 45;
      return 15 + t * 27;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const svgX = (relativeX / rect.width) * 240;
    setHoverX(svgX);

    // Find nearest session within range
    const nearest = SAMPLE_SESSIONS.reduce((prev, curr) => {
      return Math.abs(curr.x - svgX) < Math.abs(prev.x - svgX) ? curr : prev;
    });

    if (Math.abs(nearest.x - svgX) < 35) {
      setActiveSession(nearest);
    } else {
      // Interpolate time from 8 AM to 8 PM
      const totalMinutesFrom8AM = Math.round((svgX / 240) * 720);
      const hour = 8 + Math.floor(totalMinutesFrom8AM / 60);
      const mins = totalMinutesFrom8AM % 60;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      const timeStr = `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
      setActiveSession({
        x: svgX,
        timeLabel: timeStr,
        sessionTitle: 'Focus Horizon',
        durationMins: Math.round(Math.max(10, 50 - getYForX(svgX))),
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setActiveSession(null);
  };

  const dotY = hoverX !== null ? getYForX(hoverX) : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        cursor: 'crosshair',
      }}
    >
      {/* Floating Scrub Tooltip */}
      {hoverX !== null && activeSession && (
        <div
          style={{
            position: 'absolute',
            top: '-26px',
            left: `${(hoverX / 240) * 100}%`,
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(22, 22, 28, 0.94)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 122, 0, 0.35)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 600,
            color: '#ffffff',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 122, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span style={{ color: 'var(--accent-solar, #ff7a00)' }}>✦ {activeSession.timeLabel}</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>·</span>
          <span>{activeSession.sessionTitle}</span>
          <span style={{ color: 'var(--accent-amber, #f59e0b)' }}>({activeSession.durationMins}m)</span>
        </div>
      )}

      {/* SVG Horizon Graph */}
      <svg
        viewBox="0 0 240 50"
        style={{
          width: '100%',
          height: `${height}px`,
          overflow: 'visible',
          display: 'block',
        }}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Luminous Solar Horizon Stroke Gradient */}
          <linearGradient id="solarHorizonStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5ac8fa" />
            <stop offset="45%" stopColor="#ff7a00" />
            <stop offset="80%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ff7a00" />
          </linearGradient>

          {/* Area Fill Gradient: Warm Amber dissolving into surface */}
          <linearGradient id="solarHorizonGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 122, 0, 0.26)" />
            <stop offset="60%" stopColor="rgba(245, 158, 11, 0.08)" />
            <stop offset="100%" stopColor="rgba(255, 122, 0, 0)" />
          </linearGradient>

          {/* Target Baseline Reference Dash Filter */}
          <filter id="solarGlow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ff7a00" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Target Daily Baseline */}
        <line
          x1="0"
          y1="22"
          x2="240"
          y2="22"
          stroke="var(--border-subtle)"
          strokeWidth="1"
          strokeDasharray="3 3"
          data-target-pct={targetPct}
        />

        {/* Ambient Glow Fill */}
        <path d={fillPath} fill="url(#solarHorizonGlow)" />

        {/* Main Radiant Stroke */}
        <path
          d={curvePath}
          fill="none"
          stroke="url(#solarHorizonStroke)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'url(#solarGlow)' }}
        />

        {/* Scrubbing Pinpoint Guideline & Dot */}
        {hoverX !== null && dotY !== null && (
          <g>
            <line
              x1={hoverX}
              y1="0"
              x2={hoverX}
              y2="48"
              stroke="rgba(255, 122, 0, 0.35)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <circle
              cx={hoverX}
              cy={dotY}
              r="4.5"
              fill="#ffffff"
              stroke="#ff7a00"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 6px #ff7a00)' }}
            />
          </g>
        )}
      </svg>

      {/* Minimalist Time Ticks */}
      {showTimeTicks && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 2px',
            fontSize: '9px',
            fontWeight: 500,
            color: 'var(--text-muted, #585a66)',
            letterSpacing: '0.02em',
            userSelect: 'none',
          }}
        >
          <span>9a</span>
          <span>12p</span>
          <span>3p</span>
          <span>6p</span>
        </div>
      )}
    </div>
  );
};
