import { describe, expect, it } from 'vitest';
import { commandStatus, parsePairingLink } from './protocol.js';

describe('browser media companion command result protocol', () => {
  it.each(['confirmed', 'unsupported', 'target-gone', 'permission-denied', 'failed'])('preserves %s', (status) => {
    expect(commandStatus(status)).toBe(status);
  });

  it('contains malformed command statuses', () => {
    expect(commandStatus('anything-else')).toBe('unsupported');
  });

  it('parses Beacon’s single clipboard pairing link and resilient variants', () => {
    const token = 'a'.repeat(43);
    expect(parsePairingLink(`beacon://pair/56078/${token}`)).toEqual({ port: 56078, token });
    expect(parsePairingLink(`  beacon://pair/56078/${token}\n`)).toEqual({ port: 56078, token });
    expect(parsePairingLink(`"beacon://pair/56078/${token}"`)).toEqual({ port: 56078, token });
    expect(parsePairingLink(`http://127.0.0.1:56078/?token=${token}`)).toEqual({ port: 56078, token });
    expect(parsePairingLink(`ws://127.0.0.1:56078/${token}`)).toEqual({ port: 56078, token });
    expect(parsePairingLink(`56078:${token}`)).toEqual({ port: 56078, token });
    expect(parsePairingLink(`56078/${token}`)).toEqual({ port: 56078, token });

    expect(parsePairingLink('beacon://pair/0/nope')).toBeUndefined();
    expect(parsePairingLink('https://pair/56078/token')).toBeUndefined();
    expect(parsePairingLink('')).toBeUndefined();
    expect(parsePairingLink('invalid')).toBeUndefined();
  });
});
