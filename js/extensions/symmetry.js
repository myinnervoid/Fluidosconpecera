/**
 * AETHERIA | Angular Symmetry & Dynamic Multicursor Engine
 * Centralized Unified Splat Injection Engine for User & Autonomous Swarm.
 * Handles radial/bilateral symmetry with normalized coordinates, aspect ratio correction,
 * static DOM element pool, and dynamic directional avatar rotation.
 */

(function (root) {
  'use strict';

  class SymmetryController {
    constructor() {
      this.symmetryMode = 4; // 1, 2, 4, 6, 8
      this.center = { x: 0.5, y: 0.5 };
      this.lastPointerTime = new Map();
      this.cooldownMs = 35; // Cooldown per pointer ID
      this.maxSplatsPerFrame = 16;
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

    getPoints(normX, normY, normDx, normDy, aspectRatio = 1.0) {
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
        // Bilateral Mirror
        points.push({ x: normX, y: normY, dx: normDx, dy: normDy, angleIndex: 0 });
        points.push({ x: cx - rx, y: normY, dx: -normDx, dy: normDy, angleIndex: 1 });
        return points;
      }

      if (mode === 4) {
        // 4-Quadrant Symmetry
        points.push({ x: cx + rx, y: cy + ry, dx: normDx, dy: normDy, angleIndex: 0 });
        points.push({ x: cx - rx, y: cy + ry, dx: -normDx, dy: normDy, angleIndex: 1 });
        points.push({ x: cx + rx, y: cy - ry, dx: normDx, dy: -normDy, angleIndex: 2 });
        points.push({ x: cx - rx, y: cy - ry, dx: -normDx, dy: -normDy, angleIndex: 3 });
        return points;
      }

      // Radial N-Fold Rotational Symmetry (6x, 8x)
      const count = mode;
      const baseAngle = Math.atan2(ry, rx * aspectRatio);
      const radius = Math.hypot(rx * aspectRatio, ry);

      for (let i = 0; i < count; i++) {
        const stepAngle = (i / count) * Math.PI * 2;
        const currentAngle = baseAngle + stepAngle;

        const px = cx + (Math.cos(currentAngle) * radius) / aspectRatio;
        const py = cy + Math.sin(currentAngle) * radius;

        const cosA = Math.cos(stepAngle);
        const sinA = Math.sin(stepAngle);
        const rdx = normDx * cosA - normDy * sinA;
        const rdy = normDx * sinA + normDy * cosA;

        points.push({
          x: px,
          y: py,
          dx: rdx,
          dy: rdy,
          angleIndex: i
        });
      }

      return points.slice(0, this.maxSplatsPerFrame);
    }

    /**
     * Función MAESTRA de Inyección Unificada de Splats con Simetría activa.
     * Llamada tanto por UserCursorController como por AutoSwarmController.
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
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        FluidCore.splat(pt.x, pt.y, pt.dx, pt.dy, color, radius);
      }
    }

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

          // Directional avatar rotation
          if (typeof AetheriaCursor !== 'undefined') {
            const rot = AetheriaCursor.calculateRotation(points[i].dx, points[i].dy);
            const scale = isPointerDown ? 1.25 : 1.0;
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
