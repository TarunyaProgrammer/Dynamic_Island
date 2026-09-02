// apps/main/index.ts - Electron Main Process Entrypoint
import { app, session, powerMonitor, nativeImage } from 'electron';
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

// Setup __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Development server URL or packaged paths
const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
const RENDERER_URL = process.env.VITE_DEV_SERVER_URL;
const PRELOAD_PATH = path.join(__dirname, '../preload/index.js');

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
  // Security: Deny all unsolicited web permission requests (mic, camera, geolocation)
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  // Performance: Pause background services on macOS sleep and resume on wake
  powerMonitor.on('suspend', () => {
    // macOS sleep
  });

  powerMonitor.on('resume', () => {
    // macOS wake
  });

  // Dock icon visibility on macOS
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
      // Graceful fallback if asset path isn't resolved
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
  // Keep alive on macOS for menu-bar & dynamic island
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  beaconApp?.cleanup();
});
