// apps/main/windows/MainWindow.ts
import { BrowserWindow, app } from '@electron-bridge';
import path from 'path';

export type MainSurface = 'today' | 'goals' | 'focus' | 'review';

export class MainWindowController {
  private window: BrowserWindow | null = null;

  createOrShow(preloadPath: string, rendererUrl?: string): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      if (this.window.isMinimized()) this.window.restore();
      this.window.setMinimumSize(1080, 720);
      const [currW, currH] = this.window.getSize();
      if (currW < 1080 || currH < 720) {
        this.window.setSize(Math.max(currW, 1200), Math.max(currH, 820), true);
      }
      this.window.show();
      this.window.focus();
      return this.window;
    }

    this.window = new BrowserWindow({
      width: 1200,
      height: 820,
      minWidth: 1080,
      minHeight: 720,
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

    // Forward web console messages to terminal in dev mode
    this.window.webContents.on('console-message', (_event, level, message) => {
      if (level >= 2 || process.env.NODE_ENV !== 'production') {
        console.log('[Main Web]', message);
      }
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

  navigate(surface: MainSurface): void {
    const send = () => this.window?.webContents.send('beacon:event:navigate', surface);
    if (!this.window || this.window.isDestroyed()) return;
    if (this.window.webContents.isLoading()) this.window.webContents.once('did-finish-load', send);
    else send();
  }
}
