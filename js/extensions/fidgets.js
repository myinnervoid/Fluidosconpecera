/**
 * AETHERIA | Fidgets & Physical Interactions
 * Controls Supernova radial shockwave, Vortex rotational impulse, Tangible Gravity,
 * and Sensory Profiles (Fluid, Sand, Gas, Lava Lamp).
 */

(function (root) {
  'use strict';

  class FidgetsController {
    constructor() {
      this.isGravityActive = false;
      this.gravityMagnitude = -1.85; // Tangible downward cascade
    }

    triggerSupernova(core, colorRgb, center = { x: 0.5, y: 0.5 }) {
      if (!core) return;
      const count = 20;
      const force = 3200;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const dx = Math.cos(angle) * force;
        const dy = Math.sin(angle) * force;
        core.splat(center.x, center.y, dx, dy, colorRgb, 0.6);
      }
    }

    triggerVortex(core, colorRgb, center = { x: 0.5, y: 0.5 }) {
      if (!core) return;
      const count = 20;
      const force = 2800;
      const radius = 0.06;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ox = center.x + Math.cos(angle) * radius;
        const oy = center.y + Math.sin(angle) * radius;
        const dx = -Math.sin(angle) * force;
        const dy = Math.cos(angle) * force;
        core.splat(ox, oy, dx, dy, colorRgb, 0.6);
      }
    }

    toggleGravity(core) {
      if (!core) return false;
      this.isGravityActive = !this.isGravityActive;

      if (this.isGravityActive) {
        core.setGravity(0.0, this.gravityMagnitude);
      } else {
        core.setGravity(0.0, 0.0);
      }

      return this.isGravityActive;
    }

    setGravityMagnitude(core, mag) {
      this.gravityMagnitude = mag;
      if (this.isGravityActive && core) {
        core.setGravity(0.0, this.gravityMagnitude);
      }
    }

    applyElementProfile(core, elementName) {
      if (!core) return;

      if (elementName === 'gas') {
        core.setConfig({
          DENSITY_DISSIPATION: 0.35,
          VELOCITY_DISSIPATION: 0.15,
          CURL: 42.0,
          SPLAT_RADIUS: 0.25,
          SUNRAYS: true,
          BLOOM: true
        });
        core.setGravity(0.0, 0.0);
      } else if (elementName === 'sand') {
        core.setConfig({
          DENSITY_DISSIPATION: 0.85,
          VELOCITY_DISSIPATION: 0.28,
          CURL: 20.0,
          SPLAT_RADIUS: 0.25,
          SUNRAYS: false,
          BLOOM: false
        });
        core.setGravity(0.0, 0.0);
      } else if (elementName === 'lava') {
        // Lava Lamp profile: high thermal buoyancy, viscous organic blobs, slow rising convection
        core.setConfig({
          DENSITY_DISSIPATION: 0.993,
          VELOCITY_DISSIPATION: 0.985,
          CURL: 15.0,
          SPLAT_RADIUS: 0.42,
          SUNRAYS: true,
          BLOOM: true
        });
        core.setGravity(0.0, 0.95); // Upward thermal convection
      } else if (elementName === 'fluid') {
        // Fluid profile: standard liquid
        core.setConfig({
          DENSITY_DISSIPATION: 0.98,
          VELOCITY_DISSIPATION: 0.20,
          CURL: 30.0,
          SPLAT_RADIUS: 0.25,
          SUNRAYS: true,
          BLOOM: true
        });
        core.setGravity(0.0, 0.0);
      }
    }

    togglePause(core) {
      if (!core) return false;
      core.config.PAUSED = !core.config.PAUSED;
      return core.config.PAUSED;
    }

    clear(core) {
      if (core) core.reset();
    }
  }

  root.AetheriaFidgets = new FidgetsController();
})(typeof window !== 'undefined' ? window : this);
