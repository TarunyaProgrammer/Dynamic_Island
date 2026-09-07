// apps/renderer/src/components/LightBeamFeedback.tsx - Subtle Ambient Beacon Light Pulse
import React, { useState, useEffect } from 'react';

interface LightPulseEvent {
  id: number;
  color?: string;
  x?: number;
  y?: number;
}

let pulseListeners: ((event: LightPulseEvent) => void)[] = [];

/**
 * Triggers a restrained 250ms Beacon light beam pulse.
 * Replaces disruptive confetti with quiet, elegant optical radiance.
 */
export function triggerLightPulse(options?: string | { color?: string; [key: string]: any }) {
  const color = typeof options === 'string' ? options : options?.color || 'var(--accent-solar, #ff7a00)';
  const event: LightPulseEvent = { id: Date.now(), color };
  pulseListeners.forEach((fn) => fn(event));
}

export const LightBeamFeedback: React.FC = () => {
  const [activePulses, setActivePulses] = useState<LightPulseEvent[]>([]);

  useEffect(() => {
    const handler = (event: LightPulseEvent) => {
      setActivePulses((prev) => [...prev, event]);
      setTimeout(() => {
        setActivePulses((prev) => prev.filter((p) => p.id !== event.id));
      }, 350);
    };

    pulseListeners.push(handler);
    return () => {
      pulseListeners = pulseListeners.filter((l) => l !== handler);
    };
  }, []);

  if (activePulses.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {activePulses.map((pulse) => (
        <div
          key={pulse.id}
          style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255, 122, 0, 0.20) 0%, rgba(255, 255, 255, 0.06) 40%, transparent 70%)`,
            animation: 'beaconLightPulse 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />
      ))}
      <style>{`
        @keyframes beaconLightPulse {
          0% {
            opacity: 0;
            transform: scale(0.6);
          }
          40% {
            opacity: 1;
            transform: scale(1.05);
          }
          100% {
            opacity: 0;
            transform: scale(1.25);
          }
        }
      `}</style>
    </div>
  );
};
