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
      this.effectType = 'star';
      this.baseColor = '#00f2fe';

      this.initPool();
    }

    setEffect(type, color) {
      this.effectType = type || 'star';
      this.baseColor = color || '#00f2fe';
    }

    randomRainbow() {
      const hue = Math.floor(Math.random() * 360);
      return `hsl(${hue}, 100%, 65%)`;
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

      // Soporte para sobrecarga flexible emit(x, y, vx, vy, count)
      let resolvedColor = colorHex;
      let resolvedType = type;
      let resolvedCount = count;

      if (typeof colorHex === 'number') {
        resolvedCount = colorHex;
        resolvedColor = this.baseColor;
        resolvedType = this.effectType || 'star';
      } else if (!resolvedColor) {
        resolvedColor = this.baseColor || '#00f2fe';
      }

      if (!resolvedType || resolvedType === 'star') {
        resolvedType = this.effectType || 'star';
      }

      for (let c = 0; c < resolvedCount; c++) {
        const p = this.particles[this.poolIndex];
        this.poolIndex = (this.poolIndex + 1) % this.maxParticles;

        p.active = true;
        p.x = x + (Math.random() - 0.5) * 12;
        p.y = y + (Math.random() - 0.5) * 12;

        const spread = (Math.random() - 0.5) * 2.0;
        p.vx = (vx * -0.28) + spread + (Math.random() - 0.5) * 1.2;
        p.vy = (vy * -0.28) + spread + (Math.random() - 0.5) * 1.2;

        // Comportamiento de física según tipo
        if (resolvedType === 'bubbles') {
          p.vy -= (0.9 + Math.random() * 0.8); // Flotabilidad acuática hacia arriba
          p.size = 3.0 + Math.random() * 4.5;
          p.maxLife = 0.55 + Math.random() * 0.45;
          p.color = resolvedColor || 'rgba(255,255,255,0.4)';
        } else if (resolvedType === 'fire') {
          p.vy += (Math.random() - 0.5) * 1.2;
          p.size = 3.5 + Math.random() * 4.0;
          p.maxLife = 0.35 + Math.random() * 0.35;
          p.color = `hsl(${20 + Math.random() * 30}, 100%, ${60 + Math.random() * 30}%)`;
        } else if (resolvedType === 'pixel') {
          p.size = 3.0 + Math.random() * 3.0;
          p.maxLife = 0.40 + Math.random() * 0.40;
          p.color = this.randomRainbow();
        } else if (resolvedType === 'neon') {
          p.size = 2.5 + Math.random() * 3.5;
          p.maxLife = 0.45 + Math.random() * 0.40;
          p.color = (Math.random() > 0.5) ? '#39C5BB' : '#ff007f';
        } else if (resolvedType === 'dust') {
          p.size = 2.0 + Math.random() * 3.0;
          p.maxLife = 0.40 + Math.random() * 0.45;
          p.color = `hsl(200, 85%, ${70 + Math.random() * 25}%)`;
        } else {
          p.size = 2.2 + Math.random() * 3.2;
          p.maxLife = 0.40 + Math.random() * 0.45;
          p.color = resolvedColor || '#00f2fe';
        }

        p.life = 1.0;
        p.sparkType = resolvedType;
      }
    }

    updateAndRender(dt) {
      if (!this.ctx || !this.isEnabled) return;

      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter'; // Brillo aditivo

      for (let i = 0; i < this.maxParticles; i++) {
        const p = this.particles[i];
        if (!p.active) continue;

        p.life -= dt / p.maxLife;
        if (p.life <= 0) {
          p.active = false;
          continue;
        }

        // Fricción y movimiento
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;

        const alpha = Math.max(0, p.life);
        const radius = p.size * alpha;
        if (radius < 0.4) continue;

        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = alpha;

        if (p.sparkType === 'bubbles') {
          // 1. Burbujas Acuáticas (Pez Payaso) - Esfera translúcida con brillo especular
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 1.2, 0, Math.PI * 2);
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = p.color;
          ctx.stroke();
          // Destello blanco
          ctx.beginPath();
          ctx.arc(p.x - radius * 0.35, p.y - radius * 0.35, Math.max(0.5, radius * 0.28), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (p.sparkType === 'pixel') {
          // 2. Pixel Stardust (Nyan Cat) - Cuadritos de colores retro
          const s = Math.max(1.5, radius * 1.6);
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
          // Borde blanco interior para dar sensación de videojuego arcade
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(p.x - s / 4, p.y - s / 4, s / 2, s / 2);
        } else if (p.sparkType === 'fire') {
          // 3. Tobera de Fuego (Cohete) - Núcleo incandescente con corona cálida
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          // Núcleo blanco/amarillo
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (p.sparkType === 'neon') {
          // 4. Techno Pop Neón (Hatsune Miku) - Destello en cruz brillante
          const len = radius * 1.8;
          ctx.beginPath();
          ctx.moveTo(p.x - len, p.y);
          ctx.lineTo(p.x + len, p.y);
          ctx.moveTo(p.x, p.y - len);
          ctx.lineTo(p.x, p.y + len);
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.sparkType === 'dust') {
          // 5. Plasma Cósmico (Cometa) - Polvo estelar diamantado
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 1.1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 6. Estrellas Mágicas 4 Puntas (Custom / Estándar)
          const r = radius * 1.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - r);
          ctx.lineTo(p.x + r * 0.3, p.y - r * 0.3);
          ctx.lineTo(p.x + r, p.y);
          ctx.lineTo(p.x + r * 0.3, p.y + r * 0.3);
          ctx.lineTo(p.x, p.y + r);
          ctx.lineTo(p.x - r * 0.3, p.y + r * 0.3);
          ctx.lineTo(p.x - r, p.y);
          ctx.lineTo(p.x - r * 0.3, p.y - r * 0.3);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  root.AetheriaParticles = new ParticleFXEngine();
})(typeof window !== 'undefined' ? window : this);
