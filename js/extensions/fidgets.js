/**
 * AETHERIA | Fidgets & Physical Interactions
 * Controls Supernova radial shockwave, Vortex rotational impulse, Tangible Gravity,
 * and Sensory Profiles (Fluid, Sand, Gas, Lava Lamp).
 */

(function (root) {
  'use strict';

  class FidgetsController {
    constructor() {
      this.isGravityActive = false;
      this.gravityMagnitude = -1.85; // Tangible downward cascade
      this.lastAction = null;
    }

    get particleSystem() {
      return (typeof window !== 'undefined' && window.AetheriaParticles) || (typeof AetheriaParticles !== 'undefined' ? AetheriaParticles : null);
    }

    _getCore(core) {
      if (core && typeof core.splat === 'function') return core;
      if (typeof window !== 'undefined' && window.FluidCore) return window.FluidCore;
      if (typeof FluidCore !== 'undefined') return FluidCore;
      return null;
    }

    _getColor(colorRgb) {
      if (Array.isArray(colorRgb) && colorRgb.length >= 3) return colorRgb;
      if (typeof window !== 'undefined' && window.AetheriaUI && typeof window.AetheriaUI.getNextColor === 'function') {
        return window.AetheriaUI.getNextColor();
      }
      return [1.0, 0.2, 0.6];
    }

    // ==========================================
    // 3.1 Supernova (con coordenadas de cursor)
    // ==========================================
    supernova(x = 0.5, y = 0.5) {
      const core = this._getCore();
      if (!core) return;
      const color = this._getColor();
      this.triggerSupernova(core, color, { x, y });
    }

    triggerSupernova(core, colorRgb, center = { x: 0.5, y: 0.5 }) {
      const activeCore = this._getCore(core);
      if (!activeCore) return;
      const col = this._getColor(colorRgb);

      // [MEJORA] Detectar si el swarm está activo y ajustar intensidad
      const isSwarmActive = (typeof AetheriaSwarm !== 'undefined' && AetheriaSwarm.isEnabled);
      const extraIntensity = isSwarmActive ? 2.0 : 1.0;
      const count = isSwarmActive ? 36 : 24;
      const force = 3400 * extraIntensity;
      const radiusScale = 0.65 * (isSwarmActive ? 1.3 : 1.0);

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const dx = Math.cos(angle) * force;
        const dy = Math.sin(angle) * force;
        activeCore.splat(center.x, center.y, dx, dy, col, radiusScale);
      }

      // === EMITIR PARTÍCULAS (Fuego/Plasma) ===
      const ps = this.particleSystem;
      if (ps && typeof document !== 'undefined') {
        const canvas = document.getElementById('gl-canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const cx = rect.left + center.x * rect.width;
        const cy = rect.top + (1.0 - center.y) * rect.height; // WebGL Y invertido

        if (typeof ps.setEffect === 'function') {
          ps.setEffect('fire', '#ffaa44');
        }
        const particleCount = isSwarmActive ? 50 : 30; // Más partículas si swarm activo
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * (isSwarmActive ? 12 : 8);
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed - 1;
          if (typeof ps.emit === 'function') {
            ps.emit(cx, cy, vx, vy, '#ff007f', 'fire', 2);
          }
        }
      }

      this.lastAction = 'supernova';
    }

    // ==========================================
    // 3.2 Vórtice (con coordenadas de cursor)
    // ==========================================
    vortex(x = 0.5, y = 0.5) {
      const core = this._getCore();
      if (!core) return;
      const color = this._getColor();
      this.triggerVortex(core, color, { x, y });
    }

    triggerVortex(core, colorRgb, center = { x: 0.5, y: 0.5 }, clockwise = true) {
      const activeCore = this._getCore(core);
      if (!activeCore) return;
      const col = this._getColor(colorRgb);
      const count = 28;
      const force = 3200 * (clockwise ? 1 : -1);
      const radius = 0.08;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ox = Math.max(0, Math.min(1, center.x + Math.cos(angle) * radius));
        const oy = Math.max(0, Math.min(1, center.y + Math.sin(angle) * radius));
        const dx = -Math.sin(angle) * force;
        const dy = Math.cos(angle) * force;
        activeCore.splat(ox, oy, dx, dy, col, 0.6);
      }

      // === EMITIR PARTÍCULAS (Polvo cósmico) ===
      const ps = this.particleSystem;
      if (ps && typeof document !== 'undefined') {
        const canvas = document.getElementById('gl-canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const cx = rect.left + center.x * rect.width;
        const cy = rect.top + (1.0 - center.y) * rect.height;

        if (typeof ps.setEffect === 'function') {
          ps.setEffect('dust', '#00ccff');
        }
        for (let i = 0; i < 35; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 6;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          if (typeof ps.emit === 'function') {
            ps.emit(cx + Math.cos(angle) * 30, cy + Math.sin(angle) * 30, vx, vy, '#00e5ff', 'dust', 2);
          }
        }
      }

      this.lastAction = 'vortex';
    }

    // ==========================================
    // 3.3 Tsunami / Pulso Cuántico
    // ==========================================
    tsunami() {
      const core = this._getCore();
      if (!core) return;
      const color = this._getColor();
      this.triggerTsunami(core, color, 'horizontal');
    }

    triggerTsunami(core, colorRgb, direction = 'horizontal') {
      const activeCore = this._getCore(core);
      if (!activeCore) return;
      const col = this._getColor(colorRgb);
      const steps = 18;
      const force = 4000;

      for (let i = 0; i < steps; i++) {
        const norm = (i + 0.5) / steps;
        if (direction === 'horizontal') {
          // Onda transversal que barre de izquierda a derecha con oscilación
          const y = 0.3 + Math.sin(i * 0.8) * 0.3;
          activeCore.splat(0.08, y, force, (Math.random() - 0.5) * 600, col, 0.55);
        } else {
          // Onda vertical que surge desde la base
          const x = 0.3 + Math.cos(i * 0.8) * 0.3;
          activeCore.splat(x, 0.08, (Math.random() - 0.5) * 600, force, col, 0.55);
        }
      }

      // === EMITIR PARTÍCULAS (Espuma / Burbujas) ===
      const ps = this.particleSystem;
      if (ps && typeof document !== 'undefined') {
        const canvas = document.getElementById('gl-canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        if (typeof ps.setEffect === 'function') {
          ps.setEffect('bubbles', '#66ccff');
        }
        for (let i = 0; i < 25; i++) {
          const cx = rect.left + Math.random() * rect.width;
          const cy = rect.top + Math.random() * rect.height;
          if (typeof ps.emit === 'function') {
            ps.emit(cx, cy, (Math.random() - 0.5) * 8, -2 - Math.random() * 4, '#66ccff', 'bubbles', 2);
          }
        }
      }

      this.lastAction = 'tsunami';
    }

    // ==========================================
    // 3.4 Lluvia Cósmica / Gotas
    // ==========================================
    meteorRain() {
      const core = this._getCore();
      if (!core) return;
      const color = this._getColor();
      this.triggerCosmicRain(core, color, 24);
    }

    triggerCosmicRain(core, colorRgb, count = 20) {
      const activeCore = this._getCore(core);
      if (!activeCore) return;
      const col = this._getColor(colorRgb);
      const force = -3200; // Impulso gravitatorio hacia abajo

      for (let i = 0; i < count; i++) {
        const rx = Math.random() * 0.94 + 0.03;
        const ry = 0.96 - Math.random() * 0.15;
        activeCore.splat(rx, ry, (Math.random() - 0.5) * 250, force, col, 0.35);
      }

      // === EMITIR PARTÍCULAS (Estrellas / Chispas) ===
      const ps = this.particleSystem;
      if (ps && typeof document !== 'undefined') {
        const canvas = document.getElementById('gl-canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        if (typeof ps.setEffect === 'function') {
          ps.setEffect('star', '#88ddff');
        }
        for (let i = 0; i < count; i++) {
          const px = rect.left + Math.random() * rect.width;
          const py = rect.top + Math.random() * (rect.height * 0.3);
          if (typeof ps.emit === 'function') {
            ps.emit(px, py, (Math.random() - 0.5) * 3, 5 + Math.random() * 6, '#88ddff', 'star', 2);
          }
        }
      }

      this.lastAction = 'meteor';
    }

    // ==========================================
    // 3.5 Gravedad
    // ==========================================
    toggleGravity(core) {
      const activeCore = this._getCore(core);
      if (!activeCore) return false;
      this.isGravityActive = !this.isGravityActive;

      if (this.isGravityActive) {
        activeCore.setGravity(0.0, this.gravityMagnitude);
      } else {
        activeCore.setGravity(0.0, 0.0);
      }

      this.lastAction = 'gravity';
      return this.isGravityActive;
    }

    setGravityMagnitude(core, mag) {
      this.gravityMagnitude = mag;
      const activeCore = this._getCore(core);
      if (this.isGravityActive && activeCore) {
        activeCore.setGravity(0.0, this.gravityMagnitude);
      }
    }

    // ==========================================
    // 3.6 Pausa, Limpieza y Captura
    // ==========================================
    togglePause(core) {
      const activeCore = this._getCore(core);
      if (!activeCore) return false;
      activeCore.config.PAUSED = !activeCore.config.PAUSED;
      this.lastAction = 'pause';
      return activeCore.config.PAUSED;
    }

    clearFluid(core) {
      const activeCore = this._getCore(core);
      if (activeCore && typeof activeCore.reset === 'function') {
        activeCore.reset();
      }
      this.lastAction = 'clear';
    }

    clear(core) {
      this.clearFluid(core);
    }

    clearCanvas(core, particles) {
      this.clearFluid(core);
      if (particles && typeof particles.reset === 'function') {
        particles.reset();
      }
    }

    screenshot() {
      if (typeof window !== 'undefined' && window.AetheriaUI && typeof window.AetheriaUI.exportSnapshot === 'function') {
        window.AetheriaUI.exportSnapshot();
      }
    }

    toggleRecording() {
      if (typeof window !== 'undefined' && window.AetheriaRecorder) {
        if (window.AetheriaRecorder.isRecording) {
          window.AetheriaRecorder.stopRecording();
          if (window.AetheriaUI && typeof window.AetheriaUI.updateRecordingUI === 'function') {
            window.AetheriaUI.updateRecordingUI(false);
          }
        } else {
          window.AetheriaRecorder.startRecording(0, true);
          if (window.AetheriaUI && typeof window.AetheriaUI.updateRecordingUI === 'function') {
            window.AetheriaUI.updateRecordingUI(true);
          }
        }
      }
    }

    applyElementProfile(core, elementName) {
      const activeCore = this._getCore(core);
      if (!activeCore) return;

      if (elementName === 'gas') {
        activeCore.setConfig({
          DENSITY_DISSIPATION: 0.35,
          VELOCITY_DISSIPATION: 0.15,
          CURL: 42.0,
          SPLAT_RADIUS: 0.25,
          SUNRAYS: true,
          BLOOM: true
        });
        activeCore.setGravity(0.0, 0.0);
      } else if (elementName === 'sand') {
        activeCore.setConfig({
          DENSITY_DISSIPATION: 0.85,
          VELOCITY_DISSIPATION: 0.28,
          CURL: 20.0,
          SPLAT_RADIUS: 0.25,
          SUNRAYS: false,
          BLOOM: false
        });
        activeCore.setGravity(0.0, 0.0);
      } else if (elementName === 'lava') {
        activeCore.setConfig({
          DENSITY_DISSIPATION: 0.993,
          VELOCITY_DISSIPATION: 0.985,
          CURL: 15.0,
          SPLAT_RADIUS: 0.42,
          SUNRAYS: true,
          BLOOM: true
        });
        activeCore.setGravity(0.0, 0.95);
      } else if (elementName === 'fluid') {
        activeCore.setConfig({
          DENSITY_DISSIPATION: 0.98,
          VELOCITY_DISSIPATION: 0.20,
          CURL: 30.0,
          SPLAT_RADIUS: 0.25,
          SUNRAYS: true,
          BLOOM: true
        });
        activeCore.setGravity(0.0, 0.0);
      }
    }
  }

  root.AetheriaFidgets = new FidgetsController();
})(typeof window !== 'undefined' ? window : this);
