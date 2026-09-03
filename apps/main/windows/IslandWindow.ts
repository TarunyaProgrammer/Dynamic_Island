// apps/main/windows/IslandWindow.ts
// Dynamic Island overlay — always 660×180 (full expanded size).
// Collapsed/expanded is pure CSS. We toggle setIgnoreMouseEvents instead of resizing.
// Fixes macOS AppKit event delivery by ensuring focusable: true and proper window level.
import { BrowserWindow, app, screen } from 'electron';
import path from 'path';

export class IslandWindowController {
  private window: BrowserWindow | null = null;

  // Full-size window dimensions — never changes at runtime
  private static readonly W = 660;
  private static readonly H = 180;

  createOrShow(preloadPath: string, rendererUrl?: string): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      this.reposition();
      this.window.showInactive();
      return this.window;
    }

    const primary = screen.getPrimaryDisplay();
    const x = Math.round(primary.bounds.x + (primary.bounds.width - IslandWindowController.W) / 2);
    const y = primary.bounds.y;

    this.window = new BrowserWindow({
      width: IslandWindowController.W,
      height: IslandWindowController.H,
      x,
      y,
      show: false,
      frame: false,
      transparent: true,
      hasShadow: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      focusable: true, // CRITICAL: must be true at creation on macOS so canBecomeKeyWindow is YES
      roundedCorners: false,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    this.window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    // Use 'pop-up-menu' level: floats above full-screen apps and status bar, but remains 100% interactive
    this.window.setAlwaysOnTop(true, 'pop-up-menu');

    // Start in collapsed/pass-through mode.
    // forward: true — mouse MOVE events still reach the web content (for hover detection).
    this.window.setIgnoreMouseEvents(true, { forward: true });

    if (rendererUrl) {
      this.window.loadURL(`${rendererUrl}?surface=island`);
    } else {
      this.window.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        query: { surface: 'island' },
      });
    }

    this.window.once('ready-to-show', () => {
      this.window?.showInactive();
    });

    this.window.on('closed', () => {
      this.window = null;
    });

    return this.window;
  }

  /**
   * Toggle expanded state.
   * expanded=true  → window intercepts all mouse events (clicks, scroll, keyboard) & gains focus
   * expanded=false → window passes clicks through but still receives mouse moves (for hover)
   */
  setExpanded(expanded: boolean): void {
    if (!this.window || this.window.isDestroyed()) return;
    if (expanded) {
      this.window.setIgnoreMouseEvents(false);
      this.window.focus();
    } else {
      // forward: true keeps mouse-move events flowing so hover still works
      this.window.setIgnoreMouseEvents(true, { forward: true });
      this.window.blur();
    }
  }

  reposition(): void {
    if (!this.window || this.window.isDestroyed()) return;
    const primary = screen.getPrimaryDisplay();
    const x = Math.round(primary.bounds.x + (primary.bounds.width - IslandWindowController.W) / 2);
    const y = primary.bounds.y;
    this.window.setPosition(x, y, false);
  }

  toggle(preloadPath: string, rendererUrl?: string): void {
    if (this.window && !this.window.isDestroyed() && this.window.isVisible()) {
      this.window.hide();
    } else {
      this.createOrShow(preloadPath, rendererUrl);
    }
  }

  getWindow(): BrowserWindow | null {
    return this.window;
  }
}
