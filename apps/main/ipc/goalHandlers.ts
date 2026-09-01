// apps/main/ipc/goalHandlers.ts - Central IPC Bridge Handlers
import { BrowserWindow, app, ipcMain } from 'electron';
import { IPC_CHANNELS } from '@shared/ipc-channels';
import { AppSettings, GoalDraft, GoalStatus, GoalUpdateDraft } from '@shared/types';
import { GoalService } from '@core/services/goal-service';
import { SettingsRepository } from '@database/repository/settings-repository';
import { NotificationService } from '../notifications/NotificationService';
import { MainWindowController } from '../windows/MainWindow';
import { PaletteWindowController } from '../windows/PaletteWindow';
import { IslandWindowController } from '../windows/IslandWindow';
import { TrayPopoverController } from '../windows/TrayPopoverWindow';

export function registerIpcHandlers(
  goalService: GoalService,
  settingsRepo: SettingsRepository,
  mainWindow: MainWindowController,
  paletteWindow: PaletteWindowController,
  islandWindow: IslandWindowController,
  popoverWindow: TrayPopoverController,
  preloadPath: string,
  rendererUrl?: string
): void {
  // Broadcast helper
  const broadcastGoalsChanged = () => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.EVENT_GOALS_CHANGED);
      }
    }
  };

  const broadcastSettingsChanged = (settings: AppSettings) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send(IPC_CHANNELS.EVENT_SETTINGS_CHANGED, settings);
      }
    }
  };

  goalService.subscribe(broadcastGoalsChanged);

  // Goal queries & mutations
  ipcMain.handle(IPC_CHANNELS.GOALS_LIST, (_, status?: GoalStatus) => {
    return goalService.listGoals(status);
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_GET, (_, id: string) => {
    return goalService.getGoal(id);
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_CREATE, (_, draft: GoalDraft) => {
    return goalService.createGoal(draft);
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_UPDATE, (_, id: string, update: GoalUpdateDraft) => {
    return goalService.updateGoal(id, update);
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_DELETE, (_, id: string) => {
    return goalService.deleteGoal(id);
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_COMPLETE, (_, id: string) => {
    const completed = goalService.completeGoal(id);
    NotificationService.notifyGoalCompleted(completed.name);
    return completed;
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_ARCHIVE, (_, id: string) => {
    return goalService.archiveGoal(id);
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_INCREMENT, (_, goalId: string, delta?: number, note?: string) => {
    const prev = goalService.getGoal(goalId);
    const updated = goalService.incrementProgress(goalId, delta, note);
    if (prev?.status === 'active' && updated.status === 'completed') {
      NotificationService.notifyGoalCompleted(updated.name);
    }
    return updated;
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_SET_PROGRESS, (_, goalId: string, value: number, note?: string) => {
    const prev = goalService.getGoal(goalId);
    const updated = goalService.setProgress(goalId, value, note);
    if (prev?.status === 'active' && updated.status === 'completed') {
      NotificationService.notifyGoalCompleted(updated.name);
    }
    return updated;
  });

  // Milestones
  ipcMain.handle(IPC_CHANNELS.MILESTONES_CREATE, (_, goalId: string, title: string, contribution?: number) => {
    return goalService.addMilestone(goalId, title, contribution);
  });

  ipcMain.handle(IPC_CHANNELS.MILESTONES_TOGGLE, (_, goalId: string, milestoneId: string) => {
    const updated = goalService.toggleMilestone(goalId, milestoneId);
    const m = updated.milestones.find((item) => item.id === milestoneId);
    if (m?.isCompleted) {
      NotificationService.notifyMilestoneCompleted(updated.name, m.title);
    }
    return updated;
  });

  ipcMain.handle(IPC_CHANNELS.MILESTONES_DELETE, (_, goalId: string, milestoneId: string) => {
    return goalService.deleteMilestone(goalId, milestoneId);
  });

  // History & Undo / Redo
  ipcMain.handle(IPC_CHANNELS.HISTORY_EVENTS, (_, goalId?: string, limit?: number) => {
    return goalService.getHistory(goalId, limit);
  });

  ipcMain.handle(IPC_CHANNELS.HISTORY_UNDO, () => {
    return goalService.undo();
  });

  ipcMain.handle(IPC_CHANNELS.HISTORY_REDO, () => {
    return goalService.redo();
  });

  // Stats
  ipcMain.handle(IPC_CHANNELS.STATS_GET, () => {
    return goalService.getStats();
  });

  // Settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return settingsRepo.getSettings();
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_UPDATE, (_, partial: Partial<AppSettings>) => {
    const updated = settingsRepo.updateSettings(partial);
    broadcastSettingsChanged(updated);
    return updated;
  });

  // Window Controls
  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_MAIN, () => {
    mainWindow.toggle(preloadPath, rendererUrl);
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_PALETTE, () => {
    paletteWindow.toggle(preloadPath, rendererUrl);
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_TOGGLE_ISLAND, () => {
    islandWindow.toggle(preloadPath, rendererUrl);
  });

  ipcMain.handle(IPC_CHANNELS.WINDOW_HIDE_POPOVER, () => {
    popoverWindow.hide();
  });

  ipcMain.handle(IPC_CHANNELS.APP_QUIT, () => {
    app.quit();
  });
}
