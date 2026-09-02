import { afterEach, describe, expect, it } from 'vitest';
import { BrowserMediaBridge } from './BrowserMediaBridge';

describe('BrowserMediaBridge', () => {
  let bridge: BrowserMediaBridge | undefined;

  afterEach(async () => {
    await bridge?.stop();
  });

  it('rejects a command when the target is not connected', async () => {
    bridge = new BrowserMediaBridge();
    await bridge.start();

    await expect(bridge.command('chrome:4:7:0', 'playPause'))
      .resolves.toMatchObject({ status: 'target-gone', targetId: 'chrome:4:7:0' });
  });

  it('does not expose its pairing token through the public connection details', async () => {
    bridge = new BrowserMediaBridge();
    await bridge.start();

    expect(bridge.connectionDetails()).toEqual({ port: expect.any(Number) });
  });
});
