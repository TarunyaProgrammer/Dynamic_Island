// packages/core/services/media-service.ts - Native macOS JXA Media Engine
import { execFile } from 'child_process';
import { promisify } from 'util';
import { MediaActivityState } from '@shared/types';
import { ActivityEngine } from '../activities/activity-engine';

const execFileAsync = promisify(execFile);

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
  private listeners: Array<(state: MediaActivityState) => void> = [];

  constructor(private activityEngine?: ActivityEngine) {
    this.startPolling();
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

    // Fast 1000ms polling when playing for smooth scrub bar, 3000ms when idle
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

  async fetchState(): Promise<MediaActivityState> {
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
            for (const w of chrome.windows()) {
              for (const t of w.tabs()) {
                const url = t.url() || "";
                if (url.includes("youtube.com/watch") || url.includes("music.youtube") || url.includes("soundcloud") || url.includes("spotify.com") || url.includes("twitch.tv") || url.includes("netflix.com")) {
                  return JSON.stringify({
                    app: "Chrome",
                    title: t.title() || "Web Media",
                    artist: "Google Chrome",
                    isPlaying: true,
                    durationSeconds: 0,
                    progressSeconds: 0,
                    volume: 50
                  });
                }
              }
            }
          } catch(e) {}
        }

        // 4. Check Safari Tabs
        if (procs.includes("Safari")) {
          try {
            const safari = Application("Safari");
            for (const w of safari.windows()) {
              for (const t of w.tabs()) {
                const url = t.url() || "";
                if (url.includes("youtube.com/watch") || url.includes("music.youtube") || url.includes("soundcloud") || url.includes("spotify.com") || url.includes("twitch.tv") || url.includes("netflix.com")) {
                  return JSON.stringify({
                    app: "Safari",
                    title: t.name() || "Web Media",
                    artist: "Safari",
                    isPlaying: true,
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
            for (const w of arc.windows()) {
              for (const t of w.tabs()) {
                const url = t.url() || "";
                if (url.includes("youtube.com/watch") || url.includes("music.youtube") || url.includes("soundcloud") || url.includes("spotify.com") || url.includes("twitch.tv") || url.includes("netflix.com")) {
                  return JSON.stringify({
                    app: "Arc",
                    title: t.title() || "Web Media",
                    artist: "Arc Browser",
                    isPlaying: true,
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
            for (const w of brave.windows()) {
              for (const t of w.tabs()) {
                const url = t.url() || "";
                if (url.includes("youtube.com/watch") || url.includes("music.youtube") || url.includes("soundcloud") || url.includes("spotify.com") || url.includes("twitch.tv") || url.includes("netflix.com")) {
                  return JSON.stringify({
                    app: "Brave",
                    title: t.title() || "Web Media",
                    artist: "Brave Browser",
                    isPlaying: true,
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

        const trackKey = `${parsed.app || ''}:${title}:${artist}`;
        if (trackKey !== this.lastTrackKey && newState.isPlaying && this.activityEngine) {
          this.lastTrackKey = trackKey;
          this.activityEngine.push(
            {
              id: 'beacon-now-playing',
              type: 'media',
              priority: 'normal',
              title: `♫ ${title}`,
              subtitle: artist,
              progressFraction: newState.durationSeconds > 0 ? newState.progressSeconds / newState.durationSeconds : 0,
              timestamp: new Date().toISOString(),
            },
            4500
          );
        }

        this.currentState = newState;
        this.notify();
        return this.currentState;
      }
    } catch {
      // Graceful fallback
    }

    return this.currentState;
  }

  async playPause(): Promise<MediaActivityState> {
    const jxa = `
      function run() {
        const se = Application("System Events");
        const procs = se.applicationProcesses.name();
        if (procs.includes("Spotify")) {
          Application("Spotify").playpause();
          return "ok";
        }
        if (procs.includes("Music")) {
          Application("Music").playpause();
          return "ok";
        }
        if (procs.includes("Google Chrome")) {
          const chrome = Application("Google Chrome");
          for (const w of chrome.windows()) {
            for (const t of w.tabs()) {
              const url = t.url() || "";
              if (url.includes("youtube.com") || url.includes("soundcloud.com") || url.includes("spotify.com")) {
                t.execute({ javascript: "var v = document.querySelector('video') || document.querySelector('audio'); if (v) { v.paused ? v.play() : v.pause(); }" });
                return "ok";
              }
            }
          }
        }
        return "none";
      }
    `;
    try {
      await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxa], { timeout: 2500 });
      await new Promise((r) => setTimeout(r, 200));
      return await this.fetchState();
    } catch {
      return this.currentState;
    }
  }

  async nextTrack(): Promise<MediaActivityState> {
    const jxa = `
      function run() {
        const se = Application("System Events");
        const procs = se.applicationProcesses.name();
        if (procs.includes("Spotify")) {
          Application("Spotify").nextTrack();
          return "ok";
        }
        if (procs.includes("Music")) {
          Application("Music").nextTrack();
          return "ok";
        }
        if (procs.includes("Google Chrome")) {
          const chrome = Application("Google Chrome");
          for (const w of chrome.windows()) {
            for (const t of w.tabs()) {
              if ((t.url() || "").includes("youtube.com")) {
                t.execute({ javascript: "var n = document.querySelector('.ytp-next-button'); if (n) n.click();" });
                return "ok";
              }
            }
          }
        }
        return "none";
      }
    `;
    try {
      await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxa], { timeout: 2500 });
      await new Promise((r) => setTimeout(r, 200));
      return await this.fetchState();
    } catch {
      return this.currentState;
    }
  }

  async previousTrack(): Promise<MediaActivityState> {
    const jxa = `
      function run() {
        const se = Application("System Events");
        const procs = se.applicationProcesses.name();
        if (procs.includes("Spotify")) {
          Application("Spotify").previousTrack();
          return "ok";
        }
        if (procs.includes("Music")) {
          Application("Music").previousTrack();
          return "ok";
        }
        return "none";
      }
    `;
    try {
      await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxa], { timeout: 2500 });
      await new Promise((r) => setTimeout(r, 200));
      return await this.fetchState();
    } catch {
      return this.currentState;
    }
  }

  async setVolume(volume: number): Promise<MediaActivityState> {
    const clamped = Math.max(0, Math.min(100, volume));
    const jxa = `
      function run() {
        const se = Application("System Events");
        const procs = se.applicationProcesses.name();
        if (procs.includes("Spotify")) {
          Application("Spotify").soundVolume = ${clamped};
        } else if (procs.includes("Music")) {
          Application("Music").soundVolume = ${clamped};
        }
        se.setVolume(${clamped / 100});
      }
    `;
    try {
      await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxa], { timeout: 2500 });
      this.currentState.volume = clamped;
      this.notify();
      return this.currentState;
    } catch {
      return this.currentState;
    }
  }

  getState(): MediaActivityState {
    return this.currentState;
  }
}
