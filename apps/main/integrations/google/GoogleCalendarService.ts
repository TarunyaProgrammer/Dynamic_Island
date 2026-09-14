// apps/main/integrations/google/GoogleCalendarService.ts
// Google Calendar REST API v3 integration.
// OAuth 2.0 Authorization Code + PKCE flow — tokens stored via safeStorage
// (macOS Keychain boundary) through the existing CredentialRepository.
// Access tokens are refreshed


import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import { CredentialRepository } from '@database/repository/credential-repository';
import { CalendarEvent, GoogleCalendarInfo, GoogleOAuthStatus } from '@shared/types';
import { GoogleOAuthServer } from './GoogleOAuthServer';

const electron = createRequire(import.meta.url)('electron') as typeof import('electron');
const { shell, safeStorage } = electron;

// ─── Replace with your own Google Cloud OAuth 2.0 Client ID ─────────────────
// This is a public identifier — not a secret. The client_secret is NOT used
// (PKCE flow). Register at console.cloud.google.com → APIs & Services → Credentials.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CALENDAR_CLIENT_ID ?? 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const CRED_ACCESS_TOKEN = 'google_calendar_access_token';
const CRED_REFRESH_TOKEN = 'google_calendar_refresh_token';
const CRED_TOKEN_EXPIRY = 'google_calendar_token_expiry';

export class GoogleCalendarService {
  private oauthServer: GoogleOAuthServer | null = null;
  private status: GoogleOAuthStatus = 'disconnected';

  constructor(
    private readonly credentials: CredentialRepository,
    private readonly onStatusChange?: (status: GoogleOAuthStatus) => void,
  ) {
    // Detect persisted token on startup
    if (this.credentials.has(CRED_ACCESS_TOKEN)) {
      this.status = 'connected';
    }
  }

  getStatus(): GoogleOAuthStatus {
    return this.status;
  }

  // ─── OAuth Flow ───────────────────────────────────────────────────────────

  async startAuth(): Promise<void> {
    if (this.status === 'connecting') return;

    this.setStatus('connecting');

    // Generate PKCE verifier + challenge
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    const state = crypto.randomBytes(16).toString('hex');

    // Start local redirect server
    this.oauthServer = new GoogleOAuthServer();
    const redirectUri = await this.oauthServer.start();

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', GOOGLE_SCOPES.join(' '));
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    await shell.openExternal(authUrl.toString());

    try {
      const { code, state: returnedState } = await this.oauthServer.waitForCode();

      if (returnedState !== state) {
        throw new Error('OAuth state mismatch — possible CSRF attempt');
      }

      await this.exchangeCode(code, redirectUri, codeVerifier);
      this.setStatus('connected');
    } catch (err) {
      this.oauthServer?.stop();
      this.oauthServer = null;
      this.setStatus('error');
      throw err;
    }
  }

  private async exchangeCode(code: string, redirectUri: string, codeVerifier: string): Promise<void> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Token exchange failed: ${res.status} — ${body}`);
    }

    const data = await res.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    this.storeTokens(data.access_token, data.refresh_token, data.expires_in);
  }

  private storeTokens(accessToken: string, refreshToken: string | undefined, expiresIn: number): void {
    const expiry = Date.now() + expiresIn * 1000;

    if (safeStorage.isEncryptionAvailable()) {
      this.credentials.setEncrypted(CRED_ACCESS_TOKEN, safeStorage.encryptString(accessToken).toString('base64'));
      if (refreshToken) {
        this.credentials.setEncrypted(CRED_REFRESH_TOKEN, safeStorage.encryptString(refreshToken).toString('base64'));
      }
      this.credentials.setEncrypted(CRED_TOKEN_EXPIRY, JSON.stringify(expiry));
    } else {
      // Fallback for environments where safeStorage is unavailable (CI/testing)
      this.credentials.setEncrypted(CRED_ACCESS_TOKEN, Buffer.from(accessToken).toString('base64'));
      if (refreshToken) {
        this.credentials.setEncrypted(CRED_REFRESH_TOKEN, Buffer.from(refreshToken).toString('base64'));
      }
      this.credentials.setEncrypted(CRED_TOKEN_EXPIRY, JSON.stringify(expiry));
    }
  }

  private getAccessToken(): string | null {
    const raw = this.credentials.getEncrypted(CRED_ACCESS_TOKEN);
    if (!raw) return null;
    try {
      return safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(Buffer.from(raw, 'base64'))
        : Buffer.from(raw, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }

  private getRefreshToken(): string | null {
    const raw = this.credentials.getEncrypted(CRED_REFRESH_TOKEN);
    if (!raw) return null;
    try {
      return safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(Buffer.from(raw, 'base64'))
        : Buffer.from(raw, 'base64').toString('utf8');
    } catch {
      return null;
    }
  }

  private isTokenExpired(): boolean {
    const raw = this.credentials.getEncrypted(CRED_TOKEN_EXPIRY);
    if (!raw) return true;
    const expiry = JSON.parse(raw) as number;
    return Date.now() >= expiry - 60_000; // refresh 1 minute early
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!res.ok) return false;

    const data = await res.json() as { access_token: string; expires_in: number };
    this.storeTokens(data.access_token, undefined, data.expires_in);
    return true;
  }

  async disconnect(): Promise<void> {
    this.credentials.remove(CRED_ACCESS_TOKEN);
    this.credentials.remove(CRED_REFRESH_TOKEN);
    this.credentials.remove(CRED_TOKEN_EXPIRY);
    this.setStatus('disconnected');
  }

  // ─── Calendar API ─────────────────────────────────────────────────────────

  async getCalendars(): Promise<GoogleCalendarInfo[]> {
    const token = await this.ensureToken();
    if (!token) return [];

    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return [];

    const data = await res.json() as { items?: any[] };
    return (data.items ?? []).map((item) => ({
      id: item.id as string,
      name: (item.summary ?? item.id) as string,
      color: (item.backgroundColor ?? '#4285F4') as string,
      enabled: true,
    }));
  }

  async getEvents(start: Date, end: Date, calendarIds?: string[]): Promise<CalendarEvent[]> {
    const token = await this.ensureToken();
    if (!token) return [];

    const calendars = calendarIds?.length
      ? calendarIds.map((id) => ({ id }))
      : await this.getCalendars();

    const allEvents: CalendarEvent[] = [];

    await Promise.allSettled(
      calendars.map(async (cal) => {
        const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events`);
        url.searchParams.set('timeMin', start.toISOString());
        url.searchParams.set('timeMax', end.toISOString());
        url.searchParams.set('singleEvents', 'true');
        url.searchParams.set('orderBy', 'startTime');
        url.searchParams.set('maxResults', '100');

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json() as { items?: any[] };
        for (const item of data.items ?? []) {
          allEvents.push({
            id: `google:${item.id as string}`,
            title: (item.summary ?? 'Untitled Event') as string,
            start: (item.start?.dateTime ?? item.start?.date) as string,
            end: (item.end?.dateTime ?? item.end?.date) as string,
            calendar: (item.organizer?.displayName ?? cal.id) as string,
            source: 'google',
            isAllDay: !item.start?.dateTime,
            location: item.location as string | undefined,
            color: item.colorId ? undefined : '#4285F4',
          });
        }
      }),
    );

    return allEvents;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async ensureToken(): Promise<string | null> {
    if (!this.credentials.has(CRED_ACCESS_TOKEN)) return null;

    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        this.setStatus('error');
        return null;
      }
    }

    return this.getAccessToken();
  }

  private setStatus(status: GoogleOAuthStatus): void {
    this.status = status;
    this.onStatusChange?.(status);
  }
}
