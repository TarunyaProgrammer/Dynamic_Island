// apps/main/windows/PaletteWindow.ts
import { BrowserWindow, app } from 'electron';
import path from 'path';

export class PaletteWindowController {
  private window: BrowserWindow | null = null;

  createOrShow(preloadPath: string, rendererUrl?: string): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      this.window.center();
      this.window.show();
      this.window.focus();
      return this.window;
    }

    this.window = new BrowserWindow({
      width: 560,
      height: 380,
      show: false,
      frame: false,
      resizable: false,
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
        console.log('[Palette Web]', message);
      }
    });

    if (rendererUrl) {
      this.window.loadURL(`${rendererUrl}?surface=palette`);
    } else {
      this.window.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        query: { surface: 'palette' },
      });
    }

    this.window.on('blur', () => {
      this.hide();
    });

    this.window.on('closed', () => {
      this.window = null;
    });

    this.window.once('ready-to-show', () => {
      this.window?.center();
      this.window?.show();
      this.window?.focus();
    });

    return this.window;
  }

  hide(): void {
    if (this.window && !this.window.isDestroyed() && this.window.isVisible()) {
      this.window.hide();
    }
  }

  toggle(preloadPath: string, rendererUrl?: string): void {
    if (this.window && !this.window.isDestroyed() && this.window.isVisible()) {
      this.hide();
    } else {
      this.createOrShow(preloadPath, rendererUrl);
    }
  }

  getWindow(): BrowserWindow | null {
    return this.window;
  }
}
