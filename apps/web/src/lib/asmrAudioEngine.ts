// apps/web/src/lib/asmrAudioEngine.ts
// Native Web Audio API Procedural Synthesizer for Authentic Sundanese Ambience
// Zero external asset dependencies - 100% resilient, offline-ready & lightweight.

export type AsmrPreset = 'rain' | 'kitchen' | 'kacapi' | 'all';

class AsmrAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSources: Array<{ stop: () => void }> = [];
  private currentPreset: AsmrPreset | null = null;
  private currentVolume = 0.5;
  private intervalIds: number[] = [];

  private initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Set Master Volume (0 to 1)
  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getPreset(): AsmrPreset | null {
    return this.currentPreset;
  }

  public isRunning(): boolean {
    return !!(this.ctx && this.ctx.state === 'running' && this.currentPreset !== null);
  }

  // Stop all active audio processes
  public stop() {
    this.intervalIds.forEach((id) => clearInterval(id));
    this.intervalIds = [];

    this.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch {}
    });
    this.activeSources = [];
    this.currentPreset = null;
  }

  // 1. Pink Noise Generator (Authentic Gentle Rain)
  private createRainSound(ctx: AudioContext, parentGain: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise filter algorithm (Paul Kellet)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft raindrops hitting terracotta tiles & green leaves
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    // Subtle LFO for natural gusting rhythm
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.85, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(parentGain);

    whiteNoise.start();
    lfo.start();

    this.activeSources.push({
      stop: () => {
        try {
          whiteNoise.stop();
          lfo.stop();
        } catch {}
      },
    });

    // Periodic Water Droplet (Tetesan Pancuran Bambu)
    const dripInterval = window.setInterval(() => {
      if (!this.isRunning()) return;
      this.playWaterDrop(ctx, parentGain);
    }, 1800 + Math.random() * 2200);

    this.intervalIds.push(dripInterval);
  }

  // Water Drop Sound (Bamboo Fountain / Pancuran)
  private playWaterDrop(ctx: AudioContext, parentGain: GainNode) {
    const osc = ctx.createOscillator();
    const dropGain = ctx.createGain();

    const startFreq = 1600 + Math.random() * 800;
    const endFreq = 900 + Math.random() * 400;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.09);

    dropGain.gain.setValueAtTime(0.001, ctx.currentTime);
    dropGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(dropGain);
    dropGain.connect(parentGain);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.13);
  }

  // 2. Kitchen Sound (Hawu & Kastrol Liwet Sizzle + Fireplace Crackles)
  private createKitchenSound(ctx: AudioContext, parentGain: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const sizzleSource = ctx.createBufferSource();
    sizzleSource.buffer = noiseBuffer;
    sizzleSource.loop = true;

    // Bandpass to capture sizzle of cooking oil & boiling liwet aromatics
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(2400, ctx.currentTime);
    bandpass.Q.setValueAtTime(1.8, ctx.currentTime);

    const sizzleGain = ctx.createGain();
    sizzleGain.gain.setValueAtTime(0.4, ctx.currentTime);

    sizzleSource.connect(bandpass);
    bandpass.connect(sizzleGain);
    sizzleGain.connect(parentGain);

    sizzleSource.start();

    this.activeSources.push({
      stop: () => {
        try {
          sizzleSource.stop();
        } catch {}
      },
    });

    // Random Firewood Crackles (Kayu Bakar Hawu Nenek)
    const crackleInterval = window.setInterval(() => {
      if (!this.isRunning()) return;
      if (Math.random() > 0.4) {
        this.playWoodCrackle(ctx, parentGain);
      }
    }, 700 + Math.random() * 900);

    this.intervalIds.push(crackleInterval);
  }

  // Wood crackle impulse
  private playWoodCrackle(ctx: AudioContext, parentGain: GainNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 1200, ctx.currentTime);

    gain.gain.setValueAtTime(0.08 + Math.random() * 0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(parentGain);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }

  // 3. Kacapi Suling Melodies (Sundanese Pentatonic Scale)
  // Notes: Da (440Hz), Mi (480Hz), Na (540Hz), Ti (660Hz), La (720Hz), Da2 (880Hz)
  private createKacapiSound(ctx: AudioContext, parentGain: GainNode) {
    const sundaneseScale = [293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

    // Background Drone (Suling Hawa Pasundan)
    const droneOsc = ctx.createOscillator();
    const droneFilter = ctx.createBiquadFilter();
    const droneGain = ctx.createGain();

    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(220, ctx.currentTime); // Low A

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(400, ctx.currentTime);

    droneGain.gain.setValueAtTime(0.08, ctx.currentTime);

    droneOsc.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(parentGain);

    droneOsc.start();
    this.activeSources.push({
      stop: () => {
        try {
          droneOsc.stop();
        } catch {}
      },
    });

    // Gentle Kacapi Plucking Pattern
    let noteIndex = 0;
    const melody = [0, 2, 3, 4, 2, 4, 5, 3, 1, 0, 3, 2];

    const kacapiInterval = window.setInterval(() => {
      if (!this.isRunning()) return;

      const baseNote = sundaneseScale[melody[noteIndex % melody.length]];
      noteIndex++;

      this.playKacapiNote(ctx, parentGain, baseNote);
    }, 2400);

    this.intervalIds.push(kacapiInterval);
  }

  private playKacapiNote(ctx: AudioContext, parentGain: GainNode, freq: number) {
    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, ctx.currentTime);

    const now = ctx.currentTime;
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc.connect(noteGain);
    oscHarmonic.connect(noteGain);
    noteGain.connect(parentGain);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 2.25);
    oscHarmonic.stop(now + 2.25);
  }

  // Play Celebratory Sundanese Gamelan Bonang Ding (For Split Bill Completion or Order Placed)
  public playCelebrationChime() {
    try {
      const ctx = this.initContext();
      const chimeGain = ctx.createGain();
      chimeGain.gain.setValueAtTime(this.currentVolume * 0.35, ctx.currentTime);
      chimeGain.connect(ctx.destination);

      const notes = [523.25, 659.25, 783.99, 1046.50]; // Arpeggio C - E - G - C2
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const startTime = ctx.currentTime + idx * 0.12;
        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4);

        osc.connect(noteGain);
        noteGain.connect(chimeGain);

        osc.start(startTime);
        osc.stop(startTime + 1.45);
      });
    } catch {}
  }

  // Start a chosen preset
  public play(preset: AsmrPreset = 'all') {
    this.stop();

    try {
      const ctx = this.initContext();
      this.currentPreset = preset;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.currentVolume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.masterGain = masterGain;

      if (preset === 'rain' || preset === 'all') {
        this.createRainSound(ctx, masterGain);
      }
      if (preset === 'kitchen' || preset === 'all') {
        this.createKitchenSound(ctx, masterGain);
      }
      if (preset === 'kacapi' || preset === 'all') {
        this.createKacapiSound(ctx, masterGain);
      }
    } catch (e) {
      console.warn('Unable to start ASMR audio:', e);
      this.currentPreset = null;
    }
  }
}

export const asmrAudioEngine = new AsmrAudioEngine();
