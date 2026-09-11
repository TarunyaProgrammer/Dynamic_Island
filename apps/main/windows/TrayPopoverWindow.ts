// apps/main/windows/TrayPopoverWindow.ts
import { BrowserWindow, type Rectangle, app, screen } from '@electron-bridge';
import path from 'path';

export class TrayPopoverController {
  private window: BrowserWindow | null = null;

  createOrGet(preloadPath: string, rendererUrl?: string): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      return this.window;
    }

    this.window = new BrowserWindow({
      width: 380,
      height: 480,
      show: false,
      frame: false,
      resizable: false,
      movable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      vibrancy: 'popover',
      visualEffectState: 'active',
      backgroundColor: '#00000000',
      transparent: true,
      hasShadow: true,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,            // Required: better-sqlite3 native module cannot run in sandbox
        webSecurity: true,          // Enforce same-origin policy
        allowRunningInsecureContent: false, // Block mixed HTTP/HTTPS content
        spellcheck: false,          // Unnecessary feature — removes IPC overhead
      },
    });

    // Forward web console messages to terminal in dev mode
    this.window.webContents.on('console-message', (_event, level, message) => {
      if (level >= 2 || process.env.NODE_ENV !== 'production') {
        console.log('[Tray Web]', message);
      }
    });

    if (rendererUrl) {
      this.window.loadURL(`${rendererUrl}?surface=tray`);
    } else {
      this.window.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        query: { surface: 'tray' },
      });
    }

    this.window.on('blur', () => {
      this.hide();
    });

    this.window.on('closed', () => {
      this.window = null;
    });

    return this.window;
  }

  showAt(trayBounds: Rectangle, preloadPath: string, rendererUrl?: string): void {
    const win = this.createOrGet(preloadPath, rendererUrl);
    const winBounds = win.getBounds();
    const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y });

    // Calculate x centered on tray icon, constrained to display
    const x = Math.round(
      Math.max(
        display.bounds.x + 10,
        Math.min(
          display.bounds.x + display.bounds.width - winBounds.width - 10,
          trayBounds.x + trayBounds.width / 2 - winBounds.width / 2
        )
      )
    );

    const y = Math.round(trayBounds.y + trayBounds.height + 4);

    win.setPosition(x, y, false);
    win.show();
    win.focus();
  }

  hide(): void {
    if (this.window && !this.window.isDestroyed() && this.window.isVisible()) {
      this.window.hide();
    }
  }

  toggle(trayBounds: Rectangle, preloadPath: string, rendererUrl?: string): void {
    if (this.window && !this.window.isDestroyed() && this.window.isVisible()) {
      this.hide();
    } else {
      this.showAt(trayBounds, preloadPath, rendererUrl);
    }
  }

  getWindow(): BrowserWindow | null {
    return this.window;
  }
}
