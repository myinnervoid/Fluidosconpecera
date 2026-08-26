/**
 * AETHERIA | Centralized Event & State Bus (AetheriaState)
 * Single Source of Truth for:
 * - Active Palettes & Element Profiles
 * - Radial & Bilateral Symmetry Modes
 * - User Avatar & Autonomous Swarm Avatar
 * - Active Backgrounds (Adaptive 16:9 / 9:16)
 * - UI States (Fullscreen, Bar Position, Drawer Open, Dev Mode)
 * - Physical States (Gravity, Pause)
 * License: MIT
 */

(function (root) {
  'use strict';

  class StateController {
    constructor() {
      // Estado de Elemento y Color
      this.palette = { key: 'aurora', name: '🌌 Aurora Boreal' };
      this.activeElement = 'fluid'; // 'fluid', 'sand', 'gas', 'lava'
      this.symmetry = 4; // 1, 2, 4, 6, 8
      this.isPaused = false;
      this.isGravityOn = false;
      this.gravityMagnitude = -1.85;
      
      // Avatares
      this.userAvatar = 'none'; // 'none', 'nyan', 'rocket', 'comet', 'clownfish', 'miku', 'custom'
      this.swarmAvatar = 'nyan';
      this.swarmCount = 3;
      this.isSwarmActive = false;

      // Preferencias de UI Persistentes
      this.devMode = localStorage.getItem('aetheria_dev_mode') === 'true';
      this.barPosition = localStorage.getItem('aetheria_bar_position') || 'top'; // 'top' | 'bottom'
      this.activeBackground = localStorage.getItem('aetheria_background') || 'universe';
      this.isFullscreen = false;
      this.isDrawerOpen = false;
    }

    getPaletteColors() {
      if (typeof AetheriaPalettes !== 'undefined') {
        const group = AetheriaPalettes[this.activeElement] || AetheriaPalettes.fluid;
        const pal = group[this.palette.key] || Object.values(group)[0];
        if (pal && pal.colors) return pal.colors;
      }
      return [
        [0.0, 0.95, 1.0],
        [0.55, 0.1, 1.0],
        [1.0, 0.05, 0.55],
        [0.1, 0.95, 0.6]
      ];
    }

    getUserColor(index = 0) {
      const cols = this.getPaletteColors();
      return cols[index % cols.length] || [0.0, 0.95, 1.0];
    }

    setPalette(key) {
      this.palette.key = key;
      if (typeof AetheriaPalettes !== 'undefined') {
        const group = AetheriaPalettes[this.activeElement] || AetheriaPalettes.fluid;
        if (group[key]) {
          this.palette.name = group[key].name;
        }
      }
    }

    setElement(elem) {
      this.activeElement = elem;
      if (typeof AetheriaPalettes !== 'undefined') {
        const group = AetheriaPalettes[elem] || AetheriaPalettes.fluid;
        const firstKey = Object.keys(group)[0];
        this.palette.key = firstKey;
        this.palette.name = group[firstKey] ? group[firstKey].name : 'Paleta';
      }
    }

    setSymmetry(mode) {
      this.symmetry = parseInt(mode, 10) || 1;
      // Auto-regular cantidad de boids si la simetría es alta para garantizar 60 FPS
      if (this.symmetry >= 6 && this.swarmCount > 4 && !this.devMode) {
        this.swarmCount = 3;
        if (typeof AetheriaSwarm !== 'undefined') {
          AetheriaSwarm.setBoidsCount(3);
        }
      }
    }

    setUserAvatar(type) {
      this.userAvatar = type;
      this.swarmAvatar = type;
    }

    setBarPosition(pos) {
      this.barPosition = pos === 'bottom' ? 'bottom' : 'top';
      localStorage.setItem('aetheria_bar_position', this.barPosition);
    }

    setDevMode(enabled) {
      this.devMode = !!enabled;
      localStorage.setItem('aetheria_dev_mode', this.devMode.toString());
    }
  }

  root.AetheriaState = new StateController();
})(typeof window !== 'undefined' ? window : this);
