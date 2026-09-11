import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

if (process.platform !== 'darwin') process.exit(0);
const root = process.cwd();
const output = path.join(root, 'build', 'BeaconEventKitHelper');
fs.mkdirSync(path.dirname(output), { recursive: true });
const developerDirectory = execFileSync('xcode-select', ['-p'], { encoding: 'utf8' }).trim();
if (!developerDirectory.endsWith('/Xcode.app/Contents/Developer')) {
  throw new Error('Beacon EventKit packaging requires full Xcode. Install a matching Xcode release, then run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer');
}
const moduleCache = path.join(root, 'build', '.swift-module-cache');
fs.mkdirSync(moduleCache, { recursive: true });
execFileSync('xcrun', ['swiftc', '-O', path.join(root, 'apps/main/integrations/apple/BeaconEventKitHelper.swift'), '-o', output], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Keep the helper compatible with Beacon's pre-macOS-14 installs while
    // selecting the modern EventKit permission APIs at runtime on newer macOS.
    MACOSX_DEPLOYMENT_TARGET: '13.0',
    CLANG_MODULE_CACHE_PATH: moduleCache,
    SWIFT_MODULE_CACHE_PATH: moduleCache,
  },
});
