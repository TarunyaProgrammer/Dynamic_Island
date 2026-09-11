import type { ProgressEvent } from '@shared/types';

/**
 * The database returns history newest-first, but keeping this ordering local
 * means Today remains correct when events arrive from another renderer too.
 */
export function recentProgressEvents(events: readonly ProgressEvent[], limit = 5): ProgressEvent[] {
  return [...events]
    .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp))
    .slice(0, limit);
}

export function hasProgressToday(events: readonly ProgressEvent[], today = new Date()): boolean {
  return events.some((event) => {
    const timestamp = new Date(event.timestamp);
    return timestamp.getFullYear() === today.getFullYear()
      && timestamp.getMonth() === today.getMonth()
      && timestamp.getDate() === today.getDate();
  });
}
