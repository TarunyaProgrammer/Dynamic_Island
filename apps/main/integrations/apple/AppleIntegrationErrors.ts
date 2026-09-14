/** Converts native EventKit helper failures into a next step a person can take. */
export function shouldFallbackToJxa(error: unknown): boolean {
  const detail = error instanceof Error ? error.message : String(error);
  return detail.includes('BeaconEventKitHelper binary not found');
}

export function describeAppleIntegrationError(command: string, error: unknown): string {
  const rawDetail = error instanceof Error ? error.message : String(error);
  const label = command === 'reminders' ? 'Reminders' : 'Calendar';

  // Sanitize — strip the raw JXA/osascript script body from the message.
  // It can be 500+ chars and is never useful to show in the UI.
  const sanitized = rawDetail
    .replace(/Command failed:[\s\S]*/s, '')  // Remove "Command failed: osascript…" block
    .replace(/osascript[\s\S]*/s, '')         // Any remaining osascript trace
    .trim()
    .slice(0, 200);                           // Hard cap

  if (rawDetail.includes(`${label} access was not granted`) || rawDetail.includes('not authorized')) {
    return `Beacon needs ${label} access. Open System Settings → Privacy & Security → ${label} and allow Beacon, then try again.`;
  }
  if (rawDetail.includes('ETIMEDOUT') || rawDetail.includes('timed out')) {
    return `${label} took too long to respond. Make sure the ${label} app is running, then try again.`;
  }
  if (rawDetail.includes('unavailable') || rawDetail.includes('-600') || rawDetail.includes("Can't get")) {
    return `${label} is not responding. Open the ${label} app once, then click Refresh.`;
  }
  if (!sanitized) {
    return `${label} is unavailable. Open the ${label} app once, then try again.`;
  }
  return `${label} error: ${sanitized}`;
}
