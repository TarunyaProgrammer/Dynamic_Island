// apps/main/windows/IslandWindow.ts
// Fixed 660×180 Dynamic Island window.
// Pure CSS handles expand (640×160) and collapse (240×32).
// No setSize resizing (prevents clipping).
// No setIgnoreMouseEvents (ensures all native clicks on tabs, buttons, inputs work 100%).
import { BrowserWindow, app, screen } from 'electron';
import path from 'path';

export class IslandWindowController {
  private window: BrowserWindow | null = null;

  // Window canvas is always 660×180
  public static readonly W = 660;
  public static readonly H = 180;

  createOrShow(preloadPath: string, rendererUrl?: string): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      this.reposition();
      this.window.show();
      this.window.focus();
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
      focusable: true,
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
    // 'pop-up-menu' level: floats above full-screen apps and status bar while remaining fully interactive
    this.window.setAlwaysOnTop(true, 'pop-up-menu');

    // Forward web console messages to terminal
    this.window.webContents.on('console-message', (_event, _level, message) => {
      console.log('[Island Web]', message);
    });

    if (rendererUrl) {
      this.window.loadURL(`${rendererUrl}?surface=island`);
    } else {
      this.window.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        query: { surface: 'island' },
      });
    }

    this.window.once('ready-to-show', () => {
      this.window?.show();
    });

    this.window.on('closed', () => {
      this.window = null;
    });

    return this.window;
  }

  setExpanded(expanded: boolean): void {
    if (!this.window || this.window.isDestroyed()) return;
    if (expanded) {
      this.window.focus();
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
