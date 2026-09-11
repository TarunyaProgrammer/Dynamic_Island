const COMMAND_STATUSES = new Set(['confirmed', 'unsupported', 'target-gone', 'permission-denied', 'failed']);

/** Preserve a content-script's observed result; unknown values are safely unsupported. */
export function commandStatus(status) {
  return COMMAND_STATUSES.has(status) ? status : 'unsupported';
}

/** Parse pairing link or credentials copied from Beacon. */
export function parsePairingLink(value) {
  if (typeof value !== 'string') return undefined;
  const clean = value.trim().replace(/^["'`]|["'`]$/g, '');
  if (!clean) return undefined;

  // 1. Direct beacon://pair/<port>/<token>
  try {
    const url = new URL(clean);
    if (url.protocol === 'beacon:' && url.hostname === 'pair') {
      const [portText, token, ...rest] = url.pathname.split('/').filter(Boolean);
      const port = Number(portText);
      if (!rest.length && Number.isInteger(port) && port >= 1 && port <= 65535 && /^[A-Za-z0-9_-]{32,256}$/.test(token || '')) {
        return { port, token };
      }
    }
    // 2. Loopback URL with token query param or path: http://127.0.0.1:<port>/?token=<token>
    if ((url.protocol === 'http:' || url.protocol === 'ws:') && (url.hostname === '127.0.0.1' || url.hostname === 'localhost')) {
      const port = Number(url.port);
      const token = url.searchParams.get('token') || url.pathname.split('/').filter(Boolean)[0];
      if (Number.isInteger(port) && port >= 1 && port <= 65535 && /^[A-Za-z0-9_-]{32,256}$/.test(token || '')) {
        return { port, token };
      }
    }
  } catch {
    // Not a standard URL, fall through to delimiter format
  }

  // 3. Port:Token or Port/Token format (e.g. 56078:token)
  const match = clean.match(/^(\d{1,5})[:/]([A-Za-z0-9_-]{32,256})$/);
  if (match) {
    const port = Number(match[1]);
    const token = match[2];
    if (Number.isInteger(port) && port >= 1 && port <= 65535) {
      return { port, token };
    }
  }

  return undefined;
}
