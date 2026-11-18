/**
 * AETHERIA | Autonomous Swarm Engine (Carangiform Fish Schooling & Multi-Avatar Boids)
 * Modo Automático "Pecera":
 * - Locomoción Hidrodinámica Real (Burst-and-Coast + Ondulación Caudal Carangiforme)
 * - Corrientes de Arrecife Lissajous (Exploración orgánica de todo el lienzo sin órbitas rígidas)
 * - Evasión Cuadrática Suave de Bordes (Soft Boundary Repulsion 0.01 - 0.99)
 * - Reacción Física a Ondas de Choque (Supernova, Vórtice, Tsunami)
 * - Cromática 100% Canónica Sanzo Wada (MANUAL_ARMONIA_CROMATICA_WADA_MEXICO.md)
 */

(function (root) {
  'use strict';

  class Boid {
    constructor(id, x, y) {
      this.id = id;
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.0028 + Math.random() * 0.0018;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.colorIndex = id * 2;
      this.phase = Math.random() * Math.PI * 2;
      this.tailPhase = Math.random() * Math.PI * 2;
      this.tailAngle = 0;
      this.angle = angle;
      this.scale = 0.88 + (id % 3) * 0.10;
      this.impulseVx = 0;
      this.impulseVy = 0;
    }

    update(boids, aspect, dt, audioMod = { amplitude: 0, bass: 0 }) {
      const safeDt = Math.min(Math.max(dt || 0.016, 0.001), 0.05);
      const timeNow = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;

      // 1. Parámetros de Cardumen (Separación, Alineación, Cohesión)
      const perceptionRadius = 0.26;
      const personalSpace = 0.085;
      let sepX = 0, sepY = 0, totalSep = 0;
      let aliX = 0, aliY = 0, totalAli = 0;
      let cohX = 0, cohY = 0, totalCoh = 0;

      for (let other of boids) {
        if (other === this) continue;
        const dx = (this.x - other.x) * aspect;
        const dy = this.y - other.y;
        const dist = MathUtils.magnitude(dx, dy);

        if (dist < perceptionRadius && dist > 0.0001) {
          if (dist < personalSpace) {
            const repulse = (personalSpace - dist) / personalSpace;
            sepX += (dx / dist) * (1.2 + repulse * 2.5);
            sepY += (dy / dist) * (1.2 + repulse * 2.5);
          } else {
            sepX += (dx / dist) / dist * 0.08;
            sepY += (dy / dist) / dist * 0.08;
          }
          totalSep++;

          aliX += other.vx;
          aliY += other.vy;
          totalAli++;

          cohX += other.x;
          cohY += other.y;
          totalCoh++;
        }
      }

      if (totalSep > 0) {
        this.vx += (sepX / totalSep) * 0.00028;
        this.vy += (sepY / totalSep) * 0.00028;
      }
      if (totalAli > 0) {
        this.vx += ((aliX / totalAli) - this.vx) * 0.042;
        this.vy += ((aliY / totalAli) - this.vy) * 0.042;
      }
      if (totalCoh > 0) {
        const targetX = cohX / totalCoh;
        const targetY = cohY / totalCoh;
        this.vx += (targetX - this.x) * 0.0065;
        this.vy += (targetY - this.y) * 0.0065;
      }

      // 2. Corriente de Arrecife Lissajous (Nado orgánico en ocho por toda la pecera)
      const currentTargetX = 0.5 + 0.28 * Math.sin(timeNow * 0.32 + this.id * 0.9);
      const currentTargetY = 0.5 + 0.24 * Math.sin(timeNow * 0.48 + this.id * 0.6 + 1.1);
      this.vx += (currentTargetX - this.x) * 0.00011;
      this.vy += (currentTargetY - this.y) * 0.00011;

      // 3. Regla de la Pecera: Evasión Cuadrática Suave de Bordes (Soft Boundary Repulsion)
      const margin = 0.085;
      const turnForce = 0.00095;
      if (this.x < margin) {
        const d = (margin - this.x) / margin;
        this.vx += turnForce * (1 + d * 2.8);
      }
      if (this.x > 1.0 - margin) {
        const d = (this.x - (1.0 - margin)) / margin;
        this.vx -= turnForce * (1 + d * 2.8);
      }
      if (this.y < margin) {
        const d = (margin - this.y) / margin;
        this.vy += turnForce * (1 + d * 2.8);
      }
      if (this.y > 1.0 - margin) {
        const d = (this.y - (1.0 - margin)) / margin;
        this.vy -= turnForce * (1 + d * 2.8);
      }

      // 4. Cinemática Hidrodinámica de Nado (Burst & Coast + Ondulación Carangiforme)
      // Los peces alternan un impulso caudal rítmico con deslizamiento laminar
      const swimCycle = Math.sin(timeNow * 1.65 + this.phase);
      const burstPulse = 0.72 + 0.48 * Math.pow(0.5 + 0.5 * swimCycle, 2.0);
      const targetSpeed = 0.0036 * burstPulse;

      let speed = MathUtils.magnitude(this.vx, this.vy);
      if (speed > 0.00001) {
        // Suavizar hacia la velocidad objetivo preservando inercia de giro
        const newSpeed = speed + (targetSpeed - speed) * 0.14;
        const dirX = this.vx / speed;
        const dirY = this.vy / speed;

        // Oscilación lateral de nado (Sway perpendicular a la columna vertebral)
        this.tailPhase += safeDt * (9.0 + newSpeed * 1600.0);
        this.tailAngle = Math.sin(this.tailPhase) * 0.42; // Ángulo de aleta caudal en radianes
        const lateralSway = Math.cos(this.tailPhase) * 0.00038;
        const perpX = -dirY;
        const perpY = dirX;

        this.vx = dirX * newSpeed + perpX * lateralSway;
        this.vy = dirY * newSpeed + perpY * lateralSway;
      }

      // Incorporar impulsos externos (Supernova / Vórtice / Tsunami) con amortiguamiento viscoso
      if (Math.abs(this.impulseVx) > 0.00001 || Math.abs(this.impulseVy) > 0.00001) {
        this.vx += this.impulseVx;
        this.vy += this.impulseVy;
        const damping = Math.exp(-4.0 * safeDt);
        this.impulseVx *= damping;
        this.impulseVy *= damping;
      }

      // Actualizar ángulo de orientación suavizado
      const heading = Math.atan2(this.vy, this.vx);
      this.angle = heading;

      // 5. Integración de Posición
      this.x += this.vx * 60 * safeDt;
      this.y += this.vy * 60 * safeDt;

      // Clamp estricto de seguridad [0.01, 0.99]
      this.x = MathUtils.clamp(this.x, 0.01, 0.99);
      this.y = MathUtils.clamp(this.y, 0.01, 0.99);
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
        const angle = (i / Math.max(count, 1)) * Math.PI * 2;
        const radius = 0.18 + (i % 3) * 0.06;
        const x = MathUtils.clamp(0.5 + Math.cos(angle) * radius, 0.12, 0.88);
        const y = MathUtils.clamp(0.5 + Math.sin(angle) * radius, 0.12, 0.88);
        this.boids.push(new Boid(i, x, y));
      }
    }

    toggle(forceState = null) {
      this.isEnabled = forceState !== null ? forceState : !this.isEnabled;
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.isSwarmActive = this.isEnabled;
      }

      if (typeof FluidCore !== 'undefined') {
        if (this.isEnabled) {
          this.prevDissipation = FluidCore.config.DENSITY_DISSIPATION;
          FluidCore.config.DENSITY_DISSIPATION = 1.05;
        } else {
          FluidCore.config.DENSITY_DISSIPATION = this.prevDissipation || 0.98;
        }
      }
      return this.isEnabled;
    }

    /**
     * Aplica una onda expansiva o centrípeta sobre los peces activos (acoplamiento con Fidgets).
     */
    applyForceField(centerX, centerY, strength = 0.004, mode = 'radial') {
      if (!this.boids || !this.boids.length) return;
      for (const b of this.boids) {
        const dx = b.x - centerX;
        const dy = b.y - centerY;
        const dist = Math.max(0.04, Math.hypot(dx, dy));
        if (mode === 'radial') {
          const factor = strength / (dist * 4.5);
          b.impulseVx += (dx / dist) * factor;
          b.impulseVy += (dy / dist) * factor;
        } else if (mode === 'vortex') {
          const factor = strength / (dist * 4.0);
          b.impulseVx += (-dy / dist) * factor;
          b.impulseVy += (dx / dist) * factor;
        } else if (mode === 'tsunami') {
          b.impulseVx += strength * 0.85;
          b.impulseVy += (Math.random() - 0.5) * strength * 0.4;
        }
      }
    }

    /**
     * Generador de color temático y autónomo en modo pecera bajo el Canon Sanzo Wada.
     */
    getAutoSwarmColor(avatarType, boid, time) {
      // 1. Nyan Cat: Policromía Kuikuiltik Wada (Sin morados neón prohibidos)
      if (avatarType === 'nyan') {
        const wadaRainbow = [
          [0.800, 0.071, 0.212], // Carmine #cc1236
          [0.953, 0.455, 0.125], // Orange Cempasúchil #f37420
          [1.000, 0.867, 0.000], // Apricot Yellow #ffdd00
          [0.000, 0.706, 0.608], // Sea Green Chalchíhuitl #00b49b
          [0.000, 0.576, 0.647], // Cerulian Blue Azul Maya #0093a5
          [0.718, 0.122, 0.341]  // Pomegranate Purple #b71f57
        ];
        const pos = ((time * 1.8 + boid.phase) % wadaRainbow.length + wadaRainbow.length) % wadaRainbow.length;
        const idx0 = Math.floor(pos);
        const idx1 = (idx0 + 1) % wadaRainbow.length;
        const frac = pos - idx0;
        const c0 = wadaRainbow[idx0];
        const c1 = wadaRainbow[idx1];
        return [
          c0[0] + (c1[0] - c0[0]) * frac,
          c0[1] + (c1[1] - c0[1]) * frac,
          c0[2] + (c1[2] - c0[2]) * frac
        ];
      }

      // 2. Cohete: Fuego Solar & Rojo Enchilada Wada
      if (avatarType === 'rocket') {
        const tones = [
          [0.867, 0.251, 0.153], // Red Orange #dd4027
          [0.953, 0.455, 0.125], // Orange #f37420
          [1.000, 0.867, 0.000], // Apricot Yellow #ffdd00
          [0.800, 0.071, 0.212]  // Carmine #cc1236
        ];
        const idx = Math.floor(time * 4 + boid.phase * 3) % tones.length;
        return tones[Math.abs(idx)];
      }

      // 3. Cometa: Azul Maya, Calamine Blue & Cal Viva Wada
      if (avatarType === 'comet') {
        const tones = [
          [0.961, 0.925, 0.761], // Sulpher Yellow #f5ecc2
          [0.471, 0.804, 0.816], // Calamine Blue #78cdd0
          [0.000, 0.576, 0.647], // Cerulian Blue #0093a5
          [0.737, 0.894, 0.898]  // Nile Blue #bce4e5
        ];
        const idx = Math.floor(time * 3 + boid.phase * 2) % tones.length;
        return tones[Math.abs(idx)];
      }

      // 4. Pez Payaso / Cardumen de Arrecife: Bioluminiscencia Wada (Grenadine Pink, Cempasúchil, Azul Maya)
      if (avatarType === 'clownfish' || avatarType === 'fish') {
        const tones = [
          [0.953, 0.455, 0.125], // Orange Cempasúchil #f37420
          [0.957, 0.502, 0.404], // Grenadine Pink #f48067
          [0.000, 0.706, 0.608], // Sea Green #00b49b
          [0.961, 0.925, 0.761]  // Sulpher Yellow #f5ecc2
        ];
        const idx = Math.floor(time * 2.2 + boid.id + boid.phase) % tones.length;
        return tones[Math.abs(idx)];
      }

      // 5. Hatsune Miku: Jadeíta Chalchíhuitl & Spinel Red Wada
      if (avatarType === 'miku') {
        const tones = [
          [0.000, 0.706, 0.608], // Sea Green #00b49b
          [0.000, 0.592, 0.553], // Benzol Green #00978d
          [0.949, 0.447, 0.569], // Spinel Red #f27291
          [0.710, 0.871, 0.800]  // Turquoise Green #b5decc
        ];
        const idx = Math.floor(time * 3 + boid.phase * 2) % tones.length;
        return tones[Math.abs(idx)];
      }

      // 6. Predeterminado: Interpolación armónica suave sobre la paleta Sanzo Wada activa
      if (typeof AetheriaState !== 'undefined') {
        const baseColors = AetheriaState.getPaletteColors();
        const baseColor = baseColors[boid.id % baseColors.length] || [0.957, 0.502, 0.404];
        const wave = 0.82 + 0.18 * Math.sin(time * 1.5 + boid.phase);
        return [
          MathUtils.clamp(baseColor[0] * wave, 0.0, 1.0),
          MathUtils.clamp(baseColor[1] * wave, 0.0, 1.0),
          MathUtils.clamp(baseColor[2] * wave, 0.0, 1.0)
        ];
      }

      return [0.957, 0.502, 0.404];
    }

    updateAndEmit(dt, fluidCore, particlesEngine) {
      if (!this.isEnabled) return;
      if (typeof AetheriaState !== 'undefined' && AetheriaState.isPaused) return;

      this.time += dt;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;
      const nowSec = (typeof performance !== 'undefined' ? performance.now() : Date.now()) * 0.001;

      const targetCount = (typeof AetheriaState !== 'undefined') ? AetheriaState.swarmCount : 3;
      while (this.boids.length < targetCount) {
        this.boids.push(new Boid(this.boids.length, 0.5 + (Math.random() - 0.5) * 0.3, 0.5 + (Math.random() - 0.5) * 0.3));
      }
      while (this.boids.length > targetCount) {
        this.boids.pop();
      }

      const avatarType = (typeof AetheriaState !== 'undefined') ? AetheriaState.swarmAvatar : 'clownfish';
      const trailCfg = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.getTrailConfig() : { radiusScale: 0.35, sparkType: 'bubbles', sparkCount: 2, impulse: 0.85 };

      for (let i = 0; i < this.boids.length; i++) {
        const b = this.boids[i];
        b.update(this.boids, aspect, dt);

        const color = this.getAutoSwarmColor(avatarType, b, this.time);

        // Impulso hidrodinámico sincronizado con el aleteo caudal
        const tailStroke = Math.abs(Math.cos(b.tailPhase));
        const boidMod = 0.80 + 0.38 * tailStroke;
        const impulseMultiplier = (trailCfg.impulse || 1.0) * boidMod;
        const splatForce = (FluidCore.config.SPLAT_FORCE || 6000) * 0.44 * impulseMultiplier;
        const splatRadius = trailCfg.radiusScale * (0.85 + 0.25 * Math.sin(nowSec * 1.1 + b.phase)) * b.scale;

        // Punto de inyección en la estela caudal del pez para crear vórtices de Kármán realistas
        const speed = Math.max(0.0001, MathUtils.magnitude(b.vx, b.vy));
        const dirX = b.vx / speed;
        const dirY = b.vy / speed;
        const tailWakeX = MathUtils.clamp(b.x - dirX * 0.014, 0.01, 0.99);
        const tailWakeY = MathUtils.clamp(b.y - dirY * 0.014, 0.01, 0.99);

        fluidCore.splat(tailWakeX, tailWakeY, b.vx * splatForce, b.vy * splatForce, color, splatRadius);

        // Emisión sutil de burbujas / chispas en los golpes de aleta caudal
        if (particlesEngine && typeof particlesEngine.emit === 'function' && Math.random() < 0.18) {
          const px = tailWakeX * w;
          const py = (1.0 - tailWakeY) * h;
          const hex = `rgb(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)})`;
          const pType = (avatarType === 'clownfish' || avatarType === 'fish') ? 'bubbles' : (trailCfg.sparkType || 'star');
          particlesEngine.emit(px, py, b.vx * 180, -b.vy * 180, hex, pType, 1);
        }
      }
    }

    setBoidsCount(n) {
      const maxAllowed = (typeof AetheriaState !== 'undefined' && AetheriaState.devMode) ? 50 : 10;
      const count = MathUtils.clamp(n, 1, maxAllowed);
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
