/**
 * AETHERIA | Adaptive Audio-Reactive Engine (Web Audio API)
 * Implements Adaptive Beat Detection with energy history buffer (artef4kt)
 * Supports Live Microphone, Local MP3/WAV playback, and Cosmic Synth Demo.
 */

(function (root) {
  'use strict';

  class AudioReactiveEngine {
    constructor() {
      this.audioCtx = null;
      this.analyser = null;
      this.sourceNode = null;
      this.micStream = null;
      this.audioElement = null;
      this.synthOscillator = null;

      this.isListening = false;
      this.mode = 'off'; // 'off', 'mic', 'file', 'synth'

      this.fftSize = 128; // 64 bins (optimized for ultra-low CPU)
      this.freqData = new Uint8Array(64);
      this.energyHistory = new Float32Array(43); // ~1 second history buffer at 45-60fps
      this.historyIndex = 0;

      this.bassEnergy = 0;
      this.midEnergy = 0;
      this.highEnergy = 0;
      this.isBeatDetected = false;
      this.lastBeatTime = 0;
      this.beatCooldownMs = 280; // Minimum interval between beat shocks
    }

    ensureContext() {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = this.fftSize;
        this.analyser.smoothingTimeConstant = 0.8;
      }
    }

    async startMic() {
      this.stop();
      this.ensureContext();

      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
        this.sourceNode.connect(this.analyser);
        this.isListening = true;
        this.mode = 'mic';
        return true;
      } catch (err) {
        console.warn('Acceso al micrófono no concedido o no disponible:', err);
        return false;
      }
    }

    playAudioFile(file) {
      this.stop();
      this.ensureContext();

      const url = URL.createObjectURL(file);
      this.audioElement = new Audio(url);
      this.audioElement.loop = true;
      this.audioElement.crossOrigin = 'anonymous';

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination); // Play to speakers

      this.audioElement.play();
      this.isListening = true;
      this.mode = 'file';
    }

    startCosmicSynth() {
      this.stop();
      this.ensureContext();

      // Lightweight rhythmic lo-fi generative chord pulse for ambient videos
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

      const osc = this.audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, this.audioCtx.currentTime); // A1 note bass

      // LFO modulation for pulse rhythm
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(2.0, this.audioCtx.currentTime); // 120 BPM pulse
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(25, this.audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(masterGain);
      masterGain.connect(this.analyser);
      masterGain.connect(this.audioCtx.destination);

      osc.start();
      lfo.start();

      this.synthOscillator = osc;
      this.isListening = true;
      this.mode = 'synth';
    }

    stop() {
      if (this.micStream) {
        this.micStream.getTracks().forEach((t) => t.stop());
        this.micStream = null;
      }
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement = null;
      }
      if (this.synthOscillator) {
        try { this.synthOscillator.stop(); } catch (e) {}
        this.synthOscillator = null;
      }
      if (this.sourceNode) {
        try { this.sourceNode.disconnect(); } catch (e) {}
        this.sourceNode = null;
      }
      this.isListening = false;
      this.mode = 'off';
    }

    update() {
      if (!this.isListening || !this.analyser) {
        this.bassEnergy = 0;
        this.midEnergy = 0;
        this.highEnergy = 0;
        this.isBeatDetected = false;
        return;
      }

      this.analyser.getByteFrequencyData(this.freqData);

      // 1. Calculate Sub-bands
      // Bass: bins 1 to 6 (~20Hz to 180Hz)
      let bassSum = 0;
      for (let i = 1; i <= 6; i++) bassSum += this.freqData[i];
      this.bassEnergy = bassSum / (6 * 255.0);

      // Mids: bins 7 to 24 (~200Hz to 1600Hz)
      let midSum = 0;
      for (let i = 7; i <= 24; i++) midSum += this.freqData[i];
      this.midEnergy = midSum / (18 * 255.0);

      // Highs: bins 25 to 55 (~1700Hz to 7000Hz)
      let highSum = 0;
      for (let i = 25; i <= 55; i++) highSum += this.freqData[i];
      this.highEnergy = highSum / (31 * 255.0);

      // 2. Adaptive Beat Detection (Energy History Comparison)
      const instantEnergy = this.bassEnergy;
      let historySum = 0;
      for (let i = 0; i < 43; i++) historySum += this.energyHistory[i];
      const avgEnergy = historySum / 43.0;

      // Variance calculation
      let varianceSum = 0;
      for (let i = 0; i < 43; i++) {
        const diff = this.energyHistory[i] - avgEnergy;
        varianceSum += diff * diff;
      }
      const variance = varianceSum / 43.0;
      const adaptiveC = Math.max(1.15, (-0.0025714 * variance) + 1.45);

      const now = performance.now();
      if (instantEnergy > (adaptiveC * avgEnergy) && (now - this.lastBeatTime) > this.beatCooldownMs && instantEnergy > 0.15) {
        this.isBeatDetected = true;
        this.lastBeatTime = now;
      } else {
        this.isBeatDetected = false;
      }

      // Update circular history buffer
      this.energyHistory[this.historyIndex] = instantEnergy;
      this.historyIndex = (this.historyIndex + 1) % 43;
    }
  }

  root.AetheriaAudio = new AudioReactiveEngine();
})(typeof window !== 'undefined' ? window : this);
