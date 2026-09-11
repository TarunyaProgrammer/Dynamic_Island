// apps/main/windows/IslandWindow.ts
// Multi-Display Dynamic Island Window Controller.
// Renders an independent stealth notch on all connected displays.
// Pure CSS handles expand (640×160) and collapse (200×32).
// Click-passthrough is 100% maintained by strictly sizing each window to its active content bounds.
import { BrowserWindow, app, screen } from '@electron-bridge';
import type { Display, WebContents } from '@electron-bridge';
import path from 'path';
import {
  COLLAPSED_ISLAND_SIZE,
  EXPANDED_ISLAND_SIZE,
  ISLAND_TRANSITION_MS,
  islandBoundsFor,
  islandNativePolicyFor,
} from './islandWindowLayout';
import type { IslandVisualState } from './islandWindowLayout';

export class IslandWindowController {
  private windows = new Map<number, BrowserWindow>();
  private isExpandedMap = new Map<number, boolean>();
  private collapseTimeouts = new Map<number, NodeJS.Timeout>();
  private screenListenersAttached = false;
  private preloadPath: string = '';
  private rendererUrl?: string;

  // Window canvas dimensions
  public static readonly COLLAPSED_W = COLLAPSED_ISLAND_SIZE.width;
  public static readonly COLLAPSED_H = COLLAPSED_ISLAND_SIZE.height;
  public static readonly EXPANDED_W = EXPANDED_ISLAND_SIZE.width;
  public static readonly EXPANDED_H = EXPANDED_ISLAND_SIZE.height;

  // Backward-compatibility aliases
  public static readonly W = 660;
  public static readonly H = 180;

  createOrShow(preloadPath: string, rendererUrl?: string): BrowserWindow {
    this.preloadPath = preloadPath;
    this.rendererUrl = rendererUrl;

    // Attach screen listeners once to handle monitor hotplugging and resolution changes
    if (!this.screenListenersAttached) {
      const onDisplayChange = () => this.syncDisplays();
      screen.on('display-added', onDisplayChange);
      screen.on('display-removed', onDisplayChange);
      screen.on('display-metrics-changed', onDisplayChange);
      this.screenListenersAttached = true;
    }

    this.syncDisplays();

    // Return the primary display window (or first available window) for backward compatibility
    return this.getWindow()!;
  }

