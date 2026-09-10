/**
 * AETHERIA | Native WebGL Canvas MediaRecorder
 * Graba directamente el flujo WebGL a 60 FPS sin capturar interfaces ni barras.
 * - Soporte para resoluciones nativas (1080p, 4K)
 * - Temporizador configurable (Manual, 1 min, 5 min, 10 min, 30 min, 60 min)
 * - Modo Zen automático durante la grabación
 * - Descarga automática en formato WebM / MP4
 * - Control por interfaz y por parámetros URL (?record=300)
 */

(function (root) {
  'use strict';

  class CanvasRecorder {
    constructor() {
      this.mediaRecorder = null;
      this.recordedChunks = [];
      this.isRecording = false;
      this.startTime = 0;
      this.timerInterval = null;
      this.durationLimit = 0; // 0 = manual
      this.widgetEl = null;
    }

    init() {
      this.createUIWidget();
      this.checkUrlParams();
    }

    getSupportedMimeType() {
      const types = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];
      for (let t of types) {
        if (MediaRecorder.isTypeSupported(t)) return t;
      }
      return 'video/webm';
    }

    startRecording(durationSeconds = 0, autoZen = true) {
      if (this.isRecording) {
        return (typeof createApiResponse === 'function')
          ? createApiResponse(false, null, 'ERR_RECORDER_ACTIVE', 'Ya existe una grabación en curso.')
          : { success: false, data: null, error_code: 'ERR_RECORDER_ACTIVE', message: 'Ya existe una grabación en curso.' };
      }

      if (typeof MediaRecorder === 'undefined') {
        return (typeof createApiResponse === 'function')
          ? createApiResponse(false, null, 'ERR_RECORDER_UNSUPPORTED', 'MediaRecorder API no está soportada en este navegador.')
          : { success: false, data: null, error_code: 'ERR_RECORDER_UNSUPPORTED', message: 'MediaRecorder no soportado.' };
      }

      const canvas = document.querySelector('canvas') || document.getElementById('gl-canvas');
      if (!canvas) {
        return (typeof createApiResponse === 'function')
          ? createApiResponse(false, null, 'ERR_CANVAS_CAPTURE_FAILED', 'No se encontró el lienzo Canvas de WebGL.')
          : { success: false, data: null, error_code: 'ERR_CANVAS_CAPTURE_FAILED', message: 'Canvas no encontrado.' };
      }

      let stream;
      try {
        stream = canvas.captureStream ? canvas.captureStream(60) : (canvas.mozCaptureStream ? canvas.mozCaptureStream(60) : null);
      } catch (e) {
        return (typeof createApiResponse === 'function')
          ? createApiResponse(false, null, 'ERR_CANVAS_CAPTURE_FAILED', 'Fallo al capturar stream de video del lienzo.')
          : { success: false, data: null, error_code: 'ERR_CANVAS_CAPTURE_FAILED', message: e.message };
      }

      if (!stream) {
        return (typeof createApiResponse === 'function')
          ? createApiResponse(false, null, 'ERR_CANVAS_CAPTURE_FAILED', 'El navegador no permite captureStream sobre este Canvas.')
          : { success: false, data: null, error_code: 'ERR_CANVAS_CAPTURE_FAILED', message: 'captureStream no disponible.' };
      }

      const mimeType = this.getSupportedMimeType();

      try {
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: 12000000 // 12 Mbps para 1080p nítido
        });
      } catch (e) {
        console.warn('Fallo al inicializar con bitrate alto, usando default:', e);
        try {
          this.mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });
        } catch (err) {
          return (typeof createApiResponse === 'function')
            ? createApiResponse(false, null, 'ERR_RECORDER_FAILED', `Error al inicializar MediaRecorder: ${err.message}`)
            : { success: false, data: null, error_code: 'ERR_RECORDER_FAILED', message: err.message };
        }
      }

      this.recordedChunks = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.finishAndDownload();
      };

      this.durationLimit = durationSeconds;
      this.startTime = Date.now();
      this.isRecording = true;
      this.mediaRecorder.start(1000); // Guardar chunk cada 1s

      if (autoZen && typeof AetheriaUI !== 'undefined' && AetheriaUI.toggleZenMode) {
        AetheriaUI.toggleZenMode(true);
      }

      this.showWidget();
      this.startTimer();

      console.log(`⏺️ Grabación de Canvas iniciada (${mimeType}, Límite: ${durationSeconds}s)`);
      return (typeof createApiResponse === 'function')
        ? createApiResponse(true, { mimeType, durationLimit: durationSeconds }, null, 'Grabación de video iniciada.')
        : { success: true, data: { mimeType, durationLimit: durationSeconds }, error_code: null, message: 'Grabación iniciada.' };
    }

    stopRecording() {
      if (!this.isRecording || !this.mediaRecorder) {
        return (typeof createApiResponse === 'function')
          ? createApiResponse(false, null, null, 'No hay ninguna grabación activa.')
          : { success: false, data: null, error_code: null, message: 'No hay grabación activa.' };
      }
      this.isRecording = false;
      clearInterval(this.timerInterval);
      this.mediaRecorder.stop();
      this.hideWidget();
      return (typeof createApiResponse === 'function')
        ? createApiResponse(true, { chunks: this.recordedChunks.length }, null, 'Grabación finalizada. Procesando descarga...')
        : { success: true, data: { chunks: this.recordedChunks.length }, error_code: null, message: 'Grabación finalizada.' };
    }

    startTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        if (!this.isRecording) return;
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateWidget(elapsed);

        if (this.durationLimit > 0 && elapsed >= this.durationLimit) {
          this.stopRecording();
        }
      }, 1000);
    }

    finishAndDownload() {
      if (this.recordedChunks.length === 0) return;
      const blob = new Blob(this.recordedChunks, { type: this.getSupportedMimeType() });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateTag = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const bgName = (typeof AetheriaState !== 'undefined') ? AetheriaState.activeBackground : 'fluid';
      
      a.href = url;
      a.download = `Aetheria_${bgName}_${dateTag}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 5000);
      console.log('✅ Archivo de video descargado con éxito.');
    }

    createUIWidget() {
      if (document.getElementById('aetheria-recorder-badge')) return;

      const widget = document.createElement('div');
      widget.id = 'aetheria-recorder-badge';
      widget.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(239, 68, 68, 0.5);
        border-radius: 9999px;
        padding: 8px 16px;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        display: none;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
      `;

      widget.innerHTML = `
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#ef4444; animation: pulseRed 1.2s infinite;"></span>
        <span id="aetheria-rec-time" style="font-weight:600; font-variant-numeric: tabular-nums;">REC 00:00</span>
        <button id="aetheria-rec-stop-btn" style="background:#ef4444; border:none; color:white; border-radius:6px; padding:4px 8px; font-size:11px; font-weight:bold; cursor:pointer;">Detener</button>
      `;

      document.body.appendChild(widget);
      this.widgetEl = widget;

      const stopBtn = widget.querySelector('#aetheria-rec-stop-btn');
      if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.stopRecording();
        });
      }

      // Estilo de animación
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulseRed {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }

    showWidget() {
      if (this.widgetEl) this.widgetEl.style.display = 'flex';
    }

    hideWidget() {
      if (this.widgetEl) this.widgetEl.style.display = 'none';
    }

    updateWidget(seconds) {
      const timeEl = document.getElementById('aetheria-rec-time');
      if (!timeEl) return;
      const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
      const secs = String(seconds % 60).padStart(2, '0');
      if (this.durationLimit > 0) {
        const limMins = String(Math.floor(this.durationLimit / 60)).padStart(2, '0');
        const limSecs = String(this.durationLimit % 60).padStart(2, '0');
        timeEl.textContent = `REC ${mins}:${secs} / ${limMins}:${limSecs}`;
      } else {
        timeEl.textContent = `REC ${mins}:${secs}`;
      }
    }

    checkUrlParams() {
      if (typeof window === 'undefined' || !window.location) return;
      const params = new URLSearchParams(window.location.search);
      const recordParam = params.get('record');

      if (recordParam) {
        const duration = parseInt(recordParam, 10) || 300;
        window.addEventListener('load', () => {
          setTimeout(() => {
            this.startRecording(duration, true);
          }, 1200);
        });
      }
    }
  }

  root.AetheriaRecorder = new CanvasRecorder();
})(typeof window !== 'undefined' ? window : this);
