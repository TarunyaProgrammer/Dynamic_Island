// apps/main/index.ts - Electron Main Process Entrypoint
import { app, BrowserWindow } from 'electron';
import path from 'path';
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

// Check single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// Development server URL or packaged paths
const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
const RENDERER_URL = process.env.VITE_DEV_SERVER_URL;
const PRELOAD_PATH = path.join(__dirname, '../preload/index.js');

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

    // Register global shortcuts
    const settings = this.settingsRepository.getSettings();
    this.shortcutManager.register(settings.globalShortcut);

    // Initialize Dynamic Island overlay
    this.islandWindow.createOrShow(PRELOAD_PATH, RENDERER_URL);

    // Show main window initially in dev, or keep glanceable in background
    if (isDev) {
      this.mainWindow.createOrShow(PRELOAD_PATH, RENDERER_URL);
    }
  }

  cleanup(): void {
    this.shortcutManager.unregisterAll();
    DatabaseConnection.close();
  }
}

let beaconApp: BeaconApp | null = null;

app.whenReady().then(async () => {
  // Hide dock icon by default for seamless menu-bar status bar operation on macOS
  // (dock icon reappears if explicitly desired or when main window is active)
  if (process.platform === 'darwin' && app.dock) {
    app.dock.show();
  }

  beaconApp = new BeaconApp();
  await beaconApp.start();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      beaconApp?.start();
    }
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
