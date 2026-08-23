/**
 * AETHERIA | Autonomous Swarm Engine (Boids / Flocking Multi-Avatar Auto-Pilot)
 * Inspired by Craig Reynolds Boids & RippleAquarium.
 * Ultra-lightweight: 3 agents with separation, alignment, cohesion, and audio reaction.
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
    }

    update(boids, aspect, dt, bassBoost = 0) {
      // 1. Flocking parameters
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
          // Separation
          sepX += (dx / dist) / dist;
          sepY += (dy / dist) / dist;
          totalSep++;

          // Alignment
          aliX += other.vx;
          aliY += other.vy;
          totalAli++;

          // Cohesion
          cohX += other.x;
          cohY += other.y;
          totalCoh++;
        }
      }

      // Apply steering weights
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

      // 2. Soft Edge Boundary Repulsion
      const margin = 0.08;
      const turnForce = 0.0006;
      if (this.x < margin) this.vx += turnForce;
      if (this.x > 1.0 - margin) this.vx -= turnForce;
      if (this.y < margin) this.vy += turnForce;
      if (this.y > 1.0 - margin) this.vy -= turnForce;

      // 3. Limit Speed with Bass Boost
      const baseSpeed = 0.003 + (bassBoost * 0.005);
      const currentSpeed = Math.hypot(this.vx, this.vy);
      if (currentSpeed > 0.00001) {
        this.vx = (this.vx / currentSpeed) * baseSpeed;
        this.vy = (this.vy / currentSpeed) * baseSpeed;
      }

      // 4. Integrate Position
      this.x += this.vx * 60 * dt;
      this.y += this.vy * 60 * dt;

      // Wrap-around fallback
      if (this.x < 0) this.x = 1.0;
      if (this.x > 1.0) this.x = 0;
      if (this.y < 0) this.y = 1.0;
      if (this.y > 1.0) this.y = 0;
    }
  }

  class SwarmController {
    constructor() {
      this.isEnabled = false;
      this.boidsCount = 3; // Ultra low-overhead default
      this.boids = [];
      this.domContainer = null;
      this.domElements = [];
      this.initBoids();
    }

    init(container) {
      this.domContainer = container;
      this.initDOM();
    }

    initBoids() {
      this.boids = [];
      for (let i = 0; i < this.boidsCount; i++) {
        const x = 0.2 + (i * 0.25);
        const y = 0.3 + (i * 0.2);
        this.boids.push(new Boid(i, x, y));
      }
    }

    initDOM() {
      if (!this.domContainer) return;
      this.domElements = [];

      for (let i = 0; i < this.boidsCount; i++) {
        const el = document.createElement('div');
        el.className = 'cursor-mirror-point swarm-avatar';
        el.style.display = 'none';
        this.domContainer.appendChild(el);
        this.domElements.push(el);
      }
      this.updateAvatarHTML();
    }

    updateAvatarHTML() {
      const avatarHTML = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.getAvatarHTML() : '';
      for (const el of this.domElements) {
        el.innerHTML = avatarHTML;
      }
    }

    toggle(forceState = null) {
      this.isEnabled = forceState !== null ? forceState : !this.isEnabled;
      for (const el of this.domElements) {
        el.style.display = this.isEnabled ? 'block' : 'none';
        el.style.opacity = this.isEnabled ? '1' : '0';
      }
      return this.isEnabled;
    }

    updateAndEmit(dt, fluidCore, audioEngine, particlesEngine) {
      if (!this.isEnabled) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / h;
      const bass = audioEngine ? audioEngine.bassEnergy : 0;
      const isBeat = audioEngine ? audioEngine.isBeatDetected : false;

      for (let i = 0; i < this.boids.length; i++) {
        const b = this.boids[i];
        b.update(this.boids, aspect, dt, bass);

        // Update DOM element position and rotation
        const el = this.domElements[i];
        if (el) {
          const deg = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.calculateRotation(b.vx, b.vy) : 0;
          el.style.left = `${b.x * w}px`;
          el.style.top = `${(1.0 - b.y) * h}px`;
          el.style.transform = `translate(-50%, -50%) rotate(${deg}deg) scale(1.05)`;
          el.style.opacity = '1';
        }

        // Calculate Rear Tobera / Tail position for fluid trail
        const speed = Math.hypot(b.vx, b.vy);
        const normVx = speed > 0.0001 ? b.vx / speed : 1.0;
        const normVy = speed > 0.0001 ? b.vy / speed : 0.0;
        const tailOffset = 0.025; // Emitter is behind avatar
        const tailX = b.x - normVx * tailOffset;
        const tailY = b.y - normVy * tailOffset;

        // Fluid Trail Injection
        let color = AetheriaUI ? AetheriaUI.getColorForAngle(b.colorIndex, 6) : [0.0, 0.95, 1.0];
        if (typeof AetheriaCursor !== 'undefined') {
          color = AetheriaCursor.getSpecialTrailColor(color);
        }

        const splatForce = (FluidCore.config.SPLAT_FORCE || 6000) * 0.45 * (1.0 + bass * 1.5);
        fluidCore.splat(tailX, tailY, b.vx * splatForce, b.vy * splatForce, color);

        // Particles Emission from Thruster/Tail
        if (particlesEngine) {
          const hexCol = `rgb(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)})`;
          particlesEngine.emit(tailX * w, (1.0 - tailY) * h, b.vx * 150, b.vy * 150, hexCol, 'star', isBeat ? 4 : 1);
        }
      }
    }
  }

  root.AetheriaSwarm = new SwarmController();
})(typeof window !== 'undefined' ? window : this);
