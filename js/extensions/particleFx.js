/**
 * AETHERIA | High-Performance Fluid-Advected Particle FX Engine
 * Lightweight pre-allocated circular pool (Zero Garbage Collection overhead).
 * Renders glowing embers, bubbles, stars, pixel sparks, dust, and neon flares.
 */

(function (root) {
  'use strict';

  class ParticleFXEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.maxParticles = 200; // Scaled for smooth 60fps performance
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
          sparkType: 'star'
        };
      }
    }

    emit(x, y, vx, vy, colorHex, type = 'star', count = 3) {
      if (!this.isEnabled) return;

      for (let c = 0; c < count; c++) {
        const p = this.particles[this.poolIndex];
        this.poolIndex = (this.poolIndex + 1) % this.maxParticles;

        p.active = true;
        p.x = x + (Math.random() - 0.5) * 10;
        p.y = y + (Math.random() - 0.5) * 10;

        const spread = (Math.random() - 0.5) * 1.6;
        p.vx = (vx * -0.32) + spread + (Math.random() - 0.5) * 1.0;
        p.vy = (vy * -0.32) + spread + (Math.random() - 0.5) * 1.0;

        p.size = 2.0 + Math.random() * 3.5;
        p.life = 1.0;
        p.maxLife = 0.35 + Math.random() * 0.45;
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
      ctx.globalCompositeOperation = 'lighter'; // Additive glow

      for (let i = 0; i < this.maxParticles; i++) {
        const p = this.particles[i];
        if (!p.active) continue;

        p.life -= dt / p.maxLife;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }

        // Fricción y movimiento
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;

        const alpha = Math.max(0, p.life);
        const radius = p.size * alpha;

        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha;

        if (p.sparkType === 'bubbles') {
          // Burbujas acuáticas (anillo translúcido y brillo)
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 1.3, 0, Math.PI * 2);
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x - radius * 0.3, p.y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.sparkType === 'pixel') {
          // Pixel stardust
          const s = radius * 1.5;
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        } else if (p.sparkType === 'fire') {
          // Chispas de fuego
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 1.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Estrellas / polvo / neón
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  root.AetheriaParticles = new ParticleFXEngine();
})(typeof window !== 'undefined' ? window : this);
