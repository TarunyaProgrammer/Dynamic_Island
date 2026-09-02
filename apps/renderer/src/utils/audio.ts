// apps/renderer/src/utils/audio.ts - Zero-Dependency Web Audio Synthesizer
class SoundEngine {
  private ctx: AudioContext | null = null;

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
   * Ethereal multi-tone crystal bell chime for focus session completion
   */
  playFocusChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Harmonic frequencies: E5, G#5, B5, E6 (E-major radiant chime)
    const notes = [659.25, 830.61, 987.77, 1318.51];

    notes.forEach((freq, i) => {
      const startTime = now + i * 0.12;

      // Primary oscillator (pure warm sine)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Shimmer overtone (soft triangle)
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, startTime);

      // Amplitude Envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

      overtoneGain.gain.setValueAtTime(0.001, startTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.06, startTime + 0.03);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      // Connect nodes
      osc.connect(gain);
      overtone.connect(overtoneGain);
      gain.connect(ctx.destination);
      overtoneGain.connect(ctx.destination);

      osc.start(startTime);
      overtone.start(startTime);
      osc.stop(startTime + 1.9);
      overtone.stop(startTime + 1.3);
    });
  }

  /**
   * Snappy tactile pop for milestone check and progress increments
   */
  playMilestonePop(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency pitch sweep from 440Hz up to 880Hz
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Celebratory crystal fanfare for goal completion
   */
  playGoalFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Ascending victory arpeggio: C5 -> E5 -> G5 -> C6 -> E6
    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];

    chords.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === chords.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      const peakVolume = idx === chords.length - 1 ? 0.28 : 0.18;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakVolume, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.6);
    });
  }

  /**
   * Subtle click for timer start / pause / resume
   */
  playTickSound(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }
}

export const soundEffects = new SoundEngine();
