#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { parseBeaconCli } from '../apps/main/automation/cli-commands.js';

try {
  const url = parseBeaconCli(process.argv.slice(2));
  if (process.platform === 'darwin') execFileSync('open', [url], { stdio: 'inherit' });
  else console.log(url);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Beacon command failed');
  process.exitCode = 1;
}
