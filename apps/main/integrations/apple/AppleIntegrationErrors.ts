/** Converts native EventKit helper failures into a next step a person can take. */
export function describeAppleIntegrationError(command: string, error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  const label = command === 'reminders' ? 'Reminders' : 'Calendar';
  if (detail.includes(`${label} access was not granted`)) {
    return `Beacon needs ${label} access for this request. Allow it in System Settings → Privacy & Security → ${label}, then try again.`;
  }
  if (detail.includes('ETIMEDOUT') || detail.includes('timed out')) {
    return `${label} took too long to respond. Check macOS permissions, then try again.`;
  }
  return `${label} is unavailable right now. ${detail}`;
}
