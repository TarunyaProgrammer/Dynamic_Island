// apps/main/windows/IslandWindow.ts
import { BrowserWindow, app, screen } from 'electron';
import path from 'path';

export class IslandWindowController {
  private window: BrowserWindow | null = null;

  createOrShow(preloadPath: string, rendererUrl?: string): BrowserWindow {
    if (this.window && !this.window.isDestroyed()) {
      this.reposition();
      this.window.show();
      return this.window;
    }

    const primary = screen.getPrimaryDisplay();
    const width = 360;
    const height = 180;
    const x = Math.round(primary.bounds.x + (primary.bounds.width - width) / 2);
    const y = primary.bounds.y;

    this.window = new BrowserWindow({
      width,
      height,
      x,
      y,
      show: false,
      frame: false,
      transparent: true,
      hasShadow: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      focusable: false,
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
    this.window.setAlwaysOnTop(true, 'screen-saver');

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

  reposition(): void {
    if (!this.window || this.window.isDestroyed()) return;
    const primary = screen.getPrimaryDisplay();
    const bounds = this.window.getBounds();
    const x = Math.round(primary.bounds.x + (primary.bounds.width - bounds.width) / 2);
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
