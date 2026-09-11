const COMMAND_STATUSES = new Set(['confirmed', 'unsupported', 'target-gone', 'permission-denied', 'failed']);

/** Preserve a content-script's observed result; unknown values are safely unsupported. */
export function commandStatus(status) {
  return COMMAND_STATUSES.has(status) ? status : 'unsupported';
}

/** Parse the single pairing link Beacon copies to the clipboard. */
export function parsePairingLink(value) {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'beacon:' || url.hostname !== 'pair') return undefined;
    const [portText, token, ...rest] = url.pathname.split('/').filter(Boolean);
    const port = Number(portText);
    if (rest.length || !Number.isInteger(port) || port < 1 || port > 65535 || !/^[A-Za-z0-9_-]{32,256}$/.test(token || '')) return undefined;
    return { port, token };
  } catch {
    return undefined;
  }
}
