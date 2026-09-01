// apps/main/notifications/NotificationService.ts
import { Notification } from 'electron';

export class NotificationService {
  static notifyGoalCompleted(goalTitle: string): void {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Goal Completed! 🎉',
        body: `You achieved "${goalTitle}"!`,
        silent: false,
      }).show();
    }
  }

  static notifyMilestoneCompleted(goalTitle: string, milestoneTitle: string): void {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Milestone Reached! ✨',
        body: `"${milestoneTitle}" in ${goalTitle}`,
        silent: true,
      }).show();
    }
  }
}
