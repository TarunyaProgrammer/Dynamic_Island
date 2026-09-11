// packages/core/services/media-service.ts - Robust Multi-Source macOS Media Engine
import { execFile } from 'child_process';
import { promisify } from 'util';
import { MediaActivityState } from '@shared/types';
import { ActivityEngine } from '../activities/activity-engine';
import { MediaTargetResolver, type MediaCandidate } from './media-target-resolver';

const execFileAsync = promisify(execFile);

export type BrowserMediaCommand = 'playPause' | 'next' | 'previous' | 'setVolume';
export interface BrowserMediaSessionSnapshot {
  targetId: string;
  origin: string;
  title: string;
  artist?: string;
  artworkUrl?: string;
  isPlaying: boolean;
  position?: number;
  duration?: number;
  volume?: number;
  /** Epoch milliseconds from the extension when playback meaningfully changed. */
  activityAt?: number;
  isFrontmost?: boolean;
  isActiveTab?: boolean;
  capabilities: Partial<Record<BrowserMediaCommand, boolean>>;
}

/** Reflect a successful system-volume command without replacing now-playing metadata. */
export function withSystemOutputVolume(state: MediaActivityState, volume: number): MediaActivityState {
  return { ...state, volume: Math.round(Math.max(0, Math.min(100, volume))) };
}

export function parseSystemOutputVolume(stdout: string): number | undefined {
  const value = Number(stdout.trim());
  return Number.isInteger(value) && value >= 0 && value <= 100 ? value : undefined;
}
export interface BrowserMediaBridgePort {
  subscribeSessions(listener: (sessions: readonly BrowserMediaSessionSnapshot[]) => void): () => void;
  command(targetId: string, command: BrowserMediaCommand, value?: number): Promise<{ status: 'confirmed' | 'unsupported' | 'target-gone' | 'permission-denied' | 'failed'; targetId: string }>;
}

export class MediaService {
  private currentState: MediaActivityState = {
    title: 'No Media Playing',
    artist: 'macOS Audio',
    isPlaying: false,
    durationSeconds: 0,
    progressSeconds: 0,
    volume: 50,
  };
  private pollTimeout: NodeJS.Timeout | null = null;
  private isPausedBySystem = false;
  private lastTrackKey = '';
  private currentSource?: 'Spotify' | 'Music' | 'Chrome' | 'Browser';
  private systemOutputVolume = 50;
  private systemVolumeRead?: Promise<void>;
  private chromeTarget?: { windowIndex: number; tabIndex: number };
  private listeners: Array<(state: MediaActivityState) => void> = [];
  private readonly targetResolver = new MediaTargetResolver();
  private readonly browserSessions = new Map<string, { session: BrowserMediaSessionSnapshot; activityAt: number }>();
  private unsubscribeBridge?: () => void;

  public get activeSource(): 'Spotify' | 'Music' | 'Chrome' | 'Browser' | undefined {
    return this.currentSource;
  }

  constructor(private activityEngine?: ActivityEngine, private browserBridge?: BrowserMediaBridgePort) {
    if (browserBridge) {
      this.unsubscribeBridge = browserBridge.subscribeSessions((sessions) => this.receiveBrowserSessions(sessions));
    }
    this.startPolling();
  }

  dispose(): void {
    this.stopPolling();
    this.unsubscribeBridge?.();
    this.unsubscribeBridge = undefined;
    this.browserSessions.clear();
  }

  startPolling(): void {
    if (this.pollTimeout) return;
    this.scheduleNextPoll(100);
  }