  private createWindowForDisplay(display: Display): BrowserWindow {
    const state = this.stateFor(display.id);
    const bounds = islandBoundsFor(display.bounds, state);

    const win = new BrowserWindow({
      ...bounds,
      show: false,
      frame: false,
      transparent: true,
      hasShadow: false,
      resizable: true, // Required on macOS for programmatic setBounds resizing
      alwaysOnTop: true,
      skipTaskbar: true,
      focusable: true,
      roundedCorners: false,
      backgroundColor: '#00000000',
      webPreferences: {
        preload: this.preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false, // Required: better-sqlite3 native module cannot run in sandbox
        webSecurity: true, // Enforce same-origin policy
        allowRunningInsecureContent: false, // Block mixed HTTP/HTTPS content
        spellcheck: false, // Unnecessary feature — removes IPC overhead
      },
    });

    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    // 'pop-up-menu' level: floats above full-screen apps and status bar while remaining fully interactive
    win.setAlwaysOnTop(true, 'pop-up-menu');
    this.applyNativePolicy(win, state);

    // Forward web console messages to terminal
    win.webContents.on('console-message', (_event, _level, message) => {
      console.log(`[Island Web: Display ${display.id}]`, message);
    });

    if (this.rendererUrl) {
      win.loadURL(`${this.rendererUrl}?surface=island`);
    } else {
      win.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        query: { surface: 'island' },
      });
    }

    win.once('ready-to-show', () => {
      win.show();
    });

    win.on('closed', () => {
      const timeout = this.collapseTimeouts.get(display.id);
      if (timeout) {
        clearTimeout(timeout);
        this.collapseTimeouts.delete(display.id);
      }
      this.isExpandedMap.delete(display.id);
      this.windows.delete(display.id);
    });

    this.windows.set(display.id, win);
    return win;
  }

  public syncDisplays(): void {
    if (!this.preloadPath) return;

    const allDisplays = screen.getAllDisplays();
    const activeDisplayIds = new Set(allDisplays.map((d) => d.id));

    // 1. Clean up windows for disconnected displays
    for (const [displayId, win] of this.windows.entries()) {
      if (!activeDisplayIds.has(displayId)) {
        const timeout = this.collapseTimeouts.get(displayId);
        if (timeout) {
          clearTimeout(timeout);
          this.collapseTimeouts.delete(displayId);
        }
        this.isExpandedMap.delete(displayId);
        this.windows.delete(displayId);
        if (!win.isDestroyed()) {
          win.close();
        }
      }
    }

    // 2. Create or reposition windows for current displays
    for (const display of allDisplays) {
      const existingWin = this.windows.get(display.id);
      if (existingWin && !existingWin.isDestroyed()) {
        this.repositionWindow(display, existingWin);
      } else {
        this.createWindowForDisplay(display);
      }
    }
  }

  private repositionWindow(display: Display, win: BrowserWindow): void {
    if (!win || win.isDestroyed()) return;
    const state = this.stateFor(display.id);
    this.setBoundsForState(display, win, state);
    this.applyNativePolicy(win, state);
  }

  private stateFor(displayId: number): IslandVisualState {
    return this.isExpandedMap.get(displayId) ? 'expanded' : 'collapsed';
  }

  private applyNativePolicy(win: BrowserWindow, state: IslandVisualState): void {
    const policy = islandNativePolicyFor(state);
    win.setFocusable(policy.focusable);
    win.setIgnoreMouseEvents(policy.ignoreMouseEvents, {
      forward: policy.forwardMouseEvents,
    });
  }

  private setBoundsForState(display: Display, win: BrowserWindow, state: IslandVisualState): void {
    win.setBounds(islandBoundsFor(display.bounds, state), false);
  }

  /**
   * Expands or collapses the notch specifically for the window that initiated the action.
   */
  setExpandedForSender(sender: WebContents, expanded: boolean): void {
    const targetWindow = BrowserWindow.fromWebContents(sender);
    if (!targetWindow || targetWindow.isDestroyed()) return;

    // Find corresponding displayId in this.windows
    let targetDisplayId: number | null = null;
    for (const [displayId, win] of this.windows.entries()) {
      if (win === targetWindow) {
        targetDisplayId = displayId;
        break;
      }
    }

    // If not found by map, resolve by screen.getDisplayMatching
    const allDisplays = screen.getAllDisplays();
    const targetDisplay = targetDisplayId !== null
      ? allDisplays.find((d) => d.id === targetDisplayId)
      : screen.getDisplayMatching(targetWindow.getBounds());

    if (!targetDisplay) return;
    const displayId = targetDisplay.id;

    // Clear any existing collapse timer for this display
    const existingTimeout = this.collapseTimeouts.get(displayId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.collapseTimeouts.delete(displayId);
    }

    if (expanded) {
      this.isExpandedMap.set(displayId, true);
      this.setBoundsForState(targetDisplay, targetWindow, 'expanded');
      this.applyNativePolicy(targetWindow, 'expanded');
    } else {
      this.isExpandedMap.set(displayId, false);
      this.applyNativePolicy(targetWindow, 'collapsed');
      // Keep the native window large until the renderer's contraction finishes.
      const timeout = setTimeout(() => {
        this.collapseTimeouts.delete(displayId);
        if (!targetWindow || targetWindow.isDestroyed() || this.isExpandedMap.get(displayId)) return;
        const currentDisplays = screen.getAllDisplays();
        const currentDisplay = currentDisplays.find((d) => d.id === displayId) || targetDisplay;
        this.setBoundsForState(currentDisplay, targetWindow, 'collapsed');
      }, ISLAND_TRANSITION_MS);
      this.collapseTimeouts.set(displayId, timeout);
    }
  }

  /**
   * Backward-compatible fallback for callers without a WebContents sender.
   * Targets the primary display window.
   */
  setExpanded(expanded: boolean): void {
    const primary = screen.getPrimaryDisplay();
    const primaryWin = this.windows.get(primary.id);
    if (primaryWin && !primaryWin.isDestroyed()) {
      this.setExpandedForSender(primaryWin.webContents, expanded);
    }
  }

  reposition(): void {
    const allDisplays = screen.getAllDisplays();
    for (const display of allDisplays) {
      const win = this.windows.get(display.id);
      if (win && !win.isDestroyed()) {
        this.repositionWindow(display, win);
      }
    }
  }

  toggle(preloadPath: string, rendererUrl?: string): void {
    let hasVisible = false;
    for (const win of this.windows.values()) {
      if (!win.isDestroyed() && win.isVisible()) {
        hasVisible = true;
        win.hide();
      }
    }

    if (!hasVisible) {
      this.createOrShow(preloadPath, rendererUrl);
      for (const win of this.windows.values()) {
        if (!win.isDestroyed()) {
          win.show();
        }
      }
    }
  }

  getWindow(): BrowserWindow | null {
    const primary = screen.getPrimaryDisplay();
    const primaryWin = this.windows.get(primary.id);
    if (primaryWin && !primaryWin.isDestroyed()) {
      return primaryWin;
    }
    for (const win of this.windows.values()) {
      if (!win.isDestroyed()) return win;
    }
    return null;
  }

  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values()).filter((w) => !w.isDestroyed());
  }
}
