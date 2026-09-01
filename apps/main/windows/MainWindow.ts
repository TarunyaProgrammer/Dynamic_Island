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
      width: 960,
      height: 680,
      minWidth: 720,
      minHeight: 520,
      title: 'Beacon',
      titleBarStyle: 'hiddenInset',
      vibrancy: 'under-window',
      visualEffectState: 'active',
      backgroundColor: '#00000000',
      show: false,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    if (rendererUrl) {
      this.window.loadURL(`${rendererUrl}?surface=main`);
    } else {
      this.window.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
        query: { surface: 'main' },
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
