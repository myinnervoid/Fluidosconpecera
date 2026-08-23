/**
 * AETHERIA | High-Performance Fluid-Advected Particle FX Engine
 * Lightweight pre-allocated circular pool (Zero Garbage Collection overhead).
 * Renders glowing embers, sparks, and Nyan rainbow stardust.
 */

(function (root) {
  'use strict';

  class ParticleFXEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.maxParticles = 180; // Scaled for low-end GPU/CPU efficiency
      this.particles = [];
      this.poolIndex = 0;
      this.isEnabled = true;

      this.initPool();
    }

    init(container) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'particle-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '2';

      container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.resize();

      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    initPool() {
      this.particles = new Array(this.maxParticles);
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles[i] = {
          active: false,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          size: 2,
          life: 0,
          maxLife: 1.0,
          color: '#ffffff',
          sparkType: 'star' // 'spark', 'star', 'fire'
        };
      }
    }

    emit(x, y, vx, vy, colorHex, type = 'star', count = 3) {
      if (!this.isEnabled) return;

      for (let c = 0; c < count; c++) {
        const p = this.particles[this.poolIndex];
        this.poolIndex = (this.poolIndex + 1) % this.maxParticles;

        p.active = true;
        p.x = x + (Math.random() - 0.5) * 12;
        p.y = y + (Math.random() - 0.5) * 12;

        const spread = (Math.random() - 0.5) * 1.5;
        p.vx = (vx * -0.35) + spread + (Math.random() - 0.5) * 1.2;
        p.vy = (vy * -0.35) + spread + (Math.random() - 0.5) * 1.2;

        p.size = 2.0 + Math.random() * 3.0;
        p.life = 1.0;
        p.maxLife = 0.4 + Math.random() * 0.5;
        p.color = colorHex || '#00f2fe';
        p.sparkType = type;
      }
    }

    updateAndRender(dt) {
      if (!this.ctx || !this.isEnabled) return;

      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter'; // Additive blending for glow

      for (let i = 0; i < this.maxParticles; i++) {
        const p = this.particles[i];
        if (!p.active) continue;

        p.life -= dt / p.maxLife;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }

        // Apply friction and motion
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;

        const alpha = Math.max(0, p.life);
        const radius = p.size * alpha;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;

        if (p.sparkType === 'star') {
          // Render cute twinkling star
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Render spark line/ember
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  root.AetheriaParticles = new ParticleFXEngine();
})(typeof window !== 'undefined' ? window : this);
