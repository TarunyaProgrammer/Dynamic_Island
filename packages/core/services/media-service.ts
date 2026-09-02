// packages/core/services/media-service.ts - Robust Multi-Source macOS Media Engine
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
            const wins = chrome.windows();
            for (let i = 0; i < wins.length; i++) {
              const tabs = wins[i].tabs();
              for (let j = 0; j < tabs.length; j++) {
                const url = tabs[j].url() || "";
                if (url.includes("youtube.com/watch") || url.includes("music.youtube") || url.includes("soundcloud") || url.includes("spotify.com") || url.includes("twitch.tv") || url.includes("netflix.com")) {
                  return JSON.stringify({
                    app: "Chrome",
                    title: tabs[j].title() || "Web Media",
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
          try {
            Application("Spotify").playpause();
            return "ok";
          } catch(e) {}
        }

        if (procs.includes("Music")) {
          try {
            Application("Music").playpause();
            return "ok";
          } catch(e) {}
        }

        if (procs.includes("Google Chrome")) {
          try {
            const chrome = Application("Google Chrome");
            const wins = chrome.windows();
            for (let i = 0; i < wins.length; i++) {
              const tabs = wins[i].tabs();
              for (let j = 0; j < tabs.length; j++) {
                const url = tabs[j].url() || "";
                if (url.includes("youtube.com") || url.includes("soundcloud.com") || url.includes("spotify.com") || url.includes("netflix.com")) {
                  try {
                    tabs[j].execute({ javascript: "var v = document.querySelector('video') || document.querySelector('audio'); if (v) { v.paused ? v.play() : v.pause(); }" });
                    return "ok";
                  } catch(jsErr) {
                    // Fallback if JS AppleEvents is disabled: focus tab and trigger YouTube playback shortcut 'k'
                    wins[i].activeTabIndex = j + 1;
                    chrome.activate();
                    se.keystroke("k");
                    return "ok";
                  }
                }
              }
            }
          } catch(e) {}
        }

        if (procs.includes("Safari")) {
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
      await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxa], { timeout: 2500 });
      this.currentState.isPlaying = !this.currentState.isPlaying;
      this.notify();
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
          try {
            Application("Spotify").nextTrack();
            return "ok";
          } catch(e) {}
        }

        if (procs.includes("Music")) {
          try {
            Application("Music").nextTrack();
            return "ok";
          } catch(e) {}
        }

        if (procs.includes("Google Chrome")) {
          try {
            const chrome = Application("Google Chrome");
            const wins = chrome.windows();
            for (let i = 0; i < wins.length; i++) {
              const tabs = wins[i].tabs();
              for (let j = 0; j < tabs.length; j++) {
                const url = tabs[j].url() || "";
                if (url.includes("youtube.com")) {
                  try {
                    tabs[j].execute({ javascript: "var n = document.querySelector('.ytp-next-button'); if (n) n.click();" });
                    return "ok";
                  } catch(jsErr) {
                    wins[i].activeTabIndex = j + 1;
                    chrome.activate();
                    se.keyDown("shift");
                    se.keystroke("n");
                    se.keyUp("shift");
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
          try {
            Application("Spotify").previousTrack();
            return "ok";
          } catch(e) {}
        }

        if (procs.includes("Music")) {
          try {
            Application("Music").previousTrack();
            return "ok";
          } catch(e) {}
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
          try {
            Application("Spotify").soundVolume = ${clamped};
          } catch(e) {}
        } else if (procs.includes("Music")) {
          try {
            Application("Music").soundVolume = ${clamped};
          } catch(e) {}
        }
        try {
          se.setVolume(${clamped / 100});
        } catch(e) {}
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
