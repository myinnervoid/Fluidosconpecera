/**
 * AETHERIA | Swarm Visual Renderer (Articulated Canvas 2D Hydrodynamic Creatures)
 * Renders real-time articulated fish and thematic avatars for the Autonomous Swarm ("Pecera").
 * Features multi-segment caudal fin oscillation, pectoral fin rowing, and Sanzo Wada pigments.
 */

(function (root) {
  'use strict';

  // Paleta de variaciones cromáticas Wada para el cardumen de peces
  const FISH_WADA_SCHEMES = [
    { body: '#f37420', head: '#dd4027', stripe: '#f5ecc2', fin: '#ffdd00', glow: 'rgba(243, 116, 32, 0.65)' }, // Cempasúchil & Enchilada
    { body: '#cc1236', head: '#a62c37', stripe: '#f5ecc2', fin: '#f48067', glow: 'rgba(204, 18, 54, 0.65)' },  // Grana Cochinilla & Cal
    { body: '#00b49b', head: '#0093a5', stripe: '#ffefae', fin: '#78cdd0', glow: 'rgba(0, 180, 155, 0.65)' },  // Chalchíhuitl & Azul Maya
    { body: '#f48067', head: '#c53c69', stripe: '#f5ecc2', fin: '#ffdd00', glow: 'rgba(244, 128, 103, 0.65)' } // Grenadine Bioluminiscente
  ];

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
      this.canvas.style.zIndex = '3';

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

    /**
     * Dibuja un pez articulado con aleta caudal y aletas pectorales animadas por hidrodinámica.
     */
    _drawArticulatedFish(ctx, boid, scheme) {
      const tailSwing = boid.tailAngle || Math.sin(boid.tailPhase || 0) * 0.38;
      const finRow = Math.cos(boid.tailPhase || 0) * 0.28;
      const s = boid.scale || 1.0;

      ctx.scale(s, s);
      ctx.shadowBlur = 14;
      ctx.shadowColor = scheme.glow;

      // 1. Aletas Pectorales Laterales (Remo hidrodinámico)
      ctx.save();
      ctx.translate(2, -7);
      ctx.rotate(-0.45 + finRow);
      ctx.fillStyle = scheme.fin;
      ctx.beginPath();
      ctx.ellipse(-4, -3, 6.5, 2.8, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(2, 7);
      ctx.rotate(0.45 - finRow);
      ctx.fillStyle = scheme.fin;
      ctx.beginPath();
      ctx.ellipse(-4, 3, 6.5, 2.8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Pedúnculo y Aleta Caudal Articulada (Oscilación Carangiforme)
      ctx.save();
      ctx.translate(-11, 0);
      ctx.rotate(tailSwing);

      ctx.fillStyle = scheme.fin;
      ctx.strokeStyle = '#111314';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-8, -9, -15, -10);
      ctx.quadraticCurveTo(-10, 0, -15, 10);
      ctx.quadraticCurveTo(-8, 9, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Veta interior de cal en la cola
      ctx.strokeStyle = scheme.stripe;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(-11, -5);
      ctx.moveTo(-2, 0);
      ctx.lineTo(-11, 5);
      ctx.stroke();
      ctx.restore();

      // 3. Cuerpo Hidrodinámico Principal (Ahusado orgánico)
      const grad = ctx.createLinearGradient(-12, 0, 16, 0);
      grad.addColorStop(0, scheme.body);
      grad.addColorStop(0.65, scheme.body);
      grad.addColorStop(1, scheme.head);

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#111314';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.bezierCurveTo(12, -10, -4, -9, -12, -2.5);
      ctx.lineTo(-12, 2.5);
      ctx.bezierCurveTo(-4, 9, 12, 10, 16, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Franjas Ceremoniales de Cal Viva (#f5ecc2) con filete obsidiana
      ctx.fillStyle = scheme.stripe;
      ctx.strokeStyle = '#111314';
      ctx.lineWidth = 0.9;

      // Franja delantera
      ctx.beginPath();
      ctx.moveTo(5, -7.2);
      ctx.quadraticCurveTo(8, 0, 5, 7.2);
      ctx.quadraticCurveTo(1.5, 0, 5, -7.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Franja media
      ctx.beginPath();
      ctx.moveTo(-4, -6.2);
      ctx.quadraticCurveTo(-1.5, 0, -4, 6.2);
      ctx.quadraticCurveTo(-6.8, 0, -4, -6.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 5. Espina Dorsal Fluida
      ctx.strokeStyle = scheme.fin;
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.quadraticCurveTo(-2, tailSwing * 4.5, -9, tailSwing * 2.5);
      ctx.stroke();

      // 6. Ojos con brillo especular
      ctx.fillStyle = '#111314';
      ctx.beginPath();
      ctx.arc(10.5, -3.6, 1.8, 0, Math.PI * 2);
      ctx.arc(10.5, 3.6, 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f5ecc2';
      ctx.beginPath();
      ctx.arc(11.1, -3.9, 0.7, 0, Math.PI * 2);
      ctx.arc(11.1, 3.3, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    _drawArticulatedRocket(ctx, boid) {
      const flicker = 0.85 + 0.3 * Math.sin((boid.tailPhase || 0) * 2.5);
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(255, 221, 0, 0.75)';

      // Pluma de fuego Wada (Rojo Enchilada -> Cempasúchil -> Canario)
      ctx.fillStyle = '#dd4027';
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(-22 * flicker, 0);
      ctx.lineTo(-10, 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.moveTo(-10, -2.2);
      ctx.lineTo(-16 * flicker, 0);
      ctx.lineTo(-10, 2.2);
      ctx.closePath();
      ctx.fill();

      // Aletas traseras Carmine #cc1236
      ctx.fillStyle = '#cc1236';
      ctx.strokeStyle = '#111314';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-4, -5);
      ctx.lineTo(-11, -11);
      ctx.lineTo(-10, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-4, 5);
      ctx.lineTo(-11, 11);
      ctx.lineTo(-10, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Fuselaje Cal Viva #f5ecc2
      ctx.fillStyle = '#f5ecc2';
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.quadraticCurveTo(6, -7.5, -10, -5);
      ctx.lineTo(-10, 5);
      ctx.quadraticCurveTo(6, 7.5, 15, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Escotilla Azul Maya #0093a5
      ctx.fillStyle = '#0093a5';
      ctx.beginPath();
      ctx.arc(3, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    _drawArticulatedComet(ctx, boid) {
      const wave = Math.sin(boid.tailPhase || 0) * 3;
      ctx.shadowBlur = 16;
      ctx.shadowColor = 'rgba(0, 147, 165, 0.85)';

      const grad = ctx.createLinearGradient(-24, 0, 8, 0);
      grad.addColorStop(0, 'rgba(0, 147, 165, 0)');
      grad.addColorStop(0.6, 'rgba(120, 205, 208, 0.75)');
      grad.addColorStop(1, '#f5ecc2');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.quadraticCurveTo(-6, -7, -24, wave);
      ctx.quadraticCurveTo(-6, 7, 8, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f5ecc2';
      ctx.beginPath();
      ctx.arc(6, 0, 5.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78cdd0';
      ctx.beginPath();
      ctx.arc(6, 0, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    _drawArticulatedNyan(ctx, boid) {
      const bounce = Math.sin(boid.tailPhase || 0) * 1.5;
      ctx.translate(0, bounce);
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(204, 18, 54, 0.7)';

      // Estela policromática Wada (5 franjas)
      const bands = ['#cc1236', '#f37420', '#ffdd00', '#00b49b', '#006eb8'];
      for (let i = 0; i < bands.length; i++) {
        ctx.fillStyle = bands[i];
        ctx.fillRect(-20, -7.5 + i * 3, 12, 3);
      }

      // Cuerpo de galleta / pan dulce con glaseado Spinel Red #f27291
      ctx.fillStyle = '#f8c779';
      ctx.strokeStyle = '#111314';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-10, -9, 18, 18, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f27291';
      ctx.beginPath();
      ctx.roundRect(-8, -7, 14, 14, 2);
      ctx.fill();

      // Cabeza felina
      ctx.fillStyle = '#a1a39a';
      ctx.beginPath();
      ctx.roundRect(4, -6, 11, 12, 3);
      ctx.fill();
      ctx.stroke();

      // Orejas
      ctx.beginPath();
      ctx.moveTo(5, -6);
      ctx.lineTo(7, -11);
      ctx.lineTo(10, -6);
      ctx.moveTo(10, -6);
      ctx.lineTo(13, -11);
      ctx.lineTo(14, -6);
      ctx.fill();
      ctx.stroke();

      // Ojos
      ctx.fillStyle = '#111314';
      ctx.beginPath();
      ctx.arc(12, -2.5, 1.3, 0, Math.PI * 2);
      ctx.arc(12, 2.5, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    _drawArticulatedMiku(ctx, boid) {
      const sway = (boid.tailAngle || 0) * 1.1;
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(0, 180, 155, 0.8)';

      // Coletas articuladas en Jadeíta Sea Green #00b49b
      ctx.fillStyle = '#00b49b';
      ctx.strokeStyle = '#111314';
      ctx.lineWidth = 1;

      ctx.save();
      ctx.translate(-2, -6);
      ctx.rotate(sway * 0.6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-10, -7, -18, -3);
      ctx.quadraticCurveTo(-10, 1, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(-2, 6);
      ctx.rotate(sway * 0.6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-10, 7, -18, 3);
      ctx.quadraticCurveTo(-10, -1, 0, 0);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Lazos Carmine #cc1236
      ctx.fillStyle = '#cc1236';
      ctx.fillRect(-3, -8, 4, 4);
      ctx.fillRect(-3, 4, 4, 4);

      // Cabeza
      ctx.fillStyle = '#fdd4bd';
      ctx.beginPath();
      ctx.arc(4, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Flequillo Sea Green
      ctx.fillStyle = '#00978d';
      ctx.beginPath();
      ctx.arc(4, 0, 6.6, -Math.PI * 0.75, Math.PI * 0.75, true);
      ctx.fill();
    }

    render(boids, avatarType, isEnabled) {
      if (!this.ctx || !this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);
      if (!isEnabled || !boids || boids.length === 0) {
        return;
      }

      // Si el usuario tiene el puntero en 'none', en modo Pecera renderizamos el cardumen de peces Wada
      const effectiveAvatar = (!avatarType || avatarType === 'none') ? 'clownfish' : avatarType;

      if (effectiveAvatar === 'custom') {
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
        const screenY = (1.0 - b.y) * h;

        // En coordenadas de pantalla (Y hacia abajo), el vector de avance es (b.vx, -b.vy)
        const headingRad = Math.atan2(-b.vy, b.vx);

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(headingRad);

        if (effectiveAvatar === 'custom' && this.customImg && this.customImg.complete) {
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(this.customImg, -16, -16, 32, 32);
        } else if (effectiveAvatar === 'rocket') {
          this._drawArticulatedRocket(ctx, b);
        } else if (effectiveAvatar === 'comet') {
          this._drawArticulatedComet(ctx, b);
        } else if (effectiveAvatar === 'nyan') {
          this._drawArticulatedNyan(ctx, b);
        } else if (effectiveAvatar === 'miku') {
          this._drawArticulatedMiku(ctx, b);
        } else {
          const scheme = FISH_WADA_SCHEMES[b.id % FISH_WADA_SCHEMES.length];
          this._drawArticulatedFish(ctx, b, scheme);
        }

        ctx.restore();
      }
    }
  }

  root.AetheriaSwarmRenderer = new SwarmVisualRenderer();
})(typeof window !== 'undefined' ? window : this);
