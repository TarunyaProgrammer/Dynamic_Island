import React, { useEffect, useState } from 'react';
import type { CompanionState } from '@shared/types';
import { getCompanionVisual } from './companion-state';
import './BeaconCompanion.css';

export interface BeaconCompanionProps {
  state?: CompanionState;
  size?: 'tiny' | 'compact' | 'regular' | 'large';
  label?: string;
  className?: string;
}

interface CompanionStyle extends React.CSSProperties {
  '--companion-halo-color': string;
}

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return undefined;

    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.('change', updatePreference);
    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, []);

  return reducedMotion;
}

function useCompanionBlink(enabled: boolean): boolean {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsBlinking(false);
      return undefined;
    }

    let blinkTimer: ReturnType<typeof setTimeout> | null = null;
    let reopenTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const scheduleBlink = () => {
      const delay = 2_000 + Math.random() * 5_000;
      blinkTimer = setTimeout(() => {
        if (disposed) return;
        setIsBlinking(true);
        reopenTimer = setTimeout(() => {
          if (disposed) return;
          setIsBlinking(false);
          scheduleBlink();
        }, 120);
      }, delay);
    };

    scheduleBlink();

    return () => {
      disposed = true;
      if (blinkTimer !== null) clearTimeout(blinkTimer);
      if (reopenTimer !== null) clearTimeout(reopenTimer);
    };
  }, [enabled]);

  return isBlinking;
}

export const BeaconCompanion: React.FC<BeaconCompanionProps> = ({
  state = 'idle',
  size = 'regular',
  label,
  className,
}) => {
  const visual = getCompanionVisual(state);
  const reducedMotion = useReducedMotion();
  const isBlinking = useCompanionBlink(!reducedMotion && state !== 'sleeping');
  const classes = [
    'beacon-companion',
    `beacon-companion--${size}`,
    `beacon-companion--${visual.animation}`,
    isBlinking ? 'beacon-companion--blinking' : '',
    className ?? '',
  ].filter(Boolean).join(' ');
  const style: CompanionStyle = {
    '--companion-halo-color': visual.haloColor,
  };

  return (
    <span
      className={classes}
      style={style}
      role="img"
      aria-label={label ?? visual.label}
      data-state={state}
      data-state-label={visual.label}
    >
      <span className="beacon-companion__halo" aria-hidden="true" />
      <svg
        className="beacon-companion__svg"
        viewBox="0 0 160 96"
        focusable="false"
        aria-hidden="true"
      >
        <path
          className="beacon-companion__body"
          d="M18 48C18 24 39 11 80 11s62 13 62 37-21 37-62 37S18 72 18 48Z"
        />
        <g className="beacon-companion__eyes">
          <ellipse
            cx={visual.leftEye.cx}
            cy={visual.leftEye.cy}
            rx={visual.leftEye.rx}
            ry={visual.leftEye.ry}
            transform={`rotate(${visual.leftEye.rotate} ${visual.leftEye.cx} ${visual.leftEye.cy})`}
          />
          <ellipse
            cx={visual.rightEye.cx}
            cy={visual.rightEye.cy}
            rx={visual.rightEye.rx}
            ry={visual.rightEye.ry}
            transform={`rotate(${visual.rightEye.rotate} ${visual.rightEye.cx} ${visual.rightEye.cy})`}
          />
        </g>
      </svg>
    </span>
  );
};
