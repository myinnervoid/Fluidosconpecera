/**
 * AETHERIA | Main Application Orchestrator
 * Coordinates FluidCore (PavelDoGreat Navier-Stokes), Sand Particle Post-Process,
 * Symmetrical Multi-cursor with Thematic Avatars, Particle Sparks, Swarm Boids, and Adaptive Audio.
 */

(function (root) {
  'use strict';

  class AetheriaApp {
    constructor() {
      this.glCanvas = document.getElementById('gl-canvas');
      this.canvasContainer = document.getElementById('canvas-container');
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

      // 3. Initialize Particle FX (Sparks, Embers & Stardust)
      AetheriaParticles.init(this.canvasContainer);

      // 4. Initialize Symmetry Controller
      AetheriaSymmetry.init(this.cursorOverlay);

      // 5. Initialize Autonomous Swarm Controller (Boids)
      AetheriaSwarm.init(this.cursorOverlay);

      // 6. Initialize UI Controller
      AetheriaUI.init(this);

      // 7. Bind Resizing & Interactions
      window.addEventListener('resize', () => this.onResize());
      this.bindInteractions();

      // 8. Start Smooth Animation Loop
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
        let col = AetheriaUI.getColorForAngle(pt.angleIndex, symPoints.length);
        if (typeof AetheriaCursor !== 'undefined') {
          col = AetheriaCursor.getSpecialTrailColor(col);
        }
        FluidCore.splat(pt.x, pt.y, 0, 0, col);
      }

      AetheriaSymmetry.renderVisualPoints(normX, normY, window.innerWidth, window.innerHeight, true, 0, 0);
    }

    onPointerMove(e) {
      const normX = e.clientX / window.innerWidth;
      const normY = 1.0 - e.clientY / window.innerHeight;

      const pointer = this.pointers.get(e.pointerId);
      const aspect = window.innerWidth / window.innerHeight;

      if (!pointer) {
        AetheriaSymmetry.renderVisualPoints(normX, normY, window.innerWidth, window.innerHeight, false, 0, 0);
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
        let col = AetheriaUI.getColorForAngle(pt.angleIndex, symPoints.length);
        if (typeof AetheriaCursor !== 'undefined') {
          col = AetheriaCursor.getSpecialTrailColor(col);
        }

        // Calculate Rear Tobera / Tail Offset position
        let emitterPt = { x: pt.x, y: pt.y };
        if (typeof AetheriaCursor !== 'undefined') {
          emitterPt = AetheriaCursor.getEmitterOffsetPoint(pt.x, pt.y, pt.dx, pt.dy);
        }

        FluidCore.splat(emitterPt.x, emitterPt.y, pt.dx, pt.dy, col);

        // Emit Sparks / Stardust from rear tail
        if (AetheriaParticles) {
          const hexCol = `rgb(${Math.round(col[0] * 255)}, ${Math.round(col[1] * 255)}, ${Math.round(col[2] * 255)})`;
          const sparkType = (AetheriaCursor && AetheriaCursor.currentType === 'rocket') ? 'fire' : 'star';
          AetheriaParticles.emit(emitterPt.x * window.innerWidth, (1.0 - emitterPt.y) * window.innerHeight, pt.dx * 0.05, pt.dy * 0.05, hexCol, sparkType, 2);
        }
      }

      AetheriaSymmetry.renderVisualPoints(normX, normY, window.innerWidth, window.innerHeight, true, dx, dy);
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

      // Draw Particle layer
      if (AetheriaParticles && AetheriaParticles.canvas) {
        ctx.drawImage(AetheriaParticles.canvas, 0, 0, w, h);
      }

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

      // 1. Audio Processing & Adaptive Beat Shockwave
      if (typeof AetheriaAudio !== 'undefined' && AetheriaAudio.isListening) {
        AetheriaAudio.update();
        if (AetheriaAudio.isBeatDetected) {
          const col = AetheriaUI.getNextColor();
          // Gentle shockwave ripple in center on beat drops
          FluidCore.splat(0.5, 0.5, (Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, col);
        }
      }

      // 2. Autonomous Swarm Boids (Auto-Pilot / Screensaver)
      if (typeof AetheriaSwarm !== 'undefined' && AetheriaSwarm.isEnabled) {
        AetheriaSwarm.updateAndEmit(dt, FluidCore, AetheriaAudio, AetheriaParticles);
      }

      // 3. Step Navier-Stokes GPU Physics
      FluidCore.step(dt);

      // 4. Render Screen Pass
      if (AetheriaSandMode.isEnabled) {
        const pal = AetheriaUI.getCurrentPalette();
        AetheriaSandMode.render(FluidCore.getDensityTexture(), pal.colors);
      } else {
        FluidCore.render(null);
      }

      // 5. Render Particle Sparks Overlay
      if (AetheriaParticles) {
        AetheriaParticles.updateAndRender(dt);
      }

      requestAnimationFrame(() => this.loop());
    }
  }

  // Initialize on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    root.aetheria = new AetheriaApp();
  });
})(typeof window !== 'undefined' ? window : this);
