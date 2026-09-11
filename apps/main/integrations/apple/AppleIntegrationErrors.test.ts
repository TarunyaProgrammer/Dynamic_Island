import { describe, expect, it } from 'vitest';
import { describeAppleIntegrationError } from './AppleIntegrationErrors';

describe('describeAppleIntegrationError', () => {
  it('turns an EventKit Calendar denial into a System Settings recovery step', () => {
    expect(describeAppleIntegrationError('calendar', new Error('Command failed: Calendar access was not granted')))
      .toContain('System Settings → Privacy & Security → Calendar');
  });

  it('uses the matching Reminders privacy category', () => {
    expect(describeAppleIntegrationError('reminders', new Error('Reminders access was not granted')))
      .toContain('Privacy & Security → Reminders');
  });
});
