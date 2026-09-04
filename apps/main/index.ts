// Copyright (c) 2026 Tarunya K. All Rights Reserved.
// Proprietary and confidential. Unauthorized use, copying, modification,
// or distribution of this file, via any medium, is strictly prohibited.
// See LICENSE in the root of this repository.

import { app, session, powerMonitor, nativeImage, systemPreferences } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseConnection } from '@database/connection';
import { SQLiteGoalRepository } from '@database/repository/goal-repository';
import { SettingsRepository } from '@database/repository/settings-repository';
import { GoalService } from '@core/services/goal-service';
import { MainWindowController } from './windows/MainWindow';
import { TrayPopoverController } from './windows/TrayPopoverWindow';
import { IslandWindowController } from './windows/IslandWindow';
import { PaletteWindowController } from './windows/PaletteWindow';
import { TrayController } from './tray/TrayController';
import { ShortcutManager } from './shortcuts/ShortcutManager';
import { registerIpcHandlers } from './ipc/goalHandlers';
import fs from 'fs';

// Setup __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
const RENDERER_URL = process.env.VITE_DEV_SERVER_URL;

const PRELOAD_PATH = fs.existsSync(path.join(__dirname, '../preload/index.cjs'))
  ? path.join(__dirname, '../preload/index.cjs')
  : path.join(__dirname, '../preload/index.js');

// Enforce single instance in production, allow hot-reloading in dev
if (!isDev) {
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  }
}

class BeaconApp {
  private db = DatabaseConnection.getDatabase();
  private goalRepository = new SQLiteGoalRepository(this.db);
  private settingsRepository = new SettingsRepository(this.db);
  private goalService = new GoalService(this.goalRepository);

  private mainWindow = new MainWindowController();
  private popoverWindow = new TrayPopoverController();
  private islandWindow = new IslandWindowController();
  private paletteWindow = new PaletteWindowController();

  private trayController: TrayController;
  private shortcutManager: ShortcutManager;

  constructor() {
    this.trayController = new TrayController(
      this.popoverWindow,
      this.mainWindow,
      this.goalService,
      PRELOAD_PATH,
      RENDERER_URL
    );

    this.shortcutManager = new ShortcutManager(
      this.paletteWindow,
      PRELOAD_PATH,
      RENDERER_URL
    );
  }

  async start(): Promise<void> {
    // Register all IPC handlers
    registerIpcHandlers(
      this.goalService,
      this.settingsRepository,
      this.mainWindow,
      this.paletteWindow,
      this.islandWindow,
      this.popoverWindow,
      PRELOAD_PATH,
      RENDERER_URL
    );

    // Initialize Tray
    this.trayController.initialize();

    // Register global shortcuts (⌘⇧B)
    const settings = this.settingsRepository.getSettings();
    this.shortcutManager.register(settings.globalShortcut);

    // Initialize Dynamic Island overlay
    this.islandWindow.createOrShow(PRELOAD_PATH, RENDERER_URL);

    // Open Main Window
    this.mainWindow.createOrShow(PRELOAD_PATH, RENDERER_URL);
  }

  showMainWindow(): void {
    this.mainWindow.createOrShow(PRELOAD_PATH, RENDERER_URL);
  }

  cleanup(): void {
    this.shortcutManager.unregisterAll();
    DatabaseConnection.close();
  }
}

let beaconApp: BeaconApp | null = null;

app.on('before-quit', () => {
  (app as any).isQuitting = true;
});

app.on('second-instance', () => {
  beaconApp?.showMainWindow();
});

app.whenReady().then(async () => {
  // ─── Security: Content Security Policy ──────────────────────────────────────
  // Restrict what content can be loaded in any renderer. Blocks eval(),
  // remote scripts, and inline event handlers outside trusted self-origin.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const csp = isDev
      // Development: allow Vite HMR WebSocket and eval (V8 dev tools need it)
      ? "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:* http://localhost:*; img-src 'self' data: blob:; font-src 'self' data:;"
      // Production: strict — no eval, no remote resources
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: blob:; font-src 'self' data:;";

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    });
  });

  // ─── Security: Deny unsolicited web permission requests ─────────────────────
  // Prevents any renderer from requesting mic, camera, geolocation, etc.
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  // ─── Performance: React to macOS sleep/wake cycle ───────────────────────────
  powerMonitor.on('suspend', () => {
    // Future: pause AI polling / media polling on macOS sleep
  });

  powerMonitor.on('resume', () => {
    // Future: resume services on macOS wake
  });

  // ─── macOS Accessibility: Deferred, non-blocking check ──────────────────────
  // We check trust status WITHOUT prompting (false). If the user tries a feature
  // that needs accessibility (e.g. global shortcut fails), the renderer sends
  // an IPC event that triggers a user-initiated dialog. We never pop a system
  // dialog automatically at startup — that is poor macOS UX per HIG.
  if (process.platform === 'darwin') {
    try {
      // false = query only, does not trigger a system permission dialog
      const trusted = systemPreferences.isTrustedAccessibilityClient(false);
      if (!trusted) {
        // Store status — ShortcutManager will surface an in-app nudge if needed
        process.env.BEACON_ACCESSIBILITY_TRUSTED = 'false';
      } else {
        process.env.BEACON_ACCESSIBILITY_TRUSTED = 'true';
      }
    } catch {
      // Graceful fallback — accessibility is optional for core functionality
      process.env.BEACON_ACCESSIBILITY_TRUSTED = 'unknown';
    }
  }

  // ─── Dock icon on macOS ─────────────────────────────────────────────────────
  if (process.platform === 'darwin' && app.dock) {
    try {
      const candidatePaths = [
        path.join(app.getAppPath(), 'assets/Beacon.png'),
        path.join(__dirname, '../../assets/Beacon.png'),
        path.resolve(process.cwd(), 'assets/Beacon.png'),
      ];
      for (const p of candidatePaths) {
        const icon = nativeImage.createFromPath(p);
        if (!icon.isEmpty()) {
          app.dock.setIcon(icon);
          break;
        }
      }
    } catch {
      // Graceful fallback if asset path isn't resolved in packaged app
    }
    app.dock.show();
  }

  beaconApp = new BeaconApp();
  await beaconApp.start();

  app.on('activate', () => {
    beaconApp?.showMainWindow();
  });
});

app.on('window-all-closed', () => {
  // macOS convention: keep app alive in menu bar and dynamic island
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  beaconApp?.cleanup();
});
