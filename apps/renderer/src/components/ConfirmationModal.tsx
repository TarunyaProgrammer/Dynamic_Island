// apps/renderer/src/components/ConfirmationModal.tsx
import React, { useRef } from 'react';
import { useDesktopOverlay } from '../hooks/useDesktopOverlay';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useDesktopOverlay({
    isOpen,
    onClose: onCancel,
    containerRef: modalRef,
    autoFocusRef: cancelBtnRef, // Focus Cancel by default for destructive safety
  });

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        style={{
          width: '380px',
          backgroundColor: '#121216',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '22px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: isDestructive ? 'rgba(244, 63, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
              border: isDestructive ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} color={isDestructive ? 'var(--accent-rose)' : 'var(--accent-amber)'} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 id="confirm-dialog-title" style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              {title}
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5, margin: 0 }}>
              {message}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            className="btn-ghost"
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '8px',
              backgroundColor: isDestructive ? 'var(--accent-rose)' : 'var(--accent-emerald)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
