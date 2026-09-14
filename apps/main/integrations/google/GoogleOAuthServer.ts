// apps/main/integrations/google/GoogleOAuthServer.ts
// Tiny ephemeral local HTTP server to receive the Google OAuth redirect.
// Google Desktop OAuth requires a localhost redirect — custom URI schemes are
// not allowed for OAuth 2.0 confidential desktop clients (Google policy).
// This server binds to 127.0.0.1 only, on a random port, and self-destructs
// after the first successful code exchange or a 120-second timeout.

import http from 'node:http';
import { URL } from 'node:url';

export interface OAuthCallbackResult {
  code: string;
  state: string;
}

export class GoogleOAuthServer {
  private server: http.Server | null = null;
  private port: number = 0;

  /** Starts the listener. Returns the redirect URI to embed in the auth URL. */
  async start(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer();
      this.server.listen(0, '127.0.0.1', () => {
        const addr = this.server!.address();
        if (!addr || typeof addr === 'string') {
          reject(new Error('Failed to bind OAuth listener'));
          return;
        }
        this.port = addr.port;
        resolve(this.redirectUri);
      });
      this.server.on('error', reject);
    });
  }

  get redirectUri(): string {
    return `http://127.0.0.1:${this.port}/oauth/callback`;
  }

  /**
   * Returns a promise that resolves with the OAuth code once the browser
   * redirects back, or rejects after 120 seconds.
   */
  waitForCode(): Promise<OAuthCallbackResult> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        reject(new Error('Server not started'));
        return;
      }

      const timeout = setTimeout(() => {
        this.stop();
        reject(new Error('OAuth timeout: no callback received within 120 seconds'));
      }, 120_000);

      this.server.on('request', (req, res) => {
        try {
          const url = new URL(req.url ?? '/', `http://127.0.0.1:${this.port}`);
          if (url.pathname !== '/oauth/callback') {
            res.writeHead(404).end();
            return;
          }

          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state') ?? '';
          const error = url.searchParams.get('error');

          if (error) {
            res.writeHead(200, { 'Content-Type': 'text/html' }).end(
              '<html><body style="font-family:system-ui;text-align:center;padding:60px"><h2>❌ Authorization denied</h2><p>You can close this tab and return to Beacon.</p></body></html>',
            );
            clearTimeout(timeout);
            this.stop();
            reject(new Error(`Google OAuth denied: ${error}`));
            return;
          }

          if (!code) {
            res.writeHead(400).end('Missing code');
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/html' }).end(
            '<html><body style="font-family:system-ui;text-align:center;padding:60px;background:#0d0f16;color:#fff"><h2 style="color:#D97706">✅ Beacon connected!</h2><p style="color:#9ca3af">Google Calendar is now syncing. You can close this tab and return to Beacon.</p></body></html>',
          );

          clearTimeout(timeout);
          this.stop();
          resolve({ code, state });
        } catch (err) {
          res.writeHead(500).end('Internal error');
          reject(err);
        }
      });
    });
  }

  stop(): void {
    if (this.server) {
      this.server.closeAllConnections?.();
      this.server.close();
      this.server = null;
    }
  }
}
