/**
 * AETHERIA | Main Application Orchestrator
 * Coordinates FluidCore (PavelDoGreat Navier-Stokes), Adaptive Backgrounds (16:9 / 9:16),
 * Sand Particle Post-Process, Symmetrical Multi-cursor with Thematic Avatars,
 * Swarm Visual Renderer (Canvas 2D), Particle Sparks, and Swarm Boids.
 * License: MIT
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

      this.init();
    }

    init() {
      // 1. Initialize Adaptive Backgrounds Engine
      if (typeof AetheriaBackground !== 'undefined') {
        AetheriaBackground.init();
      }

      // 2. Initialize Fluid Core
      FluidCore.init(this.glCanvas);

      // 3. Initialize Sand Particle Post-Process Shader
      AetheriaSandMode.init(FluidCore.getGL());

      // 4. Initialize Particle FX (Sparks, Embers, Bubbles & Stardust)
      AetheriaParticles.init(this.canvasContainer);

      // 5. Initialize Symmetry Controller
      AetheriaSymmetry.init(this.cursorOverlay);

      // 6. Initialize Autonomous Swarm Controller (Boids)
      AetheriaSwarm.init();

      // 7. Initialize Swarm Visual Renderer (2D Canvas superpuesto)
      if (typeof AetheriaSwarmRenderer !== 'undefined') {
        AetheriaSwarmRenderer.init(this.canvasContainer);
      }

      // 8. Initialize UI Controller
      AetheriaUI.init(this);

      // 9. Bind Resizing & Interactions
      window.addEventListener('resize', () => this.onResize());
      this.bindInteractions();

      // 10. WebGL Context Loss Guard (prevents silent freeze on GPU driver reset)
      this.glCanvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        if (this._rafId) cancelAnimationFrame(this._rafId);
        console.warn('[Aetheria] WebGL context lost — reloading in 3s...');
        if (typeof AetheriaUI !== 'undefined') {
          AetheriaUI.showToast('⚠️ GPU context perdido — recargando en 3s...');
        }
        setTimeout(() => location.reload(), 3000);
      });
      this.glCanvas.addEventListener('webglcontextrestored', () => {
        console.info('[Aetheria] WebGL context restored — reinitializing...');
        FluidCore.init(this.glCanvas);
        this.loop();
      });

      // 11. Start Smooth Animation Loop
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
      // Bloquear si el cajón de ajustes está abierto o si el toque fue sobre elementos UI
      if (typeof AetheriaState !== 'undefined' && AetheriaState.isDrawerOpen) return;
      if (e.target.closest('#top-bar, #settings-drawer, #drawer-overlay, .ui-interactive')) return;

      const normX = e.clientX / window.innerWidth;
      const normY = 1.0 - e.clientY / window.innerHeight;

      const pointer = {
        id: e.pointerId,
        x: normX,
        y: normY,
        prevX: normX,
        prevY: normY,
        down: true,
        color: (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.getUserSplatColor(0) : [0.0, 0.95, 1.0]
      };
      this.pointers.set(e.pointerId, pointer);

      const aspect = window.innerWidth / window.innerHeight;
      const trailCfg = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.getTrailConfig() : { radiusScale: 1.0, impulse: 1.0 };
      const col = pointer.color;

      // Inyección unificada con simetría
      if (typeof AetheriaSymmetry !== 'undefined') {
        AetheriaSymmetry.injectSplat(normX, normY, 0, 0, col, trailCfg.radiusScale, aspect);
      } else {
        FluidCore.splat(normX, normY, 0, 0, col, trailCfg.radiusScale);
      }

      AetheriaSymmetry.renderVisualPoints(normX, normY, window.innerWidth, window.innerHeight, true, 0, 0);
    }

    onPointerMove(e) {
      // Bloquear si el cajón de ajustes está abierto o si el puntero entró en la UI
      if (typeof AetheriaState !== 'undefined' && AetheriaState.isDrawerOpen) return;
      if (e.target.closest('#top-bar, #settings-drawer, #drawer-overlay, .ui-interactive')) {
        const p = this.pointers.get(e.pointerId);
        if (p) {
          this.pointers.delete(e.pointerId);
          AetheriaSymmetry.releasePointer(e.pointerId);
        }
        return;
      }

      const normX = e.clientX / window.innerWidth;
      const normY = 1.0 - e.clientY / window.innerHeight;

      const pointer = this.pointers.get(e.pointerId);
      const aspect = window.innerWidth / window.innerHeight;

      if (!pointer) {
        // Movimiento flotante previo a clic: orientar avatar en pantalla
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

      const trailCfg = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.getTrailConfig() : { radiusScale: 1.0, sparkType: 'star', sparkCount: 2, impulse: 1.0 };
      const col = (typeof AetheriaCursor !== 'undefined') ? AetheriaCursor.getUserSplatColor(0) : [0.0, 0.95, 1.0];

      // Posición de emisión trasera (Tobera/Cola)
      let emitterPt = { x: normX, y: normY };
      if (typeof AetheriaCursor !== 'undefined') {
        emitterPt = AetheriaCursor.getEmitterOffsetPoint(normX, normY, dx, dy);
      }

      // Inyección de fluido con simetría unificada
      const impulse = trailCfg.impulse || 1.0;
      if (typeof AetheriaSymmetry !== 'undefined') {
        AetheriaSymmetry.injectSplat(emitterPt.x, emitterPt.y, dx * impulse, dy * impulse, col, trailCfg.radiusScale, aspect);
      } else {
        FluidCore.splat(emitterPt.x, emitterPt.y, dx * impulse, dy * impulse, col, trailCfg.radiusScale);
      }

      // Emisión de partículas desde la tobera
      if (AetheriaParticles) {
        const hexCol = `rgb(${Math.round(col[0] * 255)}, ${Math.round(col[1] * 255)}, ${Math.round(col[2] * 255)})`;
        AetheriaParticles.emit(emitterPt.x * window.innerWidth, (1.0 - emitterPt.y) * window.innerHeight, dx * 0.05, dy * 0.05, hexCol, trailCfg.sparkType, trailCfg.sparkCount);
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

      // Draw Background Color
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, w, h);

      // Draw WebGL layer
      ctx.drawImage(this.glCanvas, 0, 0, w, h);

      // Draw Swarm visual layer
      if (AetheriaSwarmRenderer && AetheriaSwarmRenderer.canvas) {
        ctx.drawImage(AetheriaSwarmRenderer.canvas, 0, 0, w, h);
      }

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

      // 1. Autonomous Swarm Boids (Auto-Pilot "Pecera" con oscilación armónica suave)
      if (typeof AetheriaSwarm !== 'undefined' && AetheriaSwarm.isEnabled) {
        AetheriaSwarm.updateAndEmit(dt, FluidCore, AetheriaParticles);
      }

      // 2. Render Swarm Visual Layer
      if (typeof AetheriaSwarmRenderer !== 'undefined' && typeof AetheriaSwarm !== 'undefined') {
        const swarmAvatar = (typeof AetheriaState !== 'undefined') ? AetheriaState.swarmAvatar : 'nyan';
        AetheriaSwarmRenderer.render(AetheriaSwarm.boids, swarmAvatar, AetheriaSwarm.isEnabled);
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

      this._rafId = requestAnimationFrame(() => this.loop());
    }
  }

  // Initialize on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    root.aetheria = new AetheriaApp();
  });
})(typeof window !== 'undefined' ? window : this);
