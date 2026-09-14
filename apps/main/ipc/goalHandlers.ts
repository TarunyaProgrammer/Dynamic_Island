// apps/main/ipc/goalHandlers.ts - Central IPC Bridge Handlers
import { BrowserWindow, app, dialog, ipcMain, shell } from '@electron-bridge';
import { IPC_CHANNELS } from '@shared/ipc-channels';
import { AppSettings, CompanionEvent, GoalDraft, GoalStatus, GoalUpdateDraft, LiveActivity, FocusSessionState, FocusCompletedEvent, ReminderPolicy } from '@shared/types';
import { isCompanionEvent } from '@shared/companion';
import { GoalService } from '@core/services/goal-service';
import { SettingsRepository } from '@database/repository/settings-repository';
import { ActivityEngine } from '@core/activities/activity-engine';
import { FocusSessionManager } from '@core/activities/focus-manager';
import { NotificationService } from '../notifications/NotificationService';
import { MainWindowController } from '../windows/MainWindow';
import { PaletteWindowController } from '../windows/PaletteWindow';
import { IslandWindowController } from '../windows/IslandWindow';
import { TrayPopoverController } from '../windows/TrayPopoverWindow';
import { CredentialRepository } from '@database/repository/credential-repository';
import { DatabaseConnection } from '@database/connection';
import { SQLiteGoalRepository } from '@database/repository/goal-repository';
import { FocusSessionRepository } from '@database/repository/focus-session-repository';
import { ReminderPolicyService } from '@core/services/reminder-policy-service';
import { ReminderPolicyRepository } from '@database/repository/reminder-policy-repository';
import { WeeklyReviewService } from '@core/services/weekly-review-service';
import { DataTrustService } from '../data/DataTrustService';
import { AppleCalendarService } from '../integrations/apple/AppleCalendarService';
import path from 'path';
import { registerAIHandlers } from './aiHandlers';
import type { DailyServices } from '../daily/DailyServices';

