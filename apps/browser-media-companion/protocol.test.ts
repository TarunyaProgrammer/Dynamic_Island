import { describe, expect, it } from 'vitest';
import { commandStatus, parsePairingLink } from './protocol.js';

describe('browser media companion command result protocol', () => {
  it.each(['confirmed', 'unsupported', 'target-gone', 'permission-denied', 'failed'])('preserves %s', (status) => {
    expect(commandStatus(status)).toBe(status);
  });

  it('contains malformed command statuses', () => {
    expect(commandStatus('anything-else')).toBe('unsupported');
  });

  it('parses Beacon’s single clipboard pairing link', () => {
    expect(parsePairingLink(`beacon://pair/56078/${'a'.repeat(43)}`)).toEqual({ port: 56078, token: 'a'.repeat(43) });
    expect(parsePairingLink('beacon://pair/0/nope')).toBeUndefined();
    expect(parsePairingLink('https://pair/56078/token')).toBeUndefined();
  });
});
