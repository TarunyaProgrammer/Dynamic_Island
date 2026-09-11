// apps/main/notifications/NotificationService.ts
import { Notification } from '@electron-bridge';

export class NotificationService {
  static notifyGoalReminder(goalTitle: string, handlers: { onDone: () => void; onSnooze: () => void; onSkip: () => void; onOpenToday: () => void }): void {
    if (!Notification.isSupported()) return;
    const notification = new Notification({
      title: 'A small step, when you are ready',
      body: `Resume today: ${goalTitle}`,
      silent: true,
      actions: [{ type: 'button', text: 'Done' }, { type: 'button', text: 'Snooze 1h' }, { type: 'button', text: 'Skip today' }, { type: 'button', text: 'Open Beacon' }],
    } as any);
    notification.on('click', handlers.onOpenToday);
    notification.on('action' as any, (_event: unknown, index: number) => [handlers.onDone, handlers.onSnooze, handlers.onSkip, handlers.onOpenToday][index]?.());
    notification.show();
  }

  static notifyGoalCompleted(goalTitle: string): void {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Goal completed',
        body: `"${goalTitle}" is complete.`,
        silent: false,
      }).show();
    }
  }

  static notifyMilestoneCompleted(goalTitle: string, milestoneTitle: string): void {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Milestone reached',
        body: `"${milestoneTitle}" in ${goalTitle}`,
        silent: true,
      }).show();
    }
  }

  static notifyFocusCompleted(goalName?: string, durationMinutes = 25): void {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Focus complete',
        body: goalName
          ? `${durationMinutes} minutes logged toward "${goalName}".`
          : `${durationMinutes} minutes of focus are complete.`,
        silent: false,
      }).show();
    }
  }
}
