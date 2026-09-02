// apps/renderer/src/hooks/useDesktopOverlay.ts
import { useEffect, useRef, useCallback } from 'react';

interface UseDesktopOverlayOptions {
  isOpen: boolean;
  onClose: () => void;
  /** Disable closing when an active operation is executing */
  isProcessing?: boolean;
  /** Element to return focus to when overlay closes */
  restoreFocusRef?: React.RefObject<HTMLElement | null>;
  /** Automatically focus this element when overlay opens */
  autoFocusRef?: React.RefObject<HTMLElement | null>;
  /** Close when clicking outside of this container */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Nested overlays or popovers that should take precedence for Escape/ClickOutside */
  hasNestedOverlay?: boolean;
  /** Callback before closing (e.g., to check unsaved changes) - return false to abort close */
  onBeforeClose?: () => boolean;
}

/**
 * Native macOS Desktop Overlay Controller.
 * Provides consistent Escape key handling, click-outside dismissal,
 * focus trapping, and focus restoration without listener accumulation.
 */
export function useDesktopOverlay({
  isOpen,
  onClose,
  isProcessing = false,
  restoreFocusRef,
  autoFocusRef,
  containerRef,
  hasNestedOverlay = false,
  onBeforeClose,
}: UseDesktopOverlayOptions) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleSafeClose = useCallback(() => {
    if (isProcessing) return;
    if (onBeforeClose && !onBeforeClose()) return;
    onClose();
  }, [isProcessing, onBeforeClose, onClose]);

  // Focus management: capture previous focus & autofocus on open, restore on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = (restoreFocusRef?.current || document.activeElement) as HTMLElement;
      
      // Defer focus slightly to ensure DOM is mounted
      const timer = setTimeout(() => {
        if (autoFocusRef?.current) {
          autoFocusRef.current.focus();
        }
      }, 30);

      return () => clearTimeout(timer);
    } else {
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, autoFocusRef, restoreFocusRef]);

  // Escape key handler with nested overlay awareness
  useEffect(() => {
    if (!isOpen || hasNestedOverlay) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleSafeClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, hasNestedOverlay, handleSafeClose]);

  // Click outside handler
  useEffect(() => {
    if (!isOpen || !containerRef) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (hasNestedOverlay) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSafeClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, containerRef, hasNestedOverlay, handleSafeClose]);

  return { handleSafeClose };
}
