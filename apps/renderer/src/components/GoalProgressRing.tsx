// apps/renderer/src/components/GoalProgressRing.tsx
import React from 'react';

interface GoalProgressRingProps {
  progressFraction: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  color?: string;
}

export const GoalProgressRing: React.FC<GoalProgressRingProps> = ({
  progressFraction,
  size = 48,
  strokeWidth = 4,
  showText = true,
  color = 'var(--accent-solar, #ff7a00)',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedFraction = Math.min(1.0, Math.max(0.0, progressFraction));
  const strokeDashoffset = circumference - clampedFraction * circumference;
  const percent = Math.round(clampedFraction * 100);

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--accent-neutral, rgba(255, 255, 255, 0.12))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={clampedFraction >= 1.0 ? '#10b981' : color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          style={{ transition: 'stroke-dashoffset 0.35s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease' }}
        />
      </svg>
      {showText && (
        <span
          style={{
            position: 'absolute',
            fontSize: size > 40 ? '11px' : '9px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {percent}%
        </span>
      )}
    </div>
  );
};
