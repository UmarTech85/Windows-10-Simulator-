/**
 * Web Audio procedural music generator & equalizer engine for Groove Music.
 * Supports multiple synthesized genres and custom uploaded audio playback.
 */

export interface EqBand {
  freq: number;
  gain: number; // in dB (-12 to +12)
  type: BiquadFilterType;
}

export const EQ_FREQUENCIES = [60, 230, 910, 3600, 14000];

export const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0],
  'Bass Boost': [6, 4, 1, 0, 0],
  'Treble Boost': [0, 0, 1, 4, 7],
  Electronic: [5, 3, 0, 2, 5],
  Rock: [4, 2, -1, 3, 4],
  Vocal: [-2, 1, 5, 3, -1],
};

class MusicGenerator {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrack = 'track_lofi';
  private timer: number | null = null;
  private step = 0;
  private masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private volume = 0.6;

  // Real 5-band Graphic Equalizer filters
  private eqFilters: BiquadFilterNode[] = [];
  private eqGains: number[] = [0, 0, 0, 0, 0];

  // Custom audio playback
  private customAudio: HTMLAudioElement | null = null;
  private customSource: MediaElementAudioSourceNode | null = null;

  // Virtual track duration & progress
  private trackSeconds = 0;
  private onTimeUpdateCallback?: (currentTime: number, duration: number) => void;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.8;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        // Build 5-band EQ chain
        let prevNode: AudioNode = this.masterGain;
        this.eqFilters = EQ_FREQUENCIES.map((freq, idx) => {
          const filter = this.ctx!.createBiquadFilter();
          filter.type = idx === 0 ? 'lowshelf' : idx === 4 ? 'highshelf' : 'peaking';
          filter.frequency.value = freq;
          filter.gain.value = this.eqGains[idx];
          filter.Q.value = 1.0;
          prevNode.connect(filter);
          prevNode = filter;
          return filter;
        });

        prevNode.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setTimeUpdateCallback(cb: (currentTime: number, duration: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  public setEqBand(bandIdx: number, gainDb: number) {
    this.eqGains[bandIdx] = Math.max(-12, Math.min(12, gainDb));
    if (this.eqFilters[bandIdx] && this.ctx) {
      this.eqFilters[bandIdx].gain.setValueAtTime(gainDb, this.ctx.currentTime);
    }
  }

  public applyEqPreset(presetName: string) {
    const values = EQ_PRESETS[presetName];
    if (!values) return;
    values.forEach((gain, idx) => {
      this.setEqBand(idx, gain);
    });
  }

  public getEqGains(): number[] {
    return [...this.eqGains];
  }

  public playCustomAudio(audioUrl: string) {
    this.initCtx();
    this.pause();

    if (!this.customAudio) {
      this.customAudio = new Audio();
      this.customAudio.crossOrigin = 'anonymous';
      if (this.ctx && this.masterGain) {
        this.customSource = this.ctx.createMediaElementSource(this.customAudio);
        this.customSource.connect(this.masterGain);
      }
    }

    this.customAudio.src = audioUrl;
    this.customAudio.volume = this.volume;
    this.customAudio.play().catch((e) => console.warn('Audio play failed', e));

    this.isPlaying = true;
    this.currentTrack = 'custom';

    this.customAudio.ontimeupdate = () => {
      if (this.customAudio && this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(
          this.customAudio.currentTime,
          this.customAudio.duration || 180
        );
      }
    };
  }

  public play(trackKey = 'track_lofi', startSec = 0) {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    if (this.customAudio) {
      this.customAudio.pause();
    }

    this.currentTrack = trackKey;
    this.isPlaying = true;
    this.step = Math.floor(startSec * 4);
    this.trackSeconds = startSec;

    if (this.timer) {
      window.clearInterval(this.timer);
    }

    const bpmMap: Record<string, number> = {
      track_lofi: 75,
      track_synth: 120,
      track_piano: 64,
      track_8bit: 135,
      track_cosmic: 55,
    };

    const bpm = bpmMap[trackKey] || 90;
    const intervalMs = (60 / bpm / 2) * 1000; // 8th notes

    this.timer = window.setInterval(() => {
      this.tick();
      this.trackSeconds += intervalMs / 1000;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.trackSeconds % 210, 210);
      }
    }, intervalMs);
  }

  public seek(seconds: number) {
    this.trackSeconds = seconds;
    this.step = Math.floor(seconds * 4);
    if (this.customAudio && this.currentTrack === 'custom') {
      this.customAudio.currentTime = seconds;
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private tick() {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    const now = this.ctx.currentTime;
    const s = this.step % 32;

    switch (this.currentTrack) {
      case 'track_lofi': {
        const lofiChords = [
          [220.0, 261.63, 329.63, 392.0], // Am7
          [174.61, 220.0, 261.63, 329.63], // Fmaj7
          [261.63, 329.63, 392.0, 493.88], // Cmaj7
          [196.0, 246.94, 293.66, 349.23], // G7
        ];
        if (s % 8 === 0) {
          const chordIdx = Math.floor(s / 8);
          lofiChords[chordIdx].forEach((freq) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const filter = this.ctx!.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(750, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain!);

            osc.start(now);
            osc.stop(now + 1.9);
          });
        }
        if (s % 4 === 2) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.07);
        }
        break;
      }

      case 'track_synth': {
        const synthBass = [110, 110, 130.81, 130.81, 98, 98, 87.31, 87.31];
        const bassNote = synthBass[Math.floor(s / 4) % synthBass.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassNote * (s % 2 === 0 ? 1 : 2), now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(260, now + 0.2);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'track_piano': {
        // Serene ambient piano arpeggios
        const pianoScale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
        const note = pianoScale[(s * 3) % pianoScale.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 1.25);
        break;
      }

      case 'track_8bit': {
        // Fast upbeat retro chiptune
        const chiptuneScale = [440, 523.25, 659.25, 783.99, 880, 1046.5];
        const note = chiptuneScale[s % chiptuneScale.length];
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }

      case 'track_cosmic': {
        // Atmospheric floating space pads
        if (s % 16 === 0) {
          const spacePads = [130.81, 164.81, 196.0, 246.94];
          spacePads.forEach((freq) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 1.0);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

            osc.connect(gain);
            gain.connect(this.masterGain!);
            osc.start(now);
            osc.stop(now + 4.0);
          });
        }
        break;
      }
    }

    this.step++;
  }
}

export const musicGenerator = new MusicGenerator();
