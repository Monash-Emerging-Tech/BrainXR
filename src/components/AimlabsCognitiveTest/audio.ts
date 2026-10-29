// Procedural Web Audio synthesizer for the Aimlabs Cognitive Test.
// Zero external files, ultra-low latency, and reliable across browsers and WebXR.

class AimlabsAudio {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playShot(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Fast noise burst for initial gun transient
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(2200, t);
    noiseFilter.Q.setValueAtTime(1.5, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

    // Punchy pitch drop oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playHit(isCyanSphere: boolean): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    if (isCyanSphere) {
      // Crystalline shattered chime for cyan sphere
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(880, t);
      osc1.frequency.exponentialRampToValueAtTime(1760, t + 0.08);

      osc2.frequency.setValueAtTime(1320, t);
      osc2.frequency.exponentialRampToValueAtTime(2640, t + 0.1);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.26);
      osc2.stop(t + 0.26);
    } else {
      // Satisfying heavy cyber pop for red box
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(620, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    }
  }

  playError(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Low dual dissonant buzz for false alarm (clicking No-Go)
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.setValueAtTime(110, t + 0.1);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  playCorrectRejection(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.1); // A5

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playCountdown(step: number): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const isGo = step <= 0;
    osc.type = isGo ? "triangle" : "sine";
    osc.frequency.setValueAtTime(isGo ? 880 : 440, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isGo ? 0.35 : 0.18));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + (isGo ? 0.36 : 0.2));
  }

  playRoundComplete(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = t + idx * 0.09;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }
}

export const aimlabsAudio = new AimlabsAudio();

