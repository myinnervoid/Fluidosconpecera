/**
 * AETHERIA | Swarm Visual Renderer (Dedicated 2D Canvas)
 * Solves Bug #1: Renders real-time visual representation of Autonomous Boids
 * with directional rotation, smooth motion, and thematic avatar icons (SVG/Canvas/Emoji).
 */

(function (root) {
  'use strict';

  class SwarmVisualRenderer {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.customImg = null;
      this.cachedCustomUrl = null;
    }

    init(container) {
      if (!container) return;

      this.canvas = document.createElement('canvas');
      this.canvas.id = 'swarm-visual-canvas';
      this.canvas.style.position = 'absolute';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '3'; // Por encima del fluido pero bajo UI

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

    render(boids, avatarType, isEnabled) {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);
      if (!isEnabled || !boids || boids.length === 0 || avatarType === 'none') {
        return;
      }

      // Check custom avatar image caching
      if (avatarType === 'custom') {
        const url = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.customDataUrl : null;
        if (url && url !== this.cachedCustomUrl) {
          this.cachedCustomUrl = url;
          this.customImg = new Image();
          this.customImg.src = url;
        }
      }

      for (let i = 0; i < boids.length; i++) {
        const b = boids[i];
        const screenX = b.x * w;
        const screenY = (1.0 - b.y) * h; // Coordenada de pantalla invertida

        let deg = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.calculateRotation(b.vx, b.vy) : 0;
        const rad = deg * (Math.PI / 180);

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(rad);

        // Renderizado temático según tipo
        if (avatarType === 'custom' && this.customImg && this.customImg.complete) {
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(this.customImg, -16, -16, 32, 32);
        } else {
          // Renderizado de icono temático de alta visibilidad
          ctx.font = '28px "Outfit", "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Sombra luminosa
          ctx.shadowBlur = 12;
          if (avatarType === 'nyan') {
            ctx.shadowColor = '#ff007f';
            ctx.fillText('🐱', 0, 0);
          } else if (avatarType === 'rocket') {
            ctx.shadowColor = '#ffbe0b';
            ctx.fillText('🚀', 0, 0);
          } else if (avatarType === 'comet') {
            ctx.shadowColor = '#00f2fe';
            ctx.fillText('☄️', 0, 0);
          } else if (avatarType === 'clownfish') {
            ctx.shadowColor = '#ff6b00';
            ctx.fillText('🐠', 0, 0);
          } else if (avatarType === 'miku') {
            ctx.shadowColor = '#39C5BB';
            ctx.fillText('🩵', 0, 0);
          } else {
            ctx.shadowColor = '#00f2fe';
            ctx.fillText('✨', 0, 0);
          }
        }

        ctx.restore();
      }
    }
  }

  root.AetheriaSwarmRenderer = new SwarmVisualRenderer();
})(typeof window !== 'undefined' ? window : this);
