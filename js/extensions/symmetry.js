/**
 * AETHERIA | Angular Symmetry, Dihedral Kaleidoscope & Polychrome Mandala Engine
 * Centralized Unified Splat Injection Engine for User & Autonomous Swarm.
 * Features:
 * - Aspect-Ratio Compensated Polar & Tangential Vector Geometry (16:9 & 9:16 invariant)
 * - Polychrome Harmonic Splat Distribution (Kuikuiltik / Wada Palette indexing per axis)
 * - Sub-step Ribbon Interpolation for continuous fluid calligraphy on fast strokes
 * - Static DOM element pool with directional 360° avatar rotation
 */

(function (root) {
  'use strict';

  class SymmetryController {
    constructor() {
      this.symmetryMode = 4; // 1..8
      this.kaleidoscopeReflect = true; // Dihedral reflection on even symmetries >= 4
      this.polychromeArms = true; // Alternates harmonic Wada palette colors across radial axes
      this.center = { x: 0.5, y: 0.5 };
      this.lastPointerTime = new Map();
      this.cooldownMs = 8; // High-frequency 120Hz sampling for smooth continuous ribbons
      this.maxSplatsPerFrame = 24;
      this.cursorOverlay = null;
      this.mirrorCursorPool = []; // Static DOM Pool to prevent GC thrashing
      this.maxPoolSize = 12;
    }

    init(overlayElement) {
      this.cursorOverlay = overlayElement;
      this.initCursorPool();
      this.updateCursorDOM();
    }

    initCursorPool() {
      if (!this.cursorOverlay) return;
      this.cursorOverlay.innerHTML = '';
      this.mirrorCursorPool = [];

      for (let i = 0; i < this.maxPoolSize; i++) {
        const el = document.createElement('div');
        el.className = 'cursor-mirror-point';
        el.style.opacity = '0';
        el.style.display = 'none';
        this.cursorOverlay.appendChild(el);
        this.mirrorCursorPool.push(el);
      }
    }

    setSymmetry(mode) {
      this.symmetryMode = parseInt(mode, 10) || 1;
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.symmetry = this.symmetryMode;
      }
      this.updateCursorDOM();
    }

    getSymmetry() {
      if (typeof AetheriaState !== 'undefined') {
        return AetheriaState.symmetry || this.symmetryMode;
      }
      return this.symmetryMode;
    }

    updateCursorDOM() {
      const isNone = (typeof AetheriaCursor !== 'undefined' && AetheriaCursor.currentType === 'none');
      const activeCount = this.getSymmetry();
      const avatarHTML = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.getAvatarHTML() : '';

      for (let i = 0; i < this.mirrorCursorPool.length; i++) {
        const el = this.mirrorCursorPool[i];
        el.innerHTML = avatarHTML;
        if (!isNone && i < activeCount) {
          el.style.display = 'block';
          el.style.opacity = '0';
        } else {
          el.style.display = 'none';
          el.style.opacity = '0';
        }
      }
    }

    canProcessPointer(pointerId) {
      const now = performance.now();
      const lastTime = this.lastPointerTime.get(pointerId) || 0;
      if (now - lastTime >= this.cooldownMs) {
        this.lastPointerTime.set(pointerId, now);
        return true;
      }
      return false;
    }

    releasePointer(pointerId) {
      this.lastPointerTime.delete(pointerId);
    }

    /**
     * Generates aspect-corrected symmetry points based on the current symmetry mode (1x to 8x).
     * @param {number} normX - The normalized x-coordinate of the base point [0, 1].
     * @param {number} normY - The normalized y-coordinate of the base point [0, 1].
     * @param {number} normDx - The normalized x-velocity of the base point.
     * @param {number} normDy - The normalized y-velocity of the base point.
     * @param {number} [aspectRatio=1.0] - The aspect ratio of the canvas (width / height).
     * @returns {Array<{x: number, y: number, dx: number, dy: number, angleIndex: number}>}
     */
    getPoints(normX, normY, normDx, normDy, aspectRatio = 1.0) {
      if (!Number.isFinite(normX)) normX = 0.5;
      if (!Number.isFinite(normY)) normY = 0.5;
      if (!Number.isFinite(normDx)) normDx = 0;
      if (!Number.isFinite(normDy)) normDy = 0;
      if (!Number.isFinite(aspectRatio) || aspectRatio <= 0.01) aspectRatio = 1.0;

      const clamp = (typeof MathUtils !== 'undefined' && MathUtils.clamp)
        ? MathUtils.clamp.bind(MathUtils)
        : (v, lo, hi) => Math.max(lo, Math.min(hi, v));

      normX = clamp(normX, 0.0, 1.0);
      normY = clamp(normY, 0.0, 1.0);

      const points = [];
      const mode = this.getSymmetry();

      if (mode === 1) {
        points.push({ x: normX, y: normY, dx: normDx, dy: normDy, angleIndex: 0 });
        return points;
      }

      const cx = this.center.x;
      const cy = this.center.y;
      const rx = normX - cx;
      const ry = normY - cy;

      if (mode === 2) {
        // Espejo Bilateral Dual (Ometéotl)
        points.push({ x: normX, y: normY, dx: normDx, dy: normDy, angleIndex: 0 });
        points.push({ x: clamp(cx - rx, 0.01, 0.99), y: normY, dx: -normDx, dy: normDy, angleIndex: 1 });
        return points;
      }

      if (mode === 4) {
        // 4 Rumbos del Universo (Nahui Ollin — Reflexión Dihedral D2)
        points.push({ x: clamp(cx + rx, 0.01, 0.99), y: clamp(cy + ry, 0.01, 0.99), dx: normDx, dy: normDy, angleIndex: 0 });
        points.push({ x: clamp(cx - rx, 0.01, 0.99), y: clamp(cy + ry, 0.01, 0.99), dx: -normDx, dy: normDy, angleIndex: 1 });
        points.push({ x: clamp(cx + rx, 0.01, 0.99), y: clamp(cy - ry, 0.01, 0.99), dx: normDx, dy: -normDy, angleIndex: 2 });
        points.push({ x: clamp(cx - rx, 0.01, 0.99), y: clamp(cy - ry, 0.01, 0.99), dx: -normDx, dy: -normDy, angleIndex: 3 });
        return points;
      }

      // Simetría Rotacional y Caleidoscópica Compensada por Aspect Ratio (3x, 5x, 6x, 7x, 8x)
      const count = mode;
      const metricRx = rx * aspectRatio;
      const metricRy = ry;
      const baseAngle = Math.atan2(metricRy, metricRx);
      const radius = Math.hypot(metricRx, metricRy);

      // Vector de velocidad en espacio métrico isótropo
      const metricVx = normDx * aspectRatio;
      const metricVy = normDy;

      for (let i = 0; i < count; i++) {
        const stepAngle = (i / count) * Math.PI * 2;
        const isReflectedArm = this.kaleidoscopeReflect && (count % 2 === 0) && (i % 2 === 1);
        const currentAngle = isReflectedArm
          ? (-baseAngle + stepAngle)
          : (baseAngle + stepAngle);

        const px = clamp(cx + (Math.cos(currentAngle) * radius) / aspectRatio, 0.01, 0.99);
        const py = clamp(cy + Math.sin(currentAngle) * radius, 0.01, 0.99);

        const cosA = Math.cos(stepAngle);
        const sinA = Math.sin(stepAngle);

        let vx = metricVx;
        let vy = isReflectedArm ? -metricVy : metricVy;

        const rvx = vx * cosA - vy * sinA;
        const rvy = vx * sinA + vy * cosA;

        points.push({
          x: px,
          y: py,
          dx: rvx / aspectRatio,
          dy: rvy,
          angleIndex: i
        });
      }

      return points.slice(0, this.maxSplatsPerFrame);
    }

    /**
     * Obtiene el color armónico Wada para cada eje de simetría (Kuikuiltik / Policromía).
     */
    _resolveArmColor(baseColor, angleIndex) {
      if (!this.polychromeArms || angleIndex === 0 || !Array.isArray(baseColor)) {
        return baseColor;
      }
      if (typeof AetheriaState !== 'undefined' && typeof AetheriaState.getPaletteColors === 'function') {
        const palette = AetheriaState.getPaletteColors();
        if (Array.isArray(palette) && palette.length > 1) {
          const companion = palette[angleIndex % palette.length];
          if (Array.isArray(companion) && companion.length >= 3) {
            // Mezcla 65% compañero armónico Wada + 35% color base del trazo para cohesión cromática
            return [
              baseColor[0] * 0.35 + companion[0] * 0.65,
              baseColor[1] * 0.35 + companion[1] * 0.65,
              baseColor[2] * 0.35 + companion[2] * 0.65
            ];
          }
        }
      }
      return baseColor;
    }

    /**
     * Función MAESTRA de Inyección Unificada de Splats con Simetría activa.
     * Llamada tanto por el puntero de usuario como por los avatares.
     */
    injectSplat(baseX, baseY, dx, dy, color, radius, aspect = null) {
      if (typeof FluidCore === 'undefined') return;

      const aspectRatio = aspect || (window.innerWidth / window.innerHeight);
      const mode = this.getSymmetry();

      if (mode === 1) {
        FluidCore.splat(baseX, baseY, dx, dy, color, radius);
        return;
      }

      const points = this.getPoints(baseX, baseY, dx, dy, aspectRatio);
      // Compensar radio ligeramente en simetrías altas para evitar saturación en el centro
      const symScale = mode >= 6 ? 0.82 : (mode >= 4 ? 0.90 : 1.0);
      const adjustedRadius = radius * symScale;

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        const armColor = this._resolveArmColor(color, pt.angleIndex);
        FluidCore.splat(pt.x, pt.y, pt.dx, pt.dy, armColor, adjustedRadius);
      }
    }

    /**
     * Inyección con interpolación de sub-pasos para trazos rápidos sin saltos ("gotas sueltas").
     */
    injectStroke(prevX, prevY, currX, currY, dx, dy, color, radius, aspect = null) {
      const dist = Math.hypot(currX - prevX, currY - prevY);
      const steps = Math.min(4, Math.max(1, Math.ceil(dist / 0.018)));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const ix = prevX + (currX - prevX) * t;
        const iy = prevY + (currY - prevY) * t;
        this.injectSplat(ix, iy, dx / steps, dy / steps, color, radius, aspect);
      }
    }

    /**
     * Renders visual mirrored cursor points on the DOM overlay.
     */
    renderVisualPoints(normX, normY, width, height, isPointerDown, dx = 0, dy = 0) {
      if (!this.mirrorCursorPool.length) return;
      if (typeof AetheriaCursor !== 'undefined' && AetheriaCursor.currentType === 'none') {
        this.hideVisualPoints();
        return;
      }

      const points = this.getPoints(normX, normY, dx, dy, width / height);
      const mode = this.getSymmetry();

      for (let i = 0; i < this.mirrorCursorPool.length; i++) {
        const el = this.mirrorCursorPool[i];
        if (points[i] && i < mode) {
          el.style.left = `${points[i].x * width}px`;
          el.style.top = `${(1.0 - points[i].y) * height}px`;
          el.style.opacity = '1.0';

          if (typeof AetheriaCursor !== 'undefined') {
            const rot = AetheriaCursor.calculateRotation(points[i].dx, points[i].dy);
            const scale = isPointerDown ? 1.18 : 1.0;
            el.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
          }
        } else {
          el.style.opacity = '0';
        }
      }
    }

    hideVisualPoints() {
      for (const el of this.mirrorCursorPool) {
        el.style.opacity = '0';
      }
    }
  }

  root.AetheriaSymmetry = new SymmetryController();
})(typeof window !== 'undefined' ? window : this);
