/**
 * AETHERIA | Adaptive Audio-Reactive Engine (Web Audio API)
 * Implements Adaptive Beat Detection with energy history buffer (artef4kt).
 * Supports System/Tab Audio Capture (getDisplayMedia), Live Microphone, Local MP3/WAV, and Synth.
 */

(function (root) {
  'use strict';

  class AudioReactiveEngine {
    constructor() {
      this.audioCtx = null;
      this.analyser = null;
      this.sourceNode = null;
      this.stream = null;
      this.audioElement = null;
      this.synthOscillator = null;

      this.isListening = false;
      this.mode = 'off'; // 'off', 'mic', 'system', 'file', 'synth'

      this.fftSize = 128; // 64 bins (optimized for ultra-low CPU)
      this.freqData = new Uint8Array(64);
      this.energyHistory = new Float32Array(43); // ~1 second history buffer
      this.historyIndex = 0;

      this.bassEnergy = 0;
      this.midEnergy = 0;
      this.highEnergy = 0;
      this.isBeatDetected = false;
      this.lastBeatTime = 0;
      this.beatCooldownMs = 280;
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
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.sourceNode = this.audioCtx.createMediaStreamSource(this.stream);
        this.sourceNode.connect(this.analyser);
        this.isListening = true;
        this.mode = 'mic';
        return true;
      } catch (err) {
        console.warn('Acceso al micrófono no concedido o no disponible:', err);
        return false;
      }
    }

    async startSystemAudio() {
      this.stop();
      this.ensureContext();

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          console.warn('getDisplayMedia no soportado en este entorno.');
          return false;
        }

        // Request display media with audio enabled
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        const audioTracks = displayStream.getAudioTracks();
        if (!audioTracks || audioTracks.length === 0) {
          console.warn('No se seleccionó la casilla "Compartir audio de pestaña/sistema".');
          displayStream.getTracks().forEach((t) => t.stop());
          return false;
        }

        // Stop video tracks immediately to preserve 100% GPU/CPU power for simulation
        displayStream.getVideoTracks().forEach((vt) => vt.stop());

        this.stream = displayStream;
        this.sourceNode = this.audioCtx.createMediaStreamSource(displayStream);
        this.sourceNode.connect(this.analyser);
        this.isListening = true;
        this.mode = 'system';
        return true;
      } catch (err) {
        console.warn('Captura de audio del sistema cancelada:', err);
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
      this.analyser.connect(this.audioCtx.destination);

      this.audioElement.play();
      this.isListening = true;
      this.mode = 'file';
    }

    startCosmicSynth() {
      this.stop();
      this.ensureContext();

      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

      const osc = this.audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, this.audioCtx.currentTime); // A1 bass

      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(2.0, this.audioCtx.currentTime);
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
      if (this.stream) {
        this.stream.getTracks().forEach((t) => t.stop());
        this.stream = null;
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

      // Adaptive Beat Detection
      const instantEnergy = this.bassEnergy;
      let historySum = 0;
      for (let i = 0; i < 43; i++) historySum += this.energyHistory[i];
      const avgEnergy = historySum / 43.0;

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

      this.energyHistory[this.historyIndex] = instantEnergy;
      this.historyIndex = (this.historyIndex + 1) % 43;
    }
  }

  root.AetheriaAudio = new AudioReactiveEngine();
})(typeof window !== 'undefined' ? window : this);
