/**
 * AETHERIA | Main Application Orchestrator
 * Coordinates FluidCore (PavelDoGreat Navier-Stokes), Sand Particle Post-Process,
 * Symmetrical Multi-cursor, Fidgets, and UI Controller.
 */

(function (root) {
  'use strict';

  class AetheriaApp {
    constructor() {
      this.glCanvas = document.getElementById('gl-canvas');
      this.cursorOverlay = document.getElementById('cursor-overlay');

      this.pointers = new Map();
      this.lastTime = performance.now();
      this.lagFrameCount = 0;

      this.init();
    }

    init() {
      // 1. Initialize Fluid Core
      FluidCore.init(this.glCanvas);

      // 2. Initialize Sand Particle Post-Process Shader
      AetheriaSandMode.init(FluidCore.getGL());

      // 3. Initialize Symmetry Controller
      AetheriaSymmetry.init(this.cursorOverlay);

      // 4. Initialize UI Controller
      AetheriaUI.init(this);

      // 5. Bind Resizing
      window.addEventListener('resize', () => this.onResize());

      // 6. Bind Pointer & Touch Interactions
      this.bindInteractions();

      // 7. Start Smooth Animation Loop
      this.loop();
    }

    onResize() {
      FluidCore.resize();
    }

    bindInteractions() {
      const target = window;

      target.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      target.addEventListener('pointermove', (e) => this.onPointerMove(e));
      target.addEventListener('pointerup', (e) => this.onPointerUp(e));
      target.addEventListener('pointercancel', (e) => this.onPointerUp(e));
    }

    onPointerDown(e) {
      if (e.target.closest('#top-bar') || e.target.closest('#settings-drawer')) return;

      const normX = e.clientX / window.innerWidth;
      const normY = 1.0 - e.clientY / window.innerHeight;

      const pointer = {
        id: e.pointerId,
        x: normX,
        y: normY,
        prevX: normX,
        prevY: normY,
        down: true,
        color: AetheriaUI.getNextColor()
      };
      this.pointers.set(e.pointerId, pointer);

      const aspect = window.innerWidth / window.innerHeight;
      const symPoints = AetheriaSymmetry.getPoints(normX, normY, 0, 0, aspect);

      for (let i = 0; i < symPoints.length; i++) {
        const pt = symPoints[i];
        const col = AetheriaUI.getColorForAngle(pt.angleIndex, symPoints.length);
        FluidCore.splat(pt.x, pt.y, 0, 0, col);
      }

      AetheriaSymmetry.renderVisualPoints(normX, normY, window.innerWidth, window.innerHeight, true);
    }

    onPointerMove(e) {
      const normX = e.clientX / window.innerWidth;
      const normY = 1.0 - e.clientY / window.innerHeight;

      const pointer = this.pointers.get(e.pointerId);
      const aspect = window.innerWidth / window.innerHeight;

      if (!pointer) {
        AetheriaSymmetry.renderVisualPoints(normX, normY, window.innerWidth, window.innerHeight, false);
        return;
      }

      // Check pointer throttle cooldown
      if (!AetheriaSymmetry.canProcessPointer(e.pointerId)) return;

      const rawDx = (normX - pointer.prevX);
      const rawDy = (normY - pointer.prevY);
      const dx = rawDx * FluidCore.config.SPLAT_FORCE;
      const dy = rawDy * FluidCore.config.SPLAT_FORCE;

      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = normX;
      pointer.y = normY;

      const symPoints = AetheriaSymmetry.getPoints(normX, normY, dx, dy, aspect);

      for (let i = 0; i < symPoints.length; i++) {
        const pt = symPoints[i];
        const col = AetheriaUI.getColorForAngle(pt.angleIndex, symPoints.length);
        FluidCore.splat(pt.x, pt.y, pt.dx, pt.dy, col);
      }

      AetheriaSymmetry.renderVisualPoints(normX, normY, window.innerWidth, window.innerHeight, true);
    }

    onPointerUp(e) {
      this.pointers.delete(e.pointerId);
      AetheriaSymmetry.releasePointer(e.pointerId);

      if (this.pointers.size === 0) {
        AetheriaSymmetry.hideVisualPoints();
      }
    }

    exportPNG() {
      const w = this.glCanvas.width;
      const h = this.glCanvas.height;

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = w;
      exportCanvas.height = h;
      const ctx = exportCanvas.getContext('2d');

      // Draw WebGL layer
      ctx.drawImage(this.glCanvas, 0, 0, w, h);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `Aetheria-Art-${timestamp}.png`;

      exportCanvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 3000);
      }, 'image/png');
    }

    loop() {
      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 1000.0, 0.033);
      this.lastTime = now;

      // Watchdog: detect frame freeze without gl.readPixels
      if (dt > 0.15) {
        this.lagFrameCount++;
        if (this.lagFrameCount > 3) {
          console.warn('Watchdog: Recuperación de fluidez automática.');
          FluidCore.reset();
          this.lagFrameCount = 0;
        }
      } else {
        this.lagFrameCount = 0;
      }

      // 1. Step Navier-Stokes GPU Physics
      FluidCore.step(dt);

      // 2. Render Screen Pass
      if (AetheriaSandMode.isEnabled) {
        const pal = AetheriaUI.getCurrentPalette();
        AetheriaSandMode.render(FluidCore.getDensityTexture(), pal.colors);
      } else {
        FluidCore.render(null);
      }

      requestAnimationFrame(() => this.loop());
    }
  }

  // Initialize on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    root.aetheria = new AetheriaApp();
  });
})(typeof window !== 'undefined' ? window : this);
