/**
 * AETHERIA | Fidgets & Physical Interactions
 * Controls Supernova radial shockwave, Vortex rotational impulse, Tangible Gravity, and Gas/Sand physics profiles.
 */

(function (root) {
  'use strict';

  class FidgetsController {
    constructor() {
      this.isGravityActive = false;
      this.gravityMagnitude = -1.85; // Tangible, clearly visible downward cascade
    }

    triggerSupernova(core, colorRgb, center = { x: 0.5, y: 0.5 }) {
      if (!core) return;
      const count = 20;
      const force = 3200; // Strong, tactile radial shockwave

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const dx = Math.cos(angle) * force;
        const dy = Math.sin(angle) * force;
        core.splat(center.x, center.y, dx, dy, colorRgb);
      }
    }

    triggerVortex(core, colorRgb, center = { x: 0.5, y: 0.5 }) {
      if (!core) return;
      const count = 20;
      const force = 2800; // Immediate rotational tangential swirl
      const radius = 0.06;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const ox = center.x + Math.cos(angle) * radius;
        const oy = center.y + Math.sin(angle) * radius;
        const dx = -Math.sin(angle) * force;
        const dy = Math.cos(angle) * force;
        core.splat(ox, oy, dx, dy, colorRgb);
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
          SUNRAYS: true,
          BLOOM: true
        });
      } else if (elementName === 'sand') {
        // Sand profile: lower dissipation, dense particulate movement
        core.setConfig({
          DENSITY_DISSIPATION: 0.85,
          VELOCITY_DISSIPATION: 0.28,
          CURL: 20.0,
          SUNRAYS: false,
          BLOOM: false
        });
      } else if (elementName === 'fluid') {
        // Fluid profile: viscous liquid
        core.setConfig({
          DENSITY_DISSIPATION: 0.98,
          VELOCITY_DISSIPATION: 0.20,
          CURL: 30.0,
          SUNRAYS: true,
          BLOOM: true
        });
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
