// scripts/ensure-better-sqlite3.js
// Ensures dual native binaries exist for both standard Node (tests) and Electron (runtime).
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const releaseDir = path.join(rootDir, 'node_modules/better-sqlite3/build/Release');
const buildNativeDir = path.join(rootDir, 'build/native');

fs.mkdirSync(buildNativeDir, { recursive: true });

const electronTarget = path.join(buildNativeDir, 'better_sqlite3_electron.node');
const nodeTarget = path.join(buildNativeDir, 'better_sqlite3_node.node');

// 1. If electron target missing, build it via electron-builder
if (!fs.existsSync(electronTarget)) {
  console.log('[ensure-better-sqlite3] Building native binding for Electron...');
  try {
    execSync('npx electron-builder install-app-deps', { stdio: 'inherit' });
    const current = path.join(releaseDir, 'better_sqlite3.node');
    if (fs.existsSync(current)) {
      fs.copyFileSync(current, electronTarget);
    }
  } catch (err) {
    console.warn('[ensure-better-sqlite3] Could not auto-build Electron binding:', err.message);
  }
}

// 2. If node target missing, build it via npm rebuild
if (!fs.existsSync(nodeTarget)) {
  console.log('[ensure-better-sqlite3] Building native binding for Node.js...');
  try {
    execSync('npm rebuild better-sqlite3', { stdio: 'inherit' });
    const current = path.join(releaseDir, 'better_sqlite3.node');
    if (fs.existsSync(current)) {
      fs.copyFileSync(current, nodeTarget);
    }
  } catch (err) {
    console.warn('[ensure-better-sqlite3] Could not auto-build Node binding:', err.message);
  }
}

console.log('[ensure-better-sqlite3] Dual native bindings ready.');
