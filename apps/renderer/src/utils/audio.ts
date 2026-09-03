// apps/renderer/src/utils/audio.ts - Restrained Beacon Ambient Light Audio Synthesizer

export type SoundMode = 'silent' | 'subtle' | 'full';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private mode: SoundMode = 'silent'; // OFF by default as required by Beacon design philosophy

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('beacon_sound_mode') as SoundMode;
      if (saved && ['silent', 'subtle', 'full'].includes(saved)) {
        this.mode = saved;
      }
    }
  }

  public getSoundMode(): SoundMode {
    return this.mode;
  }

  public setSoundMode(mode: SoundMode): void {
    this.mode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('beacon_sound_mode', mode);
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Conceptually like a warm lamp turning on:
   * A single soft harmonic crystal chime for meaningful events (goal completed, milestone reached).
   * Active in 'subtle' and 'full' modes.
   */
  playGoalFanfare(): void {
    if (this.mode === 'silent') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Luminous harmonic pair: 528Hz (Warm resonant base) and 1056Hz (Shimmer octave)
    const tones = [528.0, 1056.0];

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const peak = idx === 0 ? 0.16 : 0.05;
      gain.gain.setValueAtTime(0.0001, now);
      // Gentle 40ms attack
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.04);
      // Soft 400ms decay
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.48);
    });
  }

  /**
   * Ethereal upward shimmer for focus timer completion
   */
  playFocusChime(): void {
    if (this.mode === 'silent') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 830.61, 987.77];

    notes.forEach((freq, i) => {
      const startTime = now + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.85);
    });
  }

  /**
   * Snappy click/pop for normal increments.
   * Only active in 'full' mode (Silent & Subtle keep normal clicks completely silent).
   */
  playMilestonePop(): void {
    if (this.mode !== 'full') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Micro tick sound for timers. Active only in 'full' mode.
   */
  playTickSound(): void {
    if (this.mode !== 'full') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * Playful micro-chuckle / giggle chirp when Beacon Spirit is tickled.
   */
  playChuckle(): void {
    if (this.mode === 'silent') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Bubbly cheerful ascending harmonics
    [
      { time: 0, freq: 520, dur: 0.05 },
      { time: 0.06, freq: 680, dur: 0.06 },
      { time: 0.13, freq: 820, dur: 0.07 },
    ].forEach(({ time, freq, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + time + dur);
      gain.gain.setValueAtTime(0.035, now + time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur + 0.01);
    });
  }
}

export const soundEffects = new SoundEngine();
