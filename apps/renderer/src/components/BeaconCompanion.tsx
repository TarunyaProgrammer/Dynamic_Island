import React, { useEffect, useState, useRef } from 'react';
import type { CompanionState } from '@shared/types';
import { COMPANION_VIEWBOX, getCompanionVisual } from './companion-state';
import { soundEffects } from '../utils/audio';
import './BeaconCompanion.css';

export interface BeaconCompanionProps {
  state?: CompanionState;
  size?: 'tiny' | 'compact' | 'regular' | 'large';
  label?: string;
  className?: string;
  interactive?: boolean;
  bubblePlacement?: 'top' | 'bottom';
  onInteract?: (state: CompanionState, message?: string) => void;
  onClick?: (e: React.MouseEvent) => void;
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

const TICKLE_QUOTES = [
  'Stop! Stop! haa haa 😄',
  'Hehe! That tickles! ✨',
  'Ahaha, okay okay! ✦',
  'Stop it! haa haa! 😆',
  'Hehe! Tickle monster! 💛',
];

export const BeaconCompanion: React.FC<BeaconCompanionProps> = ({
  state = 'idle',
  size = 'regular',
  label,
  className,
  interactive = true,
  bubblePlacement = size === 'tiny' ? 'bottom' : 'top',
  onInteract,
  onClick,
}) => {
  const [internalState, setInternalState] = useState<CompanionState | null>(null);
  const [internalMessage, setInternalMessage] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveCounterRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);

  const effectiveState = internalState ?? state;
  const visual = getCompanionVisual(effectiveState);
  const reducedMotion = useReducedMotion();
  const isBlinking = useCompanionBlink(!reducedMotion && effectiveState !== 'sleeping');

  const handleMouseEnter = () => {
    if (!interactive) return;
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    moveCounterRef.current = 0;

    // First smile on approach
    setInternalState('smiling');
    setInternalMessage('Hi there! ✨');
    onInteract?.('smiling', 'Hi there! ✨');

    // If hover continues for >320ms, it starts to giggle/tickle!
    hoverTimerRef.current = setTimeout(() => {
      const quote = TICKLE_QUOTES[Math.floor(Math.random() * TICKLE_QUOTES.length)];
      setInternalState('tickled');
      setInternalMessage(quote);
      onInteract?.('tickled', quote);
      soundEffects.playChuckle();
    }, 320);
  };

  const handleMouseMove = () => {
    if (!interactive) return;
    const now = Date.now();
    if (now - lastMoveTimeRef.current < 250) {
      moveCounterRef.current += 1;
      // If user scrubs back and forth, tickle immediately!
      if (moveCounterRef.current >= 2 && internalState !== 'tickled') {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        const quote = TICKLE_QUOTES[Math.floor(Math.random() * TICKLE_QUOTES.length)];
        setInternalState('tickled');
        setInternalMessage(quote);
        onInteract?.('tickled', quote);
        soundEffects.playChuckle();
      }
    } else {
      moveCounterRef.current = 1;
    }
    lastMoveTimeRef.current = now;
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    leaveTimerRef.current = setTimeout(() => {
      setInternalState(null);
      setInternalMessage(null);
    }, 450);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    soundEffects.playMilestonePop();
    setInternalState('celebrating');
    setInternalMessage('Yay! ✦');
    onInteract?.('celebrating', 'Yay! ✦');
    onClick?.(e);

    setTimeout(() => {
      setInternalState(null);
      setInternalMessage(null);
    }, 850);
  };

  const classes = [
    'beacon-companion',
    `beacon-companion--${size}`,
    `beacon-companion--${visual.animation}`,
    interactive ? 'beacon-companion--interactive' : '',
    bubblePlacement === 'bottom' ? 'beacon-companion--bubble-below' : '',
    isBlinking ? 'beacon-companion--blinking' : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  const style: CompanionStyle = {
    '--companion-halo-color': visual.haloColor,
  };

  const bubbleText = internalMessage || (effectiveState === 'celebrating' && label ? label : null);

  return (
    <span
      className={classes}
      style={style}
      role="img"
      aria-label={label ?? visual.label}
      data-state={effectiveState}
      data-state-label={visual.label}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {bubbleText && (
        <span className="beacon-companion__bubble" role="status">
          {bubbleText}
        </span>
      )}
      <span className="beacon-companion__halo" aria-hidden="true" />
      <svg
        className="beacon-companion__svg"
        viewBox={COMPANION_VIEWBOX}
        focusable="false"
        aria-hidden="true"
      >
        <path
          className="beacon-companion__body"
          d="M50 8C70 8 85 20 92 40C99 61 84 84 63 92C41 99 18 86 9 65C1 43 14 21 34 12C39 10 45 8 50 8Z"
        />
        <g className="beacon-companion__eyes">
          <rect
            x={visual.leftEye.cx - visual.leftEye.rx}
            y={visual.leftEye.cy - visual.leftEye.ry}
            width={visual.leftEye.rx * 2}
            height={visual.leftEye.ry * 2}
            rx={Math.min(4, visual.leftEye.rx)}
            transform={`rotate(${visual.leftEye.rotate} ${visual.leftEye.cx} ${visual.leftEye.cy})`}
          />
          <rect
            x={visual.rightEye.cx - visual.rightEye.rx}
            y={visual.rightEye.cy - visual.rightEye.ry}
            width={visual.rightEye.rx * 2}
            height={visual.rightEye.ry * 2}
            rx={Math.min(4, visual.rightEye.rx)}
            transform={`rotate(${visual.rightEye.rotate} ${visual.rightEye.cx} ${visual.rightEye.cy})`}
          />
        </g>
      </svg>
    </span>
  );
};
