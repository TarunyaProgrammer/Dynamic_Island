import { describe, expect, it } from 'vitest';
import { shouldFallbackToJxa } from './AppleIntegrationErrors';

describe('shouldFallbackToJxa', () => {
  it('falls back only when the EventKit helper is unavailable', () => {
    expect(shouldFallbackToJxa(new Error('BeaconEventKitHelper app not found'))).toBe(true);
    expect(shouldFallbackToJxa(new Error('Calendar access was not granted'))).toBe(false);
  });
});
