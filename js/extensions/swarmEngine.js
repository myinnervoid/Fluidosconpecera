/**
 * AETHERIA | Autonomous Swarm Engine (Boids / Flocking Multi-Avatar Auto-Pilot)
 * Modo Automático "Pecera":
 * - Física de Boids con Evasión Suave de Bordes (Soft Boundary Repulsion)
 * - Reactividad al Audio (Modulación de velocidad, radio e impulso con getModulation)
 * - Inyección Unificada con Simetría (SymmetryEngine.injectSplat)
 * - Generador Autónomo de Colores: Arcoíris continuo para Nyan Cat y Modulación Temporal Temática
 */

(function (root) {
  'use strict';

  class Boid {
    constructor(id, x, y) {
      this.id = id;
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.0025 + Math.random() * 0.002;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.colorIndex = id * 2;
      this.phase = Math.random() * Math.PI * 2;
      this.angle = angle;
    }

    update(boids, aspect, dt, audioMod = { amplitude: 0, bass: 0 }) {
      const bassBoost = audioMod.bass || 0;

      // 1. Parámetros de Flocking (Separación, Alineación, Cohesión)
      const perceptionRadius = 0.25;
      let sepX = 0, sepY = 0, totalSep = 0;
      let aliX = 0, aliY = 0, totalAli = 0;
      let cohX = 0, cohY = 0, totalCoh = 0;

      for (let other of boids) {
        if (other === this) continue;
        const dx = (this.x - other.x) * aspect;
        const dy = this.y - other.y;
        const dist = Math.hypot(dx, dy);

        if (dist < perceptionRadius && dist > 0.0001) {
          // Separación
          sepX += (dx / dist) / dist;
          sepY += (dy / dist) / dist;
          totalSep++;

          // Alineación
          aliX += other.vx;
          aliY += other.vy;
          totalAli++;

          // Cohesión
          cohX += other.x;
          cohY += other.y;
          totalCoh++;
        }
      }

      if (totalSep > 0) {
        this.vx += (sepX / totalSep) * 0.00015;
        this.vy += (sepY / totalSep) * 0.00015;
      }
      if (totalAli > 0) {
        this.vx += ((aliX / totalAli) - this.vx) * 0.03;
        this.vy += ((aliY / totalAli) - this.vy) * 0.03;
      }
      if (totalCoh > 0) {
        const targetX = cohX / totalCoh;
        const targetY = cohY / totalCoh;
        this.vx += (targetX - this.x) * 0.008;
        this.vy += (targetY - this.y) * 0.008;
      }

      // 2. Regla de la Pecera: Evasión Cuadrática Suave de Bordes (Soft Boundary Repulsion)
      const margin = 0.08;
      const turnForce = 0.00085;
      if (this.x < margin) {
        const d = (margin - this.x) / margin;
        this.vx += turnForce * (1 + d * 2.5);
      }
      if (this.x > 1.0 - margin) {
        const d = (this.x - (1.0 - margin)) / margin;
        this.vx -= turnForce * (1 + d * 2.5);
      }
      if (this.y < margin) {
        const d = (margin - this.y) / margin;
        this.vy += turnForce * (1 + d * 2.5);
      }
      if (this.y > 1.0 - margin) {
        const d = (this.y - (1.0 - margin)) / margin;
        this.vy -= turnForce * (1 + d * 2.5);
      }

      // Fuerza centrípeta suave para mantenerlos orbitando con elegancia
      this.vx += (0.5 - this.x) * 0.00008;
      this.vy += (0.5 - this.y) * 0.00008;

      // 3. Control de Velocidad con oscilación armónica suave (sin audio)
      const timeNow = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;
      const speedOsc = 0.8 + 0.4 * Math.sin(timeNow * 0.75 + this.phase);
      const baseSpeed = 0.0035 * speedOsc;
      const currentSpeed = Math.hypot(this.vx, this.vy);
      if (currentSpeed > 0.00001) {
        this.vx = (this.vx / currentSpeed) * baseSpeed;
        this.vy = (this.vy / currentSpeed) * baseSpeed;
      }

      // 4. Integración de Posición
      this.x += this.vx * 60 * dt;
      this.y += this.vy * 60 * dt;

      // Clamp de seguridad
      this.x = Math.max(0.01, Math.min(0.99, this.x));
      this.y = Math.max(0.01, Math.min(0.99, this.y));
    }
  }

  class SwarmController {
    constructor() {
      this.isEnabled = false;
      this.boids = [];
      this.prevDissipation = 0.98;
      this.time = 0;
      this.initBoids();
    }

    init() {
      this.initBoids();
    }

    initBoids() {
      const count = (typeof AetheriaState !== 'undefined') ? AetheriaState.swarmCount : 3;
      this.boids = [];
      for (let i = 0; i < count; i++) {
        const x = 0.2 + (i * 0.25);
        const y = 0.3 + (i * 0.2);
        this.boids.push(new Boid(i, x, y));
      }
    }

    toggle(forceState = null) {
      this.isEnabled = forceState !== null ? forceState : !this.isEnabled;
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.isSwarmActive = this.isEnabled;
      }
      
      // Ajuste dinámico de disipación para evitar acumulación excesiva en auto-pilot
      if (typeof FluidCore !== 'undefined') {
        if (this.isEnabled) {
          this.prevDissipation = FluidCore.config.DENSITY_DISSIPATION;
          FluidCore.config.DENSITY_DISSIPATION = 1.35;
        } else {
          FluidCore.config.DENSITY_DISSIPATION = this.prevDissipation || 0.98;
        }
      }
      return this.isEnabled;
    }

    /**
     * Generador de color temático y autónomo en modo pecera.
     */
    getAutoSwarmColor(avatarType, boid, time) {
      // 1. Nyan Cat: Arcoíris continuo (Rainbow cycle cromático)
      if (avatarType === 'nyan') {
        const hue = (time * 0.35 + boid.phase * 0.2) % 1.0;
        return this.hsvToRgb(hue, 0.95, 1.0);
      }

      // 2. Cohete: Fuego / Plasma de Ignición
      if (avatarType === 'rocket') {
        const tones = [
          [1.0, 0.15, 0.0],
          [1.0, 0.55, 0.0],
          [1.0, 0.90, 0.1],
          [1.0, 0.05, 0.3]
        ];
        const idx = Math.floor((time * 4 + boid.phase * 3)) % tones.length;
        return tones[Math.abs(idx)];
      }

      // 3. Cometa: Plasma de hielo y haz plateado cósmico
      if (avatarType === 'comet') {
        const tones = [
          [0.92, 0.98, 1.0],
          [0.35, 0.85, 1.0],
          [0.15, 0.55, 0.95],
          [0.75, 0.90, 1.0]
        ];
        const idx = Math.floor((time * 3 + boid.phase * 2)) % tones.length;
        return tones[Math.abs(idx)];
      }

      // 4. Pez Payaso: Arrecife tropical y naranja bioluminiscente
      if (avatarType === 'clownfish') {
        const tones = [
          [1.0, 0.42, 0.0],
          [1.0, 0.60, 0.1],
          [0.0, 0.90, 0.95],
          [1.0, 0.95, 0.85]
        ];
        const idx = Math.floor((time * 2 + boid.phase * 2)) % tones.length;
        return tones[Math.abs(idx)];
      }

      // 5. Hatsune Miku: Teal / Cian neón característico y magenta eléctrico
      if (avatarType === 'miku') {
        const tones = [
          [0.22, 0.77, 0.73], // #39C5BB Miku Teal
          [0.0, 0.95, 0.95],  // Cian eléctrico
          [1.0, 0.05, 0.55],  // Magenta Pop
          [0.85, 0.98, 1.0]   // Blanco Neón
        ];
        const idx = Math.floor((time * 3 + boid.phase * 2)) % tones.length;
        return tones[Math.abs(idx)];
      }

      // 6. Predeterminado / Trazo: Modulación armónica sobre la paleta del estado global
      if (typeof AetheriaState !== 'undefined') {
        const baseColors = AetheriaState.getPaletteColors();
        const baseColor = baseColors[boid.id % baseColors.length] || [0.0, 0.95, 1.0];
        const wave = 0.75 + 0.25 * Math.sin(time * 1.5 + boid.phase);
        return [
          Math.min(1.0, baseColor[0] * wave + 0.1),
          Math.min(1.0, baseColor[1] * wave + 0.1),
          Math.min(1.0, baseColor[2] * wave + 0.1)
        ];
      }

      return [0.0, 0.95, 1.0];
    }

    hsvToRgb(h, s, v) {
      let r, g, b;
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
      }
      return [r, g, b];
    }

    updateAndEmit(dt, fluidCore, particlesEngine) {
      if (!this.isEnabled) return;
      if (typeof AetheriaState !== 'undefined' && AetheriaState.isPaused) return;

      this.time += dt;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;
      const nowSec = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;

      // Sincronizar cantidad de boids con AetheriaState
      const targetCount = (typeof AetheriaState !== 'undefined') ? AetheriaState.swarmCount : 3;
      while (this.boids.length < targetCount) {
        this.boids.push(new Boid(this.boids.length, 0.5 + (Math.random() - 0.5) * 0.3, 0.5 + (Math.random() - 0.5) * 0.3));
      }
      while (this.boids.length > targetCount) {
        this.boids.pop();
      }

      const avatarType = (typeof AetheriaState !== 'undefined') ? AetheriaState.swarmAvatar : 'nyan';
      const trailCfg = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.getTrailConfig() : { radiusScale: 0.35, sparkType: 'star', sparkCount: 2, offset: -0.024, impulse: 0.85 };

      for (let i = 0; i < this.boids.length; i++) {
        const b = this.boids[i];
        b.update(this.boids, aspect, dt);

        // Posición de la Tobera Trasera / Cola
        const speed = Math.hypot(b.vx, b.vy);
        const normVx = speed > 0.0001 ? b.vx / speed : 1.0;
        const normVy = speed > 0.0001 ? b.vy / speed : 0.0;
        const tailOffset = (trailCfg.offset ? Math.abs(trailCfg.offset) : 0.024);
        const tailX = b.x - normVx * tailOffset;
        const tailY = b.y - normVy * tailOffset;

        // Inyección de Color Autónomo
        const color = this.getAutoSwarmColor(avatarType, b, this.time);

        // Oscilación armónica orgánica
        const boidMod = 0.85 + 0.25 * Math.sin(nowSec * 1.2 + b.phase);
        const impulseMultiplier = (trailCfg.impulse || 1.0) * boidMod;
        const splatForce = (FluidCore.config.SPLAT_FORCE || 6000) * 0.42 * impulseMultiplier;
        const splatRadius = trailCfg.radiusScale * (0.9 + 0.2 * Math.sin(nowSec * 0.8 + b.phase));

        // Inyección unificada a través de SymmetryEngine (Bug #2)
        if (typeof AetheriaSymmetry !== 'undefined') {
          AetheriaSymmetry.injectSplat(tailX, tailY, b.vx * splatForce, b.vy * splatForce, color, splatRadius, aspect);
        } else {
          fluidCore.splat(tailX, tailY, b.vx * splatForce, b.vy * splatForce, color, splatRadius);
        }

        // Partículas temáticas desde la tobera
        if (particlesEngine) {
          const hexCol = `rgb(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)})`;
          particlesEngine.emit(tailX * w, (1.0 - tailY) * h, b.vx * 150, b.vy * 150, hexCol, trailCfg.sparkType, trailCfg.sparkCount || 2);
        }
      }
    }

    setBoidsCount(n) {
      const maxAllowed = (typeof AetheriaState !== 'undefined' && AetheriaState.devMode) ? 50 : 10;
      const count = Math.max(1, Math.min(n, maxAllowed));
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.swarmCount = count;
      }
      this.initBoids();
      return count;
    }

    setDevMode(enabled) {
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.devMode = !!enabled;
      }
    }
  }

  root.AetheriaSwarm = new SwarmController();
})(typeof window !== 'undefined' ? window : this);
