import { describe, expect, it } from 'vitest';
import { parseBeaconCli } from './cli-commands.js';
describe('Beacon CLI commands', () => it('only produces supported protocol URLs', () => {
  expect(parseBeaconCli(['today'])).toBe('beacon://today');
  expect(parseBeaconCli(['goal', 'abc', 'increment', '2'])).toBe('beacon://goal/abc/increment?amount=2');
  expect(parseBeaconCli(['action', 'abc', 'done'])).toBe('beacon://action/abc/done');
  expect(parseBeaconCli(['action', 'abc', 'plan'])).toBe('beacon://action/abc/plan');
  expect(() => parseBeaconCli(['shell', 'rm'])).toThrow('Usage:');
}));
