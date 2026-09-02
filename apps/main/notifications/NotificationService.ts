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

  static notifyFocusCompleted(goalName?: string, durationMinutes = 25): void {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Focus Sprint Complete! 🎉',
        body: goalName
          ? `Finished ${durationMinutes}m sprint for "${goalName}". Great work!`
          : `Finished ${durationMinutes}m focus sprint! Time for a short break.`,
        silent: false,
      }).show();
    }
  }
}
