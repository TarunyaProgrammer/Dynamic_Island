// packages/core/services/media-service.ts - Hardened & Low-Overhead Media Engine
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

    // Adaptive interval: 1500ms when media is playing for smooth progress, 4000ms when idle
    const interval = delayMs ?? (this.currentState.isPlaying ? 1500 : 4000);
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
    // Remove notification badges like "(4) "
    title = title.replace(/^\(\d+\)\s*/, '');

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
    const script = `
      set result to ""

      -- 1. Check Native Spotify
      if application "Spotify" is running then
        try
          tell application "Spotify"
            if player state is playing or player state is paused then
              set tName to name of current track
              set tArtist to artist of current track
              set tAlbum to album of current track
              set tDur to (duration of current track) / 1000
              set tPos to player position
              set tState to (player state as string)
              set tVol to sound volume
              set result to "Spotify|" & tName & "|" & tArtist & "|" & tAlbum & "|" & tDur & "|" & tPos & "|" & tState & "|" & tVol
            end if
          end tell
        end try
      end if

      -- 2. Check Native Apple Music
      if result is "" and application "Music" is running then
        try
          tell application "Music"
            if player state is playing or player state is paused then
              set tName to name of current track
              set tArtist to artist of current track
              set tAlbum to album of current track
              set tDur to duration of current track
              set tPos to player position
              set tState to (player state as string)
              set tVol to sound volume
              set result to "Music|" & tName & "|" & tArtist & "|" & tAlbum & "|" & tDur & "|" & tPos & "|" & tState & "|" & tVol
            end if
          end tell
        end try
      end if

      -- 3. Check Google Chrome Media Tabs (YouTube, SoundCloud, Web Spotify, etc.)
      if result is "" and application "Google Chrome" is running then
        try
          tell application "Google Chrome"
            repeat with w in windows
              repeat with t in tabs of w
                set tUrl to URL of t
                if tUrl contains "youtube.com/watch" or tUrl contains "music.youtube" or tUrl contains "soundcloud" or tUrl contains "spotify.com" or tUrl contains "twitch.tv" or tUrl contains "netflix.com" then
                  set tTitle to title of t
                  set result to "Chrome|" & tTitle & "|Google Chrome||0|0|playing|50"
                  exit repeat
                end if
              end repeat
              if result is not "" then exit repeat
            end repeat
          end tell
        end try
      end if

      -- 4. Check Arc Browser Media Tabs
      if result is "" and application "Arc" is running then
        try
          tell application "Arc"
            repeat with w in windows
              repeat with t in tabs of w
                set tUrl to URL of t
                if tUrl contains "youtube.com/watch" or tUrl contains "music.youtube" or tUrl contains "soundcloud" or tUrl contains "spotify.com" then
                  set tTitle to title of t
                  set result to "Arc|" & tTitle & "|Arc Browser||0|0|playing|50"
                  exit repeat
                end if
              end repeat
              if result is not "" then exit repeat
            end repeat
          end tell
        end try
      end if

      -- 5. Check Brave Browser Media Tabs
      if result is "" and application "Brave Browser" is running then
        try
          tell application "Brave Browser"
            repeat with w in windows
              repeat with t in tabs of w
                set tUrl to URL of t
                if tUrl contains "youtube.com/watch" or tUrl contains "music.youtube" or tUrl contains "soundcloud" or tUrl contains "spotify.com" then
                  set tTitle to title of t
                  set result to "Brave|" & tTitle & "|Brave Browser||0|0|playing|50"
                  exit repeat
                end if
              end repeat
              if result is not "" then exit repeat
            end repeat
          end tell
        end try
      end if

      return result
    `;

    try {
      // Direct binary invocation without spawning /bin/sh (Prevents Command Injection)
      const { stdout } = await execFileAsync('osascript', ['-e', script], {
        timeout: 2500,
        maxBuffer: 1024 * 64,
      });
      const output = stdout.trim();

      if (output) {
        const parts = output.split('|');
        if (parts.length >= 8) {
          const appName = parts[0];
          let title = parts[1] || 'Unknown Track';
          let artist = parts[2] || 'macOS Media';
          const album = parts[3] || undefined;
          const durationSeconds = Math.round(parseFloat(parts[4]) || 0);
          const progressSeconds = Math.round(parseFloat(parts[5]) || 0);
          const isPlaying = parts[6].toLowerCase() === 'playing';
          const volume = parseInt(parts[7], 10) || 50;

          // For browser tabs, clean title and format source
          if (appName === 'Chrome' || appName === 'Arc' || appName === 'Brave') {
            const cleaned = this.cleanTitle(title);
            title = cleaned.title;
            artist = `${cleaned.source} • ${appName}`;
          }

          const newState: MediaActivityState = {
            title,
            artist,
            album,
            durationSeconds,
            progressSeconds,
            isPlaying,
            volume,
          };

          const trackKey = `${appName}:${title}:${artist}`;
          if (trackKey !== this.lastTrackKey && isPlaying && this.activityEngine) {
            this.lastTrackKey = trackKey;
            // Push brief live activity notification to Dynamic Island
            this.activityEngine.push(
              {
                id: 'beacon-now-playing',
                type: 'media',
                priority: 'normal',
                title: `♫ ${title}`,
                subtitle: artist,
                progressFraction: durationSeconds > 0 ? progressSeconds / durationSeconds : 0,
                timestamp: new Date().toISOString(),
              },
              4500 // auto-dismiss in 4.5s
            );
          }

          this.currentState = newState;
          this.notify();
          return this.currentState;
        }
      }

      // If nothing is playing
      if (this.currentState.isPlaying) {
        this.currentState = {
          title: 'No Media Playing',
          artist: 'macOS Audio',
          isPlaying: false,
          durationSeconds: 0,
          progressSeconds: 0,
          volume: 50,
        };
        this.notify();
      }
    } catch {
      // Non-blocking graceful catch for closed apps
    }

    return this.currentState;
  }

  async playPause(): Promise<MediaActivityState> {
    const script = `
      if application "Spotify" is running then
        tell application "Spotify" to playpause
      else if application "Music" is running then
        tell application "Music" to playpause
      else if application "Google Chrome" is running then
        tell application "Google Chrome"
          repeat with w in windows
            repeat with t in tabs of w
              if URL of t contains "youtube.com/watch" or URL of t contains "music.youtube" then
                tell t to execute javascript "var v = document.querySelector('video') || document.querySelector('audio'); if (v) { v.paused ? v.play() : v.pause(); }"
                exit repeat
              end if
            end repeat
          end repeat
        end tell
      end if
    `;
    try {
      await execFileAsync('osascript', ['-e', script], { timeout: 2500 });
      await new Promise((r) => setTimeout(r, 150));
      return await this.fetchState();
    } catch {
      return this.currentState;
    }
  }

  async nextTrack(): Promise<MediaActivityState> {
    const script = `
      if application "Spotify" is running then
        tell application "Spotify" to next track
      else if application "Music" is running then
        tell application "Music" to next track
      else if application "Google Chrome" is running then
        tell application "Google Chrome"
          repeat with w in windows
            repeat with t in tabs of w
              if URL of t contains "youtube.com" then
                tell t to execute javascript "var nextBtn = document.querySelector('.ytp-next-button'); if (nextBtn) nextBtn.click();"
                exit repeat
              end if
            end repeat
          end repeat
        end tell
      end if
    `;
    try {
      await execFileAsync('osascript', ['-e', script], { timeout: 2500 });
      await new Promise((r) => setTimeout(r, 150));
      return await this.fetchState();
    } catch {
      return this.currentState;
    }
  }

  async previousTrack(): Promise<MediaActivityState> {
    const script = `
      if application "Spotify" is running then
        tell application "Spotify" to previous track
      else if application "Music" is running then
        tell application "Music" to previous track
      end if
    `;
    try {
      await execFileAsync('osascript', ['-e', script], { timeout: 2500 });
      await new Promise((r) => setTimeout(r, 150));
      return await this.fetchState();
    } catch {
      return this.currentState;
    }
  }

  async setVolume(volume: number): Promise<MediaActivityState> {
    const clamped = Math.max(0, Math.min(100, volume));
    const script = `
      if application "Spotify" is running then
        tell application "Spotify" to set sound volume to ${clamped}
      else if application "Music" is running then
        tell application "Music" to set sound volume to ${clamped}
      else
        set volume output volume ${clamped}
      end if
    `;
    try {
      await execFileAsync('osascript', ['-e', script], { timeout: 2500 });
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