export function registerIpcHandlers(
  goalService: GoalService,
  settingsRepo: SettingsRepository,
  mainWindow: MainWindowController,
  paletteWindow: PaletteWindowController,
  islandWindow: IslandWindowController,
  popoverWindow: TrayPopoverController,
  preloadPath: string,
  rendererUrl?: string,
  dailyServices?: DailyServices,
): void {
  // Initialize Activity Engine and Goal-Linked Focus Manager
  const activityEngine = new ActivityEngine();
  const focusManager = new FocusSessionManager(goalService, activityEngine);
  const database = DatabaseConnection.getDatabase();
  if (!dailyServices) throw new Error('Daily services must be initialized before IPC handlers.');
  const { actionRepository, actionService, todayService } = dailyServices;
  const focusSessions = new FocusSessionRepository(database);
  const reminderPolicyService = new ReminderPolicyService(new ReminderPolicyRepository(database), { record: (operation) => dailyServices.operationLog.append(operation) });
  const dataTrust = new DataTrustService(database, path.join(app.getPath('userData'), 'backups'));
  const appleCalendar = new AppleCalendarService();

  // Safe broadcast helper to prevent crashes when windows reload or close
  const safeBroadcast = (channel: string, ...args: any[]) => {
    for (const win of BrowserWindow.getAllWindows()) {
      try {
        if (!win.isDestroyed() && !win.webContents.isDestroyed() && !win.webContents.isCrashed()) {
          win.webContents.send(channel, ...args);
        }
      } catch {
        // Ignore errors if render frame was disposed during Vite HMR / reload
      }
    }
  };

  const broadcastGoalsChanged = () => {
    safeBroadcast(IPC_CHANNELS.EVENT_GOALS_CHANGED);
  };
  const broadcastTodayChanged = () => safeBroadcast(IPC_CHANNELS.EVENT_TODAY_CHANGED);
  const broadcastRemindersChanged = () => safeBroadcast(IPC_CHANNELS.EVENT_REMINDERS_CHANGED);

  // Initialize AI Orchestrator & Credential Vault
  const credentialRepo = new CredentialRepository((settingsRepo as any).db);
  registerAIHandlers(goalService, focusManager, settingsRepo, credentialRepo, broadcastGoalsChanged);

  const broadcastSettingsChanged = (settings: AppSettings) => {
    safeBroadcast(IPC_CHANNELS.EVENT_SETTINGS_CHANGED, settings);
  };

  const broadcastActivitiesChanged = (stack: LiveActivity[]) => {
    safeBroadcast(IPC_CHANNELS.EVENT_ACTIVITIES_CHANGED, stack);
  };

  const broadcastFocusTick = (state: FocusSessionState) => {
    safeBroadcast(IPC_CHANNELS.EVENT_FOCUS_TICK, state);
  };

  const broadcastFocusCompleted = (event: FocusCompletedEvent) => {
    const session = focusSessions.save(event);
    dailyServices.operationLog.append({ entityType: 'focus-session', entityId: session.id, kind: 'upsert', payload: session as unknown as Record<string, unknown> });
    NotificationService.notifyFocusCompleted(event.goalName, event.durationMinutes);
    safeBroadcast(IPC_CHANNELS.EVENT_FOCUS_COMPLETED, event);
  };

  const broadcastCompanionChanged = (event: CompanionEvent) => {
    safeBroadcast(IPC_CHANNELS.EVENT_COMPANION_CHANGED, event);
  };

  goalService.subscribe(broadcastGoalsChanged);
  actionService.subscribe(broadcastTodayChanged);
  todayService.subscribe(broadcastTodayChanged);
  reminderPolicyService.subscribe(broadcastRemindersChanged);
  activityEngine.subscribe(broadcastActivitiesChanged);
  focusManager.subscribe(broadcastFocusTick);
  focusManager.onComplete(broadcastFocusCompleted);

  ipcMain.handle(IPC_CHANNELS.COMPANION_EMIT, (_event, value: unknown) => {
    if (!isCompanionEvent(value)) {
      throw new Error('Invalid companion event');
    }
    broadcastCompanionChanged(value);
  });

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
    try {
      const plan = todayService.getPlan();
      const openActions = plan.entries
        .map((e) => actionService.get(e.actionId))
        .filter((act): act is NonNullable<typeof act> => act !== null && act.goalId === id && act.status === 'open');
      for (const act of openActions) {
        actionService.complete(act.id);
      }
      if (openActions.length > 0) {
        broadcastTodayChanged();
      }
    } catch {
      // Non-blocking sync
    }
    return completed;
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_ARCHIVE, (_, id: string) => {
    return goalService.archiveGoal(id);
  });

  ipcMain.handle(IPC_CHANNELS.ACTIONS_LIST_FOR_GOAL, (_, goalId: string) => actionService.listForGoal(goalId));
  ipcMain.handle(IPC_CHANNELS.ACTIONS_LIST_OPEN_FOR_GOALS, (_, goalIds: string[]) => actionService.listOpenForGoalIds(goalIds));
  ipcMain.handle(IPC_CHANNELS.ACTIONS_GET, (_, id: string) => actionService.get(id));
  ipcMain.handle(IPC_CHANNELS.ACTIONS_CREATE, (_, input: { goalId: string; title: string; plannedDate?: string; estimatedMinutes?: number }) => actionService.create(input));
  ipcMain.handle(IPC_CHANNELS.ACTIONS_UPDATE, (_, id: string, input: { title?: string; plannedDate?: string; estimatedMinutes?: number }) => actionService.update(id, input));
  ipcMain.handle(IPC_CHANNELS.ACTIONS_COMPLETE, (_, id: string) => actionService.complete(id));
  ipcMain.handle(IPC_CHANNELS.ACTIONS_SKIP, (_, id: string, reason) => actionService.skip(id, reason));
  ipcMain.handle(IPC_CHANNELS.ACTIONS_ARCHIVE, (_, id: string) => actionService.archive(id));
  ipcMain.handle(IPC_CHANNELS.TODAY_GET, (_, date?: string) => todayService.getPlan(date));
  ipcMain.handle(IPC_CHANNELS.TODAY_PLAN_ACTION, (_, actionId: string, date?: string) => todayService.planAction(actionId, date));
  ipcMain.handle(IPC_CHANNELS.TODAY_MOVE_ACTION, (_, actionId: string, bucket, date?: string) => todayService.move(actionId, bucket, date));
  ipcMain.handle(IPC_CHANNELS.TODAY_REMOVE_ACTION, (_, actionId: string, date?: string) => todayService.remove(actionId, date));
  ipcMain.handle(IPC_CHANNELS.TODAY_RESCHEDULE_ACTION, (_, actionId: string, targetDate: string, sourceDate?: string) => todayService.reschedule(actionId, targetDate, sourceDate));
  ipcMain.handle(IPC_CHANNELS.REMINDERS_GET_POLICY, (_, goalId: string) => reminderPolicyService.get(goalId));
  ipcMain.handle(IPC_CHANNELS.REMINDERS_SAVE_POLICY, (_, policy: Omit<ReminderPolicy, 'updatedAt'>) => {
    if (!goalService.getGoal(policy.goalId)) throw new Error('Goal not found');
    return reminderPolicyService.save(policy);
  });
  ipcMain.handle(IPC_CHANNELS.WEEKLY_REVIEW_GET, () => new WeeklyReviewService(new SQLiteGoalRepository(database), (since) => focusSessions.totalMinutesSince(since)).getReview());
  ipcMain.handle(IPC_CHANNELS.DATA_CREATE_BACKUP, () => dataTrust.createBackup());
  ipcMain.handle(IPC_CHANNELS.DATA_EXPORT_JSON, async () => {
    const result = await dialog.showSaveDialog({ title: 'Export Beacon data', defaultPath: 'beacon-export.json', filters: [{ name: 'Beacon export', extensions: ['json'] }] });
    if (result.canceled || !result.filePath) return null;
    dataTrust.writeExport(result.filePath);
    return result.filePath;
  });
  ipcMain.handle(IPC_CHANNELS.DATA_EXPORT_CSV, async (_, kind: 'goals' | 'progress') => {
    const result = await dialog.showSaveDialog({ title: 'Export Beacon CSV', defaultPath: `beacon-${kind}.csv`, filters: [{ name: 'CSV', extensions: ['csv'] }] });
    if (result.canceled || !result.filePath) return null;
    dataTrust.writeCsv(result.filePath, kind);
    return result.filePath;
  });
  ipcMain.handle(IPC_CHANNELS.DATA_PREVIEW_IMPORT, async () => {
    const result = await dialog.showOpenDialog({ title: 'Choose a Beacon export', properties: ['openFile'], filters: [{ name: 'Beacon export', extensions: ['json'] }] });
    if (result.canceled || !result.filePaths[0]) return null;
    return { filePath: result.filePaths[0], ...dataTrust.previewImport(result.filePaths[0]) };
  });
  ipcMain.handle(IPC_CHANNELS.DATA_IMPORT_JSON, (_, filePath: string) => {
    dataTrust.importSnapshot(filePath);
    // A restore replaces multiple normalized tables atomically; every surface
    // must refresh from the restored local source of truth immediately.
    broadcastGoalsChanged();
    broadcastTodayChanged();
    broadcastRemindersChanged();
    broadcastSettingsChanged(settingsRepo.getSettings());
  });
  ipcMain.handle(IPC_CHANNELS.APPLE_CALENDAR_TODAY, () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    return appleCalendar.events(start, end);
  });
  ipcMain.handle(IPC_CHANNELS.APPLE_OPEN_CALENDAR_SETTINGS, () =>
    shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Calendars'),
  );
  ipcMain.handle(IPC_CHANNELS.APPLE_REMINDERS_LIST, () => appleCalendar.reminders());
  ipcMain.handle(IPC_CHANNELS.APPLE_REMINDERS_IMPORT, (_, goalId: string, reminder: { id: string; title: string; dueDate?: string }) => {
    if (!goalService.getGoal(goalId)) throw new Error('Goal not found');
    const sourceId = `apple-reminder:${reminder.id}`;
    const existing = actionRepository.findByExternalSourceId(sourceId);
    if (existing) return existing;
    return actionService.create({ goalId, title: reminder.title, source: 'calendar', plannedDate: reminder.dueDate?.slice(0, 10), externalSourceId: sourceId });
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_INCREMENT, (_, goalId: string, delta?: number, note?: string) => {
    const prev = goalService.getGoal(goalId);
    const updated = goalService.incrementProgress(goalId, delta, note);
    if (prev?.status === 'active' && updated.status === 'completed') {
      NotificationService.notifyGoalCompleted(updated.name);
    }
    try {
      const plan = todayService.getPlan();
      const openActions = plan.entries
        .map((e) => actionService.get(e.actionId))
        .filter((act): act is NonNullable<typeof act> => act !== null && act.goalId === goalId && act.status === 'open');
      if (openActions.length > 0) {
        actionService.complete(openActions[0].id);
        broadcastTodayChanged();
      }
    } catch {
      // Non-blocking sync
    }
    return updated;
  });

  ipcMain.handle(IPC_CHANNELS.GOALS_SET_PROGRESS, (_, goalId: string, value: number, note?: string) => {
    const prev = goalService.getGoal(goalId);
    const updated = goalService.setProgress(goalId, value, note);
    if (prev?.status === 'active' && updated.status === 'completed') {
      NotificationService.notifyGoalCompleted(updated.name);
    }
    if (updated.targetValue > 0 && updated.currentValue >= updated.targetValue) {
      try {
        const plan = todayService.getPlan();
        const openActions = plan.entries
          .map((e) => actionService.get(e.actionId))
          .filter((act): act is NonNullable<typeof act> => act !== null && act.goalId === goalId && act.status === 'open');
        for (const act of openActions) {
          actionService.complete(act.id);
        }
        if (openActions.length > 0) broadcastTodayChanged();
      } catch {
        // Non-blocking sync
      }
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

  ipcMain.handle(IPC_CHANNELS.ISLAND_SET_EXPANDED, (event, expanded: boolean) => {
    islandWindow.setExpandedForSender(event.sender, expanded);
  });

  ipcMain.handle(IPC_CHANNELS.APP_QUIT, () => {
    app.quit();
  });

  // Live Activities & Priority Queue Engine
  ipcMain.handle(IPC_CHANNELS.ACTIVITIES_GET_STACK, () => {
    return activityEngine.getStack();
  });

  ipcMain.handle(IPC_CHANNELS.ACTIVITIES_PUSH, (_, activity: any, ttlMs?: number) => {
    activityEngine.push(activity, ttlMs);
  });

  ipcMain.handle(IPC_CHANNELS.ACTIVITIES_DISMISS, (_, id: string) => {
    return activityEngine.dismiss(id);
  });

  // Goal-Linked Focus Sessions
  ipcMain.handle(IPC_CHANNELS.FOCUS_START, (_, durationMinutes?: number, goalId?: string, actionId?: string) => {
    if (actionId) {
      const action = actionRepository.getById(actionId);
      if (!action || action.goalId !== goalId || action.status !== 'open') throw new Error('Focus action must be an open action for this goal');
    }
    return focusManager.start(durationMinutes, goalId, actionId);
  });

  ipcMain.handle(IPC_CHANNELS.FOCUS_PAUSE, () => {
    return focusManager.pause();
  });

  ipcMain.handle(IPC_CHANNELS.FOCUS_RESUME, () => {
    return focusManager.resume();
  });

  ipcMain.handle(IPC_CHANNELS.FOCUS_STOP, (_, commitProgress?: boolean) => {
    return focusManager.stop(commitProgress);
  });

  ipcMain.handle(IPC_CHANNELS.FOCUS_EXTEND, (_, minutes?: number) => {
    return focusManager.extend(minutes);
  });

  ipcMain.handle(IPC_CHANNELS.FOCUS_GET_STATE, () => {
    return focusManager.getState();
  });

}
