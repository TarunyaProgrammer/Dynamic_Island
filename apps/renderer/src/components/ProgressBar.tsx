// apps/renderer/src/components/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  progressFraction: number;
  height?: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressFraction,
  height = 6,
  color = 'var(--accent-primary)',
}) => {
  const percent = Math.min(100, Math.max(0, Math.round(progressFraction * 100)));
  const isComplete = progressFraction >= 1.0;

  return (
    <div
      style={{
        width: '100%',
        height,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 9999,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: `${percent}%`,
          height: '100%',
          backgroundColor: isComplete ? 'var(--accent-emerald)' : color,
          borderRadius: 9999,
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease',
        }}
      />
    </div>
  );
};