  stopPolling(): void {
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
      this.pollTimeout = null;
    }
  }

  pauseForSystemSleep(): void {
    this.isPausedBySystem = true;
    this.stopPolling();
  }

  resumeFromSystemSleep(): void {
    this.isPausedBySystem = false;
    this.startPolling();
  }

  private scheduleNextPoll(delayMs?: number): void {
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
    }
    if (this.isPausedBySystem) return;

    // 1000ms polling when active for smooth progress, 3000ms when idle
    const interval = delayMs ?? (this.currentState.isPlaying ? 1000 : 3000);
    this.pollTimeout = setTimeout(async () => {
      await this.fetchState();
      this.scheduleNextPoll();
    }, interval);
  }

  subscribe(callback: (state: MediaActivityState) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('Error notifying media listener:', err);
      }
    }
  }

  private cleanTitle(raw: string): { title: string; source: string } {
    let title = raw.trim();
    // Remove notification badges like "(5) " or "[1] "
    title = title.replace(/^\(\d+\)\s*/, '').replace(/^\[\d+\]\s*/, '');

    let source = 'Web Media';
    if (title.includes(' - YouTube')) {
      title = title.replace(' - YouTube', '').trim();
      source = 'YouTube';
    } else if (title.includes(' | SoundCloud')) {
      title = title.replace(' | SoundCloud', '').trim();
      source = 'SoundCloud';
    } else if (title.includes(' - Spotify')) {
      title = title.replace(' - Spotify', '').trim();
      source = 'Spotify Web';
    } else if (title.includes(' - Netflix')) {
      title = title.replace(' - Netflix', '').trim();
      source = 'Netflix';
    }

    return { title: title || raw, source };
  }

  private receiveBrowserSessions(sessions: readonly BrowserMediaSessionSnapshot[]): void {
    const remaining = new Set(sessions.map((session) => session.targetId));
    for (const targetId of this.browserSessions.keys()) {
      if (!remaining.has(targetId)) {
        this.browserSessions.delete(targetId);
        this.targetResolver.invalidate(targetId);
      }
    }
    for (const session of sessions) {
      const prior = this.browserSessions.get(session.targetId);
      // Heartbeats/time updates must not reshuffle active tabs. Trust the
      // extension's activity timestamp, preserving the prior value for older
      // companions that do not provide one.
      const activityAt = session.activityAt ?? prior?.activityAt ?? Date.now();
      this.browserSessions.set(session.targetId, { session, activityAt });
    }

    const selected = this.selectTarget();
    // A paused session is still actionable: show it so Play can resume it.
    if (selected?.kind === 'browser') {
      const browser = this.browserSessions.get(selected.id);
      if (browser) this.applyBrowserSession(browser.session, true);
    }
  }

  private browserCandidates(): MediaCandidate[] {
    return [...this.browserSessions.values()].map(({ session, activityAt }) => ({
      id: session.targetId, kind: 'browser', isPlaying: session.isPlaying, activityAt,
      isFrontmost: session.isFrontmost, isActiveTab: session.isActiveTab,
    }));
  }

  private selectTarget(native?: MediaCandidate): MediaCandidate | undefined {
    const candidates = this.browserCandidates();
    if (native) candidates.push(native);
    else if (this.currentSource && this.currentSource !== 'Browser') {
      candidates.push({ id: this.currentSource.toLowerCase(), kind: 'native', isPlaying: this.currentState.isPlaying, activityAt: 0 });
    }
    return this.targetResolver.resolve(candidates);
  }

  private applyBrowserSession(session: BrowserMediaSessionSnapshot, confirm: boolean): void {
    const host = (() => { try { return new URL(session.origin).hostname.replace(/^www\./, ''); } catch { return 'Google Chrome'; } })();
    const state: MediaActivityState = {
      title: session.title || 'Web Media',
      artist: session.artist || host,
      artworkUrl: session.artworkUrl,
      isPlaying: session.isPlaying,
      durationSeconds: Math.round(session.duration || 0),
      progressSeconds: Math.round(session.position || 0),
      // A browser media element's `volume` is a per-page gain, not the macOS
      // output level. The Island always presents the latter so its value and
      // controls remain truthful regardless of the selected player.
      volume: this.systemOutputVolume,
    };
    this.currentSource = 'Browser';
    this.chromeTarget = undefined;
    if (confirm) this.targetResolver.confirm({ id: session.targetId, kind: 'browser', isPlaying: session.isPlaying, activityAt: Date.now() });
    this.publishState(state, `browser:${session.targetId}`);
    this.refreshSystemOutputVolume();
  }

  private publishState(state: MediaActivityState, trackKey: string): void {
    if (trackKey !== this.lastTrackKey && state.isPlaying && this.activityEngine) {
      this.lastTrackKey = trackKey;
      this.activityEngine.push({
        id: 'beacon-now-playing', type: 'media', priority: 'normal', title: `♫ ${state.title}`,
        subtitle: state.artist, progressFraction: state.durationSeconds > 0 ? state.progressSeconds / state.durationSeconds : 0,
        timestamp: new Date().toISOString(),
      }, 4500);
    }
    this.currentState = state;
    this.notify();
  }

  private async setSystemOutputVolume(volume: number): Promise<MediaActivityState> {
    try {
      // This Standard Additions command works without a detected media app.
      await execFileAsync('osascript', ['-e', `set volume output volume ${volume}`], { timeout: 2500 });
      this.systemOutputVolume = volume;
      const nextState = withSystemOutputVolume(this.currentState, volume);
      this.publishState(nextState, `system-volume:${nextState.title}:${nextState.artist}`);
    } catch {
      // Keep the last confirmed value if macOS refuses automation access.
    }
    return this.currentState;
  }

  private async readSystemOutputVolume(): Promise<number | undefined> {
    try {
      const { stdout } = await execFileAsync(
        'osascript',
        ['-e', 'output volume of (get volume settings)'],
        { timeout: 2500 },
      );
      const volume = parseSystemOutputVolume(stdout);
      if (volume !== undefined) this.systemOutputVolume = volume;
      return volume;
    } catch {
      return undefined;
    }
  }

  /** Coalesce macOS reads so extension heartbeats cannot spawn AppleScript work. */
  private refreshSystemOutputVolume(): void {
    if (this.systemVolumeRead) return;
    this.systemVolumeRead = this.readSystemOutputVolume()
      .then((volume) => {
        if (volume === undefined || this.currentSource !== 'Browser') return;
        this.publishState(withSystemOutputVolume(this.currentState, volume), `system-volume:${this.currentState.title}:${this.currentState.artist}`);
      })
      .finally(() => { this.systemVolumeRead = undefined; });
  }

  async fetchState(): Promise<MediaActivityState> {
    // This AppleScript scan is intentionally only a best-effort fallback. The
    // companion bridge is authoritative for browser playback and commands.
    const jxaScript = `
      function run() {
        const se = Application("System Events");
        const procs = se.applicationProcesses.name();

        // 1. Check Native Spotify
        if (procs.includes("Spotify")) {
          try {
            const spotify = Application("Spotify");
            const state = spotify.playerState();
            if (state === "playing" || state === "paused") {
              const track = spotify.currentTrack;
              return JSON.stringify({
                app: "Spotify",
                title: track.name(),
                artist: track.artist(),
                album: track.album(),
                isPlaying: state === "playing",
                durationSeconds: Math.round((track.duration() || 0) / 1000),
                progressSeconds: Math.round(spotify.playerPosition() || 0),
                volume: spotify.soundVolume() || 50
              });
            }
          } catch(e) {}
        }

        // 2. Check Native Apple Music
        if (procs.includes("Music")) {
          try {
            const music = Application("Music");
            const state = music.playerState();
            if (state === "playing" || state === "paused") {
              const track = music.currentTrack;
              return JSON.stringify({
                app: "Music",
                title: track.name(),
                artist: track.artist(),
                album: track.album(),
                isPlaying: state === "playing",
                durationSeconds: Math.round(track.duration() || 0),
                progressSeconds: Math.round(music.playerPosition() || 0),
                volume: music.soundVolume() || 50
              });
            }
          } catch(e) {}
        }

        // 3. Check Google Chrome Tabs
        if (procs.includes("Google Chrome")) {
          try {
            const chrome = Application("Google Chrome");
            const wins = chrome.windows();
            for (let i = 0; i < wins.length; i++) {
              const tabs = wins[i].tabs();
              for (let j = 0; j < tabs.length; j++) {
                const url = tabs[j].url() || "";
                if (url.includes("youtube.com/watch") || url.includes("music.youtube") || url.includes("soundcloud") || url.includes("spotify.com") || url.includes("twitch.tv") || url.includes("netflix.com")) {
                  const state = tabs[j].execute({ javascript: "(() => { const media = Array.from(document.querySelectorAll('video,audio')).find((item) => !item.paused && !item.ended && item.readyState > 2); return media ? JSON.stringify({ title: document.title, durationSeconds: Number.isFinite(media.duration) ? Math.round(media.duration) : 0, progressSeconds: Math.round(media.currentTime || 0), volume: Math.round((media.volume || 0) * 100) }) : ''; })()" });
                  if (state) {
                    const details = JSON.parse(state);
                    return JSON.stringify({ app: "Chrome", title: details.title || tabs[j].title() || "Web Media", artist: "Google Chrome", isPlaying: true, durationSeconds: details.durationSeconds || 0, progressSeconds: details.progressSeconds || 0, volume: details.volume ?? 50, windowIndex: i, tabIndex: j });
                  }
                }
              }
            }
          } catch(e) {}
        }

        // 4. Check Safari Tabs
        if (procs.includes("Safari")) {
          try {
            const safari = Application("Safari");
            const wins = safari.windows();
            for (let i = 0; i < wins.length; i++) {
              const tabs = wins[i].tabs();
              for (let j = 0; j < tabs.length; j++) {
                const url = tabs[j].url() || "";
                if (url.includes("youtube.com/watch") || url.includes("music.youtube") || url.includes("soundcloud") || url.includes("spotify.com") || url.includes("twitch.tv") || url.includes("netflix.com")) {
                  return JSON.stringify({
                    app: "Safari",
                    title: tabs[j].name() || "Web Media",
                    artist: "Safari",
                    // A tab URL is not evidence of playback; do not claim it is playing.
                    isPlaying: false,
                    durationSeconds: 0,
                    progressSeconds: 0,
                    volume: 50
                  });
                }
              }
            }
          } catch(e) {}
        }

        // 5. Check Arc Browser
        if (procs.includes("Arc")) {
          try {
            const arc = Application("Arc");
            const wins = arc.windows();
            for (let i = 0; i < wins.length; i++) {
              const tabs = wins[i].tabs();
              for (let j = 0; j < tabs.length; j++) {
                const url = tabs[j].url() || "";
                if (url.includes("youtube.com/watch") || url.includes("music.youtube") || url.includes("soundcloud") || url.includes("spotify.com") || url.includes("twitch.tv") || url.includes("netflix.com")) {
                  return JSON.stringify({
                    app: "Arc",
                    title: tabs[j].title() || "Web Media",
                    artist: "Arc Browser",
                    // Best-effort discovery only: Arc does not expose media state here.
                    isPlaying: false,
                    durationSeconds: 0,
                    progressSeconds: 0,
                    volume: 50
                  });
                }
              }
            }
          } catch(e) {}
        }

        // 6. Check Brave Browser
        if (procs.includes("Brave Browser")) {
          try {
            const brave = Application("Brave Browser");
            const wins = brave.windows();
            for (let i = 0; i < wins.length; i++) {
              const tabs = wins[i].tabs();
              for (let j = 0; j < tabs.length; j++) {
                const url = tabs[j].url() || "";
                if (url.includes("youtube.com/watch") || url.includes("music.youtube") || url.includes("soundcloud") || url.includes("spotify.com") || url.includes("twitch.tv") || url.includes("netflix.com")) {
                  return JSON.stringify({
                    app: "Brave",
                    title: tabs[j].title() || "Web Media",
                    artist: "Brave Browser",
                    // Best-effort discovery only: Brave does not expose media state here.
                    isPlaying: false,
                    durationSeconds: 0,
                    progressSeconds: 0,
                    volume: 50
                  });
                }
              }
            }
          } catch(e) {}
        }

        return JSON.stringify({ isPlaying: false, title: "No Media Playing", artist: "macOS Audio", durationSeconds: 0, progressSeconds: 0, volume: 50 });
      }
    `;

    try {
      const { stdout } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxaScript], {
        timeout: 2500,
      });

      const parsed = JSON.parse(stdout.trim());
      if (parsed) {
        let title = parsed.title || 'No Media Playing';
        let artist = parsed.artist || 'macOS Audio';

        if (parsed.app && (parsed.app === 'Chrome' || parsed.app === 'Safari' || parsed.app === 'Arc' || parsed.app === 'Brave')) {
          const cleaned = this.cleanTitle(title);
          title = cleaned.title;
          artist = `${cleaned.source} • ${parsed.app}`;
        }

        const newState: MediaActivityState = {
          title,
          artist,
          album: parsed.album || undefined,
          durationSeconds: parsed.durationSeconds || 0,
          progressSeconds: parsed.progressSeconds || 0,
          isPlaying: !!parsed.isPlaying,
          volume: parsed.volume ?? 50,
        };
        if (!parsed.app) newState.volume = (await this.readSystemOutputVolume()) ?? this.systemOutputVolume;

        const nativeSource = parsed.app === 'Spotify' || parsed.app === 'Music' || parsed.app === 'Chrome' ? parsed.app : undefined;
        const selected = this.selectTarget(nativeSource ? {
          id: nativeSource.toLowerCase(), kind: 'native', isPlaying: !!parsed.isPlaying, activityAt: Date.now(),
        } : undefined);
        if (selected?.kind === 'browser') {
          const browser = this.browserSessions.get(selected.id);
          if (browser) {
            this.applyBrowserSession(browser.session, false);
            return this.currentState;
          }
        }

        this.currentSource = nativeSource;
        this.chromeTarget = parsed.app === 'Chrome' && Number.isInteger(parsed.windowIndex) && Number.isInteger(parsed.tabIndex)
          ? { windowIndex: parsed.windowIndex, tabIndex: parsed.tabIndex }
          : undefined;

        if (nativeSource) this.targetResolver.confirm({ id: nativeSource.toLowerCase(), kind: 'native', isPlaying: newState.isPlaying, activityAt: Date.now() });
        this.publishState(newState, `${parsed.app || ''}:${title}:${artist}`);
        return this.currentState;
      }
    } catch {
      // Graceful fallback
    }

    const selected = this.selectTarget();
    if (selected?.kind === 'browser') {
      const browser = this.browserSessions.get(selected.id);
      if (browser) this.applyBrowserSession(browser.session, false);
    }
    return this.currentState;
  }

  /** Browser commands are targeted and confirmed by the companion; never fall
   * through to an unrelated native player or mutate local playback optimistically. */
  private async commandBrowserIfSelected(command: BrowserMediaCommand, value?: number): Promise<boolean> {
    const selected = this.selectTarget();
    if (selected?.kind !== 'browser') return false;
    const session = this.browserSessions.get(selected.id)?.session;
    if (!session || !this.browserBridge) return true;

    const result = value === undefined
      ? await this.browserBridge.command(session.targetId, command)
      : await this.browserBridge.command(session.targetId, command, value);
    if (result.status === 'confirmed') {
      this.targetResolver.confirm(selected);
      // Wait for the next companion snapshot to update state. A command result
      // confirms delivery, not the resulting media element state.
    }
    return true;
  }

  async playPause(): Promise<MediaActivityState> {
    if (await this.commandBrowserIfSelected('playPause')) return this.currentState;
    const source = JSON.stringify(this.currentSource ?? '');
    const jxa = `
      function run() {
        const se = Application("System Events");
        const procs = se.applicationProcesses.name();

        const source = ${source};
        if (source === "Spotify" && procs.includes("Spotify")) {
          try {
            Application("Spotify").playpause();
            return "ok";
          } catch(e) {}
        }

        if (source === "Music" && procs.includes("Music")) {
          try {
            Application("Music").playpause();
            return "ok";
          } catch(e) {}
        }

        if (source === "Chrome" && procs.includes("Google Chrome")) {
          try {
            const chrome = Application("Google Chrome");
            const wins = chrome.windows();
            const targetWindow = ${this.chromeTarget?.windowIndex ?? -1};
            const targetTab = ${this.chromeTarget?.tabIndex ?? -1};
            if (targetWindow >= 0 && targetTab >= 0 && wins[targetWindow]) {
              const tab = wins[targetWindow].tabs()[targetTab];
              if (tab) {
                tab.execute({ javascript: "(() => { const media = Array.from(document.querySelectorAll('video,audio')).find((item) => !item.ended && item.readyState > 0); if (!media) throw new Error('No playable media'); return media.paused ? media.play() : media.pause(); })()" });
                return "ok";
              }
            }
          } catch(e) {}
        }

        if (source === "Safari" && procs.includes("Safari")) {
          try {
            const safari = Application("Safari");
            const wins = safari.windows();
            for (let i = 0; i < wins.length; i++) {
              const tabs = wins[i].tabs();
              for (let j = 0; j < tabs.length; j++) {
                const url = tabs[j].url() || "";
                if (url.includes("youtube.com") || url.includes("soundcloud.com") || url.includes("spotify.com")) {
                  try {
                    safari.doJavaScript("var v = document.querySelector('video') || document.querySelector('audio'); if (v) { v.paused ? v.play() : v.pause(); }", { in: tabs[j] });
                    return "ok";
                  } catch(jsErr) {
                    wins[i].currentTab = tabs[j];
                    safari.activate();
                    se.keystroke("k");
                    return "ok";
                  }
                }
              }
            }
          } catch(e) {}
        }

        return "none";
      }
    `;
    try {
      const { stdout } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxa], { timeout: 2500 });
      if (stdout.trim() !== 'ok') return this.currentState;
      await new Promise((r) => setTimeout(r, 200));
      return await this.fetchState();
    } catch {
      return this.currentState;
    }
  }

  async nextTrack(): Promise<MediaActivityState> {
    if (await this.commandBrowserIfSelected('next')) return this.currentState;
    const source = JSON.stringify(this.currentSource ?? '');
    const jxa = `
      function run() {
        const se = Application("System Events");
        const procs = se.applicationProcesses.name();

        const source = ${source};
        if (source === "Spotify" && procs.includes("Spotify")) {
          try {
            Application("Spotify").nextTrack();
            return "ok";
          } catch(e) {}
        }

        if (source === "Music" && procs.includes("Music")) {
          try {
            Application("Music").nextTrack();
            return "ok";
          } catch(e) {}
        }

        if (source === "Chrome" && procs.includes("Google Chrome")) {
          try {
            const chrome = Application("Google Chrome");
            const wins = chrome.windows();
            const targetWindow = ${this.chromeTarget?.windowIndex ?? -1};
            const targetTab = ${this.chromeTarget?.tabIndex ?? -1};
            const tab = wins[targetWindow] && wins[targetWindow].tabs()[targetTab];
            if (tab) {
              tab.execute({ javascript: "(() => { const next = document.querySelector('.ytp-next-button'); if (!next) throw new Error('Next track is unsupported'); next.click(); })()" });
              return "ok";
            }
          } catch(e) {}
        }

        return "none";
      }
    `;
    try {
      const { stdout } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxa], { timeout: 2500 });
      if (stdout.trim() !== 'ok') return this.currentState;
      await new Promise((r) => setTimeout(r, 200));
      return await this.fetchState();
    } catch {
      return this.currentState;
    }
  }

  async previousTrack(): Promise<MediaActivityState> {
    if (await this.commandBrowserIfSelected('previous')) return this.currentState;
    const source = JSON.stringify(this.currentSource ?? '');
    const jxa = `
      function run() {
        const se = Application("System Events");
        const procs = se.applicationProcesses.name();

        const source = ${source};
        if (source === "Spotify" && procs.includes("Spotify")) {
          try {
            Application("Spotify").previousTrack();
            return "ok";
          } catch(e) {}
        }

        if (source === "Music" && procs.includes("Music")) {
          try {
            Application("Music").previousTrack();
            return "ok";
          } catch(e) {}
        }

        return "none";
      }
    `;
    try {
      const { stdout } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxa], { timeout: 2500 });
      if (stdout.trim() !== 'ok') return this.currentState;
      await new Promise((r) => setTimeout(r, 200));
      return await this.fetchState();
    } catch {
      return this.currentState;
    }
  }

  async setVolume(volume: number): Promise<MediaActivityState> {
    const clamped = Math.max(0, Math.min(100, volume));
    // This control is deliberately a macOS output-volume control. Browser
    // element volume is an independent per-site setting and must not be
    // presented as the system level or changed as a side effect here.
    return this.setSystemOutputVolume(clamped);
  }

  getState(): MediaActivityState {
    return this.currentState;
  }
}
