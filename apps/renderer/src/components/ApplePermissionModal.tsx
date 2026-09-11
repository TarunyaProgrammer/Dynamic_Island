import React, { useEffect } from 'react';
import { Calendar, CheckCircle, ShieldCheck, ListTodo, X } from 'lucide-react';

interface ApplePermissionModalProps {
  onAllow: () => void;
  onClose: () => void;
}

export const ApplePermissionModal: React.FC<ApplePermissionModalProps> = ({ onAllow, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Connect Calendar & Reminders"
      style={{
        zIndex: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="modal-content"
        style={{
          width: 'min(420px, 92vw)',
          padding: '24px 24px 20px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-card, #14151b)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
          }}
        >
          <X size={16} />
        </button>

        {/* Header with Beacon & Apple icon badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(255, 122, 0, 0.2), rgba(124, 108, 255, 0.2))',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(255, 122, 0, 0.15)',
              flexShrink: 0,
            }}
          >
            <Calendar size={24} style={{ color: 'var(--accent-primary, #ff7a00)' }} />
          </div>
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: 'var(--accent-primary, #ff7a00)',
              }}
            >
              macOS Integration
            </span>
            <h2 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text-primary)' }}>
              Connect Apple Calendar & Reminders
            </h2>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5, margin: '0 0 18px' }}>
          Beacon integrates directly with your macOS Calendar and Reminders so you can see your day’s schedule alongside your goals without context-switching.
        </p>

        {/* Privacy & Feature Highlights */}
        <div
          style={{
            display: 'grid',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 22,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
            <ShieldCheck size={16} style={{ color: '#34d399', flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>100% Private & On-Device</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                Your events never leave your Mac. Zero cloud uploads or telemetry.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
            <Calendar size={15} style={{ color: 'var(--accent-primary, #ff7a00)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Read-Only Calendar Access</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                Shows today's events at a glance to help you plan quiet focus blocks.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
            <ListTodo size={15} style={{ color: '#818cf8', flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>1-Click Reminder Import</strong>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                Pull tasks from Apple Reminders directly into your goal actions.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            style={{ padding: '8px 14px', fontSize: 13 }}
          >
            Not now
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onAllow}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 650,
              gap: 6,
              background: 'linear-gradient(135deg, #ff7a00, #ff9533)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)',
            }}
          >
            <CheckCircle size={15} />
            <span>Allow Access</span>
          </button>
        </div>
      </div>
    </div>
  );
};
