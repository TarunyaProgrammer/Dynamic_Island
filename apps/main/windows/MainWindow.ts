// apps/main/windows/MainWindow.ts
import { BrowserWindow, app } from 'electron';
import path from 'path';

export class MainWindowController {
  private window: BrowserWindow | null = null;

  createOrShow(preloadPath: string, rendererUrl?: string): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      if (this.window.isMinimized()) this.window.restore();
      this.window.show();
      this.window.focus();
      return this.window;
    }

    this.window = new BrowserWindow({
      width: 1040,
      height: 720,
      minWidth: 880,
      minHeight: 620,
      title: 'Beacon',
      icon: path.join(app.getAppPath(), 'assets/Beacon.png'),
      titleBarStyle: 'hiddenInset',
      vibrancy: 'under-window',
      visualEffectState: 'active',
      backgroundColor: '#00000000',
      show: false,
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

    if (rendererUrl) {
      this.window.loadURL(`${rendererUrl}?surface=main`);
    } else {
      this.window.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        query: { surface: 'main' },
      });
    }

    // On macOS, closing the window hides it instead of destroying it
    this.window.on('close', (e) => {
      if (process.platform === 'darwin' && !(app as any).isQuitting) {
        e.preventDefault();
        this.window?.hide();
      }
    });

    this.window.once('ready-to-show', () => {
      this.window?.show();
    });

    this.window.on('closed', () => {
      this.window = null;
    });

    return this.window;
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
