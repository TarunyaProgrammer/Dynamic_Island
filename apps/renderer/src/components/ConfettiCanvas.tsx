// apps/renderer/src/components/ConfettiCanvas.tsx - Lightweight Canvas Confetti Engine
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'sparkle';
  decay: number;
}

const PALETTE = [
  '#A855F7', // Neon Violet
  '#8B5CF6', // Electric Indigo
  '#38BDF8', // Radiant Cyan
  '#34D399', // Emerald
  '#FBBF24', // Amber Gold
  '#F43F5E', // Rose
  '#FFFFFF', // Starlight White
];

export function triggerConfetti(options?: { x?: number; y?: number; count?: number; spread?: 'full' | 'micro' }): void {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('beacon:confetti', { detail: options });
  window.dispatchEvent(event);
}

export const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnParticles = (detail?: { x?: number; y?: number; count?: number; spread?: 'full' | 'micro' }) => {
      const spread = detail?.spread || 'full';
      const isMicro = spread === 'micro';
      const count = detail?.count || (isMicro ? 24 : 100);
      const originX = detail?.x ?? (isMicro ? canvas.width / 2 : canvas.width * (0.3 + Math.random() * 0.4));
      const originY = detail?.y ?? (isMicro ? canvas.height / 2 : canvas.height * 0.4);

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const angle = isMicro
          ? Math.random() * Math.PI * 2
          : -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        const speed = isMicro ? 2 + Math.random() * 5 : 5 + Math.random() * 12;

        newParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: isMicro ? 3 + Math.random() * 3 : 5 + Math.random() * 5,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          opacity: 1,
          shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'sparkle' : 'circle',
          decay: isMicro ? 0.025 + Math.random() * 0.02 : 0.008 + Math.random() * 0.012,
        });
      }

      particlesRef.current.push(...newParticles);
      if (!animFrameRef.current) {
        loop();
      }
    };

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      spawnParticles(customEvent.detail);
    };

    window.addEventListener('beacon:confetti', handleCustomEvent);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gravity
        p.vx *= 0.98; // Air resistance
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        if (p.opacity <= 0 || p.y > canvas.height + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sparkle diamond
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.6, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        animFrameRef.current = null;
      }
    };

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('beacon:confetti', handleCustomEvent);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    />
  );
};
