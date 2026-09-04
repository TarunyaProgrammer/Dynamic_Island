// Copyright (c) 2026 Tarunya K. All Rights Reserved.
// Proprietary and confidential. Unauthorized use, copying, modification,
// or distribution of this file, via any medium, is strictly prohibited.
// See LICENSE in the root of this repository.

import path from 'path';

/**
 * electron-builder afterSign hook for Apple Notarization.
 * Only executes if Apple Developer credentials are provided in environment variables.
 * Gracefully skips for local developer builds.
 */
export default async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_ID_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.log('[notarize] Skipping Apple notarization: APPLE_ID, APPLE_ID_PASSWORD, or APPLE_TEAM_ID not provided.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`[notarize] Submitting ${appPath} for Apple notarization...`);

  try {
    const { notarize } = await import('@electron/notarize');
    await notarize({
      appPath,
      appleId,
      appleIdPassword,
      teamId,
    });
    console.log(`[notarize] Successfully notarized ${appName}.app with Apple Ticket`);
  } catch (error) {
    console.error('[notarize] Notarization failed:', error);
    throw error;
  }
}
