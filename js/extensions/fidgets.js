/**
 * AETHERIA | Fidgets & Physical Interactions
 * Controls Supernova polychrome radial shockwave, Vortex rotational impulse,
 * Tsunami wave, Cosmic Rain, Tangible Gravity, and Sensory Profiles (Fluid, Sand, Gas, Lava Lamp).
 * Physically coupled with Autonomous Swarm Boids (AetheriaSwarm.applyForceField).
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
      return [0.957, 0.502, 0.404]; // Wada Grenadine Pink #f48067
    }

    _getPaletteColorAt(idx, fallbackColor) {
      if (typeof AetheriaState !== 'undefined' && typeof AetheriaState.getPaletteColors === 'function') {
        const cols = AetheriaState.getPaletteColors();
        if (Array.isArray(cols) && cols.length > 0) {
          return cols[idx % cols.length];
        }
      }
      return fallbackColor;
    }

    // ==========================================
    // 3.1 Supernova (Onda de Choque Policromática Wada)
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

      const isSwarmActive = (typeof AetheriaSwarm !== 'undefined' && AetheriaSwarm.isEnabled);
      const extraIntensity = isSwarmActive ? 1.85 : 1.0;
      const count = isSwarmActive ? 36 : 24;
      const force = 3400 * extraIntensity;
      const radiusScale = 0.65 * (isSwarmActive ? 1.25 : 1.0);

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const dx = Math.cos(angle) * force;
        const dy = Math.sin(angle) * force;
        const rayColor = (Array.isArray(colorRgb) && colorRgb.length >= 3)
          ? col
          : this._getPaletteColorAt(i, col);
        activeCore.splat(center.x, center.y, dx, dy, rayColor, radiusScale);
      }

      // Impulsar físicamente el cardumen de peces ante la onda expansiva
      if (typeof AetheriaSwarm !== 'undefined' && typeof AetheriaSwarm.applyForceField === 'function') {
        AetheriaSwarm.applyForceField(center.x, center.y, 0.0055, 'radial');
      }

      // Emitir partículas solares Wada (Cempasúchil #f37420 & Canario #ffdd00)
      const ps = this.particleSystem;
      if (ps && typeof document !== 'undefined') {
        const canvas = document.getElementById('gl-canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const cx = rect.left + center.x * rect.width;
        const cy = rect.top + (1.0 - center.y) * rect.height;

        if (typeof ps.setEffect === 'function') {
          ps.setEffect('fire', '#f37420');
        }
        const particleCount = isSwarmActive ? 46 : 30;
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * (isSwarmActive ? 11 : 8);
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed - 1;
          if (typeof ps.emit === 'function') {
            ps.emit(cx, cy, vx, vy, (i % 2 === 0) ? '#ffdd00' : '#dd4027', 'fire', 2);
          }
        }
      }

      this.lastAction = 'supernova';
    }

    // ==========================================
    // 3.2 Vórtice (Remolino Helicoidal Ollin)
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
      const radius = 0.085;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ox = MathUtils.clamp(center.x + Math.cos(angle) * radius, 0, 1);
        const oy = MathUtils.clamp(center.y + Math.sin(angle) * radius, 0, 1);
        const dx = -Math.sin(angle) * force;
        const dy = Math.cos(angle) * force;
        const armColor = (Array.isArray(colorRgb) && colorRgb.length >= 3)
          ? col
          : this._getPaletteColorAt(i, col);
        activeCore.splat(ox, oy, dx, dy, armColor, 0.6);
      }

      // Arrastrar tangencialmente a los peces cercanos
      if (typeof AetheriaSwarm !== 'undefined' && typeof AetheriaSwarm.applyForceField === 'function') {
        AetheriaSwarm.applyForceField(center.x, center.y, 0.0048, 'vortex');
      }

      const ps = this.particleSystem;
      if (ps && typeof document !== 'undefined') {
        const canvas = document.getElementById('gl-canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const cx = rect.left + center.x * rect.width;
        const cy = rect.top + (1.0 - center.y) * rect.height;

        if (typeof ps.setEffect === 'function') {
          ps.setEffect('dust', '#0093a5');
        }
        for (let i = 0; i < 35; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 6;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          if (typeof ps.emit === 'function') {
            ps.emit(cx + Math.cos(angle) * 30, cy + Math.sin(angle) * 30, vx, vy, '#78cdd0', 'dust', 2);
          }
        }
      }

      this.lastAction = 'vortex';
    }

    // ==========================================
    // 3.3 Tsunami / Marea Transversal
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
        const waveCol = (Array.isArray(colorRgb) && colorRgb.length >= 3)
          ? col
          : this._getPaletteColorAt(i, col);
        if (direction === 'horizontal') {
          const y = 0.15 + (i / steps) * 0.70 + Math.sin(i * 0.8) * 0.06;
          activeCore.splat(0.08, MathUtils.clamp(y, 0.05, 0.95), force, (Math.random() - 0.5) * 600, waveCol, 0.55);
        } else {
          const x = 0.15 + (i / steps) * 0.70 + Math.cos(i * 0.8) * 0.06;
          activeCore.splat(MathUtils.clamp(x, 0.05, 0.95), 0.08, (Math.random() - 0.5) * 600, force, waveCol, 0.55);
        }
      }

      if (typeof AetheriaSwarm !== 'undefined' && typeof AetheriaSwarm.applyForceField === 'function') {
        AetheriaSwarm.applyForceField(0.1, 0.5, 0.005, 'tsunami');
      }

      const ps = this.particleSystem;
      if (ps && typeof document !== 'undefined') {
        const canvas = document.getElementById('gl-canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        if (typeof ps.setEffect === 'function') {
          ps.setEffect('bubbles', '#78cdd0');
        }
        for (let i = 0; i < 25; i++) {
          const cx = rect.left + Math.random() * rect.width;
          const cy = rect.top + Math.random() * rect.height;
          if (typeof ps.emit === 'function') {
            ps.emit(cx, cy, (Math.random() - 0.5) * 8, -2 - Math.random() * 4, '#78cdd0', 'bubbles', 2);
          }
        }
      }

      this.lastAction = 'tsunami';
    }

    // ==========================================
    // 3.4 Lluvia de Tláloc / Gotas Minerales
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
      const force = -3200;

      for (let i = 0; i < count; i++) {
        const rx = Math.random() * 0.94 + 0.03;
        const ry = 0.96 - Math.random() * 0.15;
        const dropCol = (Array.isArray(colorRgb) && colorRgb.length >= 3)
          ? col
          : this._getPaletteColorAt(i, col);
        activeCore.splat(rx, ry, (Math.random() - 0.5) * 250, force, dropCol, 0.35);
      }

      const ps = this.particleSystem;
      if (ps && typeof document !== 'undefined') {
        const canvas = document.getElementById('gl-canvas');
        const rect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        if (typeof ps.setEffect === 'function') {
          ps.setEffect('star', '#f5ecc2');
        }
        for (let i = 0; i < count; i++) {
          const px = rect.left + Math.random() * rect.width;
          const py = rect.top + Math.random() * (rect.height * 0.3);
          if (typeof ps.emit === 'function') {
            ps.emit(px, py, (Math.random() - 0.5) * 3, 5 + Math.random() * 6, '#ffdd00', 'star', 2);
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
      // Soportar firma setGravityMagnitude(mag) y setGravityMagnitude(core, mag)
      if (typeof core === 'number' && mag === undefined) {
        mag = core;
        core = null;
      }
      const parsed = parseFloat(mag);
      if (Number.isFinite(parsed)) {
        this.gravityMagnitude = -Math.abs(parsed);
      }
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
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.isPaused = activeCore.config.PAUSED;
      }
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
          CURL: 44.0,
          SPLAT_RADIUS: 0.25,
          THERMAL_CONVECTION: false,
          SUNRAYS: true,
          BLOOM: true
        });
        activeCore.setGravity(0.0, 0.0);
      } else if (elementName === 'sand') {
        activeCore.setConfig({
          DENSITY_DISSIPATION: 0.85,
          VELOCITY_DISSIPATION: 0.28,
          CURL: 18.0,
          SPLAT_RADIUS: 0.25,
          THERMAL_CONVECTION: false,
          SUNRAYS: false,
          BLOOM: false
        });
        activeCore.setGravity(0.0, 0.0);
      } else if (elementName === 'lava') {
        activeCore.setConfig({
          DENSITY_DISSIPATION: 0.992,
          VELOCITY_DISSIPATION: 0.96,
          CURL: 14.0,
          SPLAT_RADIUS: 0.42,
          THERMAL_CONVECTION: true,
          SUNRAYS: true,
          BLOOM: true
        });
        // En modo Lava la flotabilidad la gobierna THERMAL_CONVECTION (Rayleigh-Bénard)
        activeCore.setGravity(0.0, 0.0);
      } else if (elementName === 'fluid') {
        activeCore.setConfig({
          DENSITY_DISSIPATION: 0.98,
          VELOCITY_DISSIPATION: 0.20,
          CURL: 30.0,
          SPLAT_RADIUS: 0.25,
          THERMAL_CONVECTION: false,
          SUNRAYS: true,
          BLOOM: true
        });
        activeCore.setGravity(0.0, 0.0);
      }
    }
  }

  root.AetheriaFidgets = new FidgetsController();
})(typeof window !== 'undefined' ? window : this);
