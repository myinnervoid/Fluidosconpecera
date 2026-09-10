/**
 * AETHERIA | Adaptive Immersive Backgrounds Engine
 * Manages dual-aspect background images (16:9 for landscape/desktop and 9:16 for portrait/mobile).
 * Provides cross-fade transitions and image preloading with zero canvas layout thrashing.
 * License: MIT
 */

(function (root) {
  'use strict';

  class BackgroundManager {
    constructor() {
      this.container = null;
      this.activeBackground = 'none';
      this.currentOrientation = this.getOrientation(); // '16_9' | '9_16'
      this.debounceTimer = null;
      this.isTransitioning = false;

      this.backgrounds = {
        none: {
          name: 'Vacío (Negro)',
          icon: '🌑',
          category: 'utility',
          files: null
        },
        universe: {
          name: 'Universo Profundo',
          icon: '🌌',
          category: 'cosmic',
          files: {
            '16_9': 'assets/backgrounds/universe_16_9.jpeg',
            '9_16': 'assets/backgrounds/universe_9_16.jpeg'
          }
        },
        galaxy: {
          name: 'Galaxia Espiral',
          icon: '🌀',
          category: 'cosmic',
          files: {
            '16_9': 'assets/backgrounds/galaxy_16_9.jpeg',
            '9_16': 'assets/backgrounds/galaxy_9_16.jpeg'
          }
        },
        pool: {
          name: 'Alberca Cristalina',
          icon: '🏊',
          category: 'aquatic',
          files: {
            '16_9': 'assets/backgrounds/pool_16_9.jpeg',
            '9_16': 'assets/backgrounds/pool_9_16.jpeg'
          }
        },
        bucket: {
          name: 'Cubeta de Agua',
          icon: '🪣',
          category: 'aquatic',
          files: {
            '16_9': 'assets/backgrounds/bucket_16_9.jpeg',
            '9_16': 'assets/backgrounds/bucket_9_16.jpeg'
          }
        },
        caribbean: {
          name: 'Mar Caribe',
          icon: '🏝️',
          category: 'aquatic',
          files: {
            '16_9': 'assets/backgrounds/caribbean_16_9.jpeg',
            '9_16': 'assets/backgrounds/caribbean_9_16.jpeg'
          }
        },
        river: {
          name: 'Río de Montaña',
          icon: '🏞️',
          category: 'aquatic',
          files: {
            '16_9': 'assets/backgrounds/river_16_9.jpeg',
            '9_16': 'assets/backgrounds/river_9_16.jpeg'
          }
        },
        lagoon: {
          name: 'Laguna Mística',
          icon: '🌿',
          category: 'aquatic',
          files: {
            '16_9': 'assets/backgrounds/lagoon_16_9.jpeg',
            '9_16': 'assets/backgrounds/lagoon_9_16.jpeg'
          }
        },
        cenote: {
          name: 'Cenote Sagrado',
          icon: '🕳️',
          category: 'aquatic',
          files: {
            '16_9': 'assets/backgrounds/cenote_16_9.jpeg',
            '9_16': 'assets/backgrounds/cenote_9_16.jpeg'
          }
        }
      };
    }

    init() {
      this.container = document.getElementById('background-layer');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'background-layer';
        document.body.insertBefore(this.container, document.body.firstChild);
      }

      // Load saved background or default to 'universe'
      const saved = localStorage.getItem('aetheria_background') || 'universe';
      this.setBackground(saved, false);

      // Handle window resize & orientation changes with debounce
      window.addEventListener('resize', () => this.handleResize());
      window.addEventListener('orientationchange', () => this.handleResize());
    }

    getOrientation() {
      return window.innerWidth > window.innerHeight ? '16_9' : '9_16';
    }

    handleResize() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        const newOrientation = this.getOrientation();
        if (newOrientation !== this.currentOrientation) {
          this.currentOrientation = newOrientation;
          if (this.activeBackground !== 'none') {
            this.applyBackground(this.activeBackground, true);
          }
        }
      }, 150);
    }

    setBackground(name, smooth = true) {
      if (!this.backgrounds[name]) {
        name = 'none';
      }

      this.activeBackground = name;
      try {
        localStorage.setItem('aetheria_background', name);
      } catch (e) {
        console.warn('LocalStorage no disponible para fondo:', e);
      }

      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.activeBackground = name;
      }

      // Enable WebGL transparent background blending when an image is active
      if (typeof FluidCore !== 'undefined' && FluidCore.isInitialized) {
        FluidCore.config.TRANSPARENT = (name !== 'none');
      }

      return this.applyBackground(name, smooth);
    }

    applyBackground(name, smooth = true) {
      return new Promise((resolve) => {
        if (!this.container) {
          const res = (typeof createApiResponse === 'function')
            ? createApiResponse(false, null, 'ERR_IMAGE_LOAD_FAILED', 'Contenedor de fondo no encontrado')
            : { success: false, data: null, error_code: 'ERR_IMAGE_LOAD_FAILED', message: 'Contenedor no encontrado' };
          return resolve(res);
        }

        const bg = this.backgrounds[name];
        if (!bg || name === 'none' || !bg.files) {
          if (smooth) {
            this.container.style.opacity = '0';
            setTimeout(() => {
              this.container.style.backgroundImage = 'none';
              this.container.style.backgroundColor = '#07090e';
              this.container.style.opacity = '1';
              const res = (typeof createApiResponse === 'function')
                ? createApiResponse(true, { background: 'none' }, null, 'Fondo vacío aplicado')
                : { success: true, data: { background: 'none' }, error_code: null, message: 'Fondo vacío aplicado' };
              resolve(res);
            }, 300);
          } else {
            this.container.style.backgroundImage = 'none';
            this.container.style.backgroundColor = '#07090e';
            this.container.style.opacity = '1';
            const res = (typeof createApiResponse === 'function')
              ? createApiResponse(true, { background: 'none' }, null, 'Fondo vacío aplicado')
              : { success: true, data: { background: 'none' }, error_code: null, message: 'Fondo vacío aplicado' };
            resolve(res);
          }
          return;
        }

        const orientation = this.getOrientation();
        const imageUrl = bg.files[orientation] || bg.files['16_9'];

        // Preload image before applying to avoid white flashes
        const img = new Image();
        img.onload = () => {
          if (smooth) {
            this.container.style.opacity = '0';
            setTimeout(() => {
              this.container.style.backgroundImage = `url("${imageUrl}")`;
              this.container.style.backgroundColor = 'transparent';
              this.container.style.opacity = '1';
              const res = (typeof createApiResponse === 'function')
                ? createApiResponse(true, { background: name, orientation, imageUrl }, null, `Fondo ${bg.name} aplicado`)
                : { success: true, data: { background: name, orientation, imageUrl }, error_code: null, message: `Fondo ${bg.name} aplicado` };
              resolve(res);
            }, 250);
          } else {
            this.container.style.backgroundImage = `url("${imageUrl}")`;
            this.container.style.backgroundColor = 'transparent';
            this.container.style.opacity = '1';
            const res = (typeof createApiResponse === 'function')
              ? createApiResponse(true, { background: name, orientation, imageUrl }, null, `Fondo ${bg.name} aplicado`)
              : { success: true, data: { background: name, orientation, imageUrl }, error_code: null, message: `Fondo ${bg.name} aplicado` };
            resolve(res);
          }
        };
        img.onerror = () => {
          console.warn(`AetheriaBackground: No se pudo cargar ${imageUrl}`);
          const res = (typeof createApiResponse === 'function')
            ? createApiResponse(false, null, 'ERR_IMAGE_LOAD_FAILED', `No se pudo cargar la imagen: ${imageUrl}`)
            : { success: false, data: null, error_code: 'ERR_IMAGE_LOAD_FAILED', message: `Fallo carga de imagen ${imageUrl}` };
          resolve(res);
        };
        img.src = imageUrl;
      });
    }

    getCurrentBackground() {
      return this.activeBackground;
    }

    getBackgroundList() {
      return Object.keys(this.backgrounds).map((key) => ({
        id: key,
        ...this.backgrounds[key]
      }));
    }
  }

  root.AetheriaBackground = new BackgroundManager();
})(typeof window !== 'undefined' ? window : this);
