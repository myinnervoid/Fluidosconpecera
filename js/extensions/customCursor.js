/**
 * AETHERIA | Dynamic Custom Cursor & Thematic Avatars
 * 6 Punteros Principales + Avatar Personalizado:
 * - 0: 'none' (Predeterminado / Sistema / Trazo limpio)
 * - 1: 'nyan' (Nyan Cat clásico)
 * - 2: 'rocket' (Cohete Aeroespacial orientado 360°)
 * - 3: 'comet' (Cometa Cósmico con haz de plasma)
 * - 4: 'clownfish' (Pez Payaso / Nemo de Arrecife)
 * - 5: 'miku' (Hatsune Miku con estela cian/techno)
 * - 6: 'custom' (Imagen PNG/GIF cargada en local)
 */

(function (root) {
  'use strict';

  const AVATAR_CONFIGS = {
    none: {
      name: 'Sin Puntero',
      tag: 'Predeterminado',
      radiusScale: 1.00,
      sparkType: 'star',
      sparkColors: null,
      sparkCount: 2,
      impulse: 1.00,
      offset: 0.000,
      angleCorrection: 0
    },
    nyan: {
      name: 'Nyan Cat',
      tag: 'Arcoíris Pixel',
      radiusScale: 0.38,
      sparkType: 'pixel',
      sparkColors: ['#ff0055', '#ff9900', '#ffff00', '#33ff00', '#0099ff', '#9900cc'],
      sparkCount: 3,
      impulse: 0.85,
      offset: 0.000,
      angleCorrection: 0
    },
    rocket: {
      name: 'Cohete',
      tag: 'Tobera de Fuego',
      radiusScale: 0.32,
      sparkType: 'fire',
      sparkColors: ['#ffbe0b', '#ff4500', '#ff007f', '#ff9e1b', '#ffffff'],
      sparkCount: 3,
      impulse: 1.25,
      offset: 0.000,
      angleCorrection: 90
    },
    comet: {
      name: 'Cometa',
      tag: 'Plasma Cósmico',
      radiusScale: 0.28,
      sparkType: 'dust',
      sparkColors: ['#38bdf8', '#00f2fe', '#e0f2fe', '#ffffff', '#a78bfa'],
      sparkCount: 3,
      impulse: 1.10,
      offset: 0.000,
      angleCorrection: 45
    },
    clownfish: {
      name: 'Pez Payaso',
      tag: 'Burbujas Marinas',
      radiusScale: 0.34,
      sparkType: 'bubbles',
      sparkColors: ['#38bdf8', '#a5f3fc', '#ffffff', '#fed7aa', '#ff7a00'],
      sparkCount: 2,
      impulse: 0.75,
      offset: 0.000,
      angleCorrection: 0
    },
    fish: {
      name: 'Pez Nemo',
      tag: 'Burbujas Marinas',
      radiusScale: 0.34,
      sparkType: 'bubbles',
      sparkColors: ['#38bdf8', '#a5f3fc', '#ffffff', '#fed7aa', '#ff7a00'],
      sparkCount: 2,
      impulse: 0.75,
      offset: 0.000,
      angleCorrection: 0
    },
    miku: {
      name: 'Hatsune Miku',
      tag: 'Techno Pop Neón',
      radiusScale: 0.36,
      sparkType: 'neon',
      sparkColors: ['#39C5BB', '#ff007f', '#00f2fe', '#ff80ab', '#ffffff'],
      sparkCount: 3,
      impulse: 0.90,
      offset: 0.000,
      angleCorrection: 0
    },
    custom: {
      name: 'Personalizado',
      tag: 'Estrellas Oro',
      radiusScale: 0.40,
      sparkType: 'star',
      sparkColors: ['#fbbf24', '#f59e0b', '#fef08a', '#ffffff'],
      sparkCount: 3,
      impulse: 1.00,
      offset: 0.000,
      angleCorrection: 0
    }
  };

  const AVATAR_SVGS = {
    // 1. Nyan Cat
    nyan: `
      <svg viewBox="0 0 48 32" class="cursor-svg nyan-svg" aria-hidden="true">
        <path d="M0 8h8v16H0z" fill="#ff0000" opacity="0.85"/>
        <path d="M0 11h8v10H0z" fill="#ff9900" opacity="0.85"/>
        <path d="M0 14h8v4H0z" fill="#ffff00" opacity="0.85"/>
        <path d="M0 16h8v4H0z" fill="#33ff00" opacity="0.85"/>
        <path d="M0 18h8v4H0z" fill="#0099ff" opacity="0.85"/>
        <path d="M0 20h8v4H0z" fill="#6633ff" opacity="0.85"/>
        <rect x="10" y="6" width="24" height="20" rx="3" fill="#ffd199" stroke="#111" stroke-width="1.2"/>
        <rect x="13" y="9" width="18" height="14" rx="2" fill="#ff99bb"/>
        <circle cx="16" cy="12" r="1" fill="#ff0055"/>
        <circle cx="22" cy="11" r="1" fill="#9900cc"/>
        <circle cx="27" cy="14" r="1" fill="#ff0055"/>
        <circle cx="17" cy="18" r="1" fill="#9900cc"/>
        <circle cx="24" cy="19" r="1" fill="#ff0055"/>
        <rect x="26" y="10" width="16" height="14" rx="3" fill="#999999" stroke="#111" stroke-width="1.2"/>
        <polygon points="27,10 31,4 33,10" fill="#999999" stroke="#111" stroke-width="1"/>
        <polygon points="37,10 39,4 41,10" fill="#999999" stroke="#111" stroke-width="1"/>
        <circle cx="31" cy="15" r="1.5" fill="#000"/>
        <circle cx="37" cy="15" r="1.5" fill="#000"/>
        <circle cx="34" cy="17" r="1" fill="#ff6699"/>
        <circle cx="28" cy="17" r="1.5" fill="#ff9999"/>
        <circle cx="40" cy="17" r="1.5" fill="#ff9999"/>
        <rect x="6" y="14" width="5" height="3" rx="1.5" fill="#999999" stroke="#111" stroke-width="1"/>
        <rect x="14" y="25" width="4" height="4" rx="2" fill="#999999" stroke="#111" stroke-width="1"/>
        <rect x="26" y="25" width="4" height="4" rx="2" fill="#999999" stroke="#111" stroke-width="1"/>
      </svg>
    `,

    // 2. Cohete Espacial
    rocket: `
      <svg viewBox="0 0 36 36" class="cursor-svg rocket-svg" aria-hidden="true">
        <polygon points="18,34 13,24 23,24" fill="#ffbe0b" filter="drop-shadow(0 0 6px #ff007f)"/>
        <polygon points="18,30 15,24 21,24" fill="#ff007f"/>
        <path d="M18 2 Q27 12 24 25 L12 25 Q9 12 18 2 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="1.5"/>
        <circle cx="18" cy="14" r="3.5" fill="#00f2fe" stroke="#0f172a" stroke-width="1"/>
        <circle cx="17" cy="13" r="1" fill="#ffffff"/>
        <path d="M12 20 L5 26 L12 25 Z" fill="#ff007f" stroke="#0f172a" stroke-width="1"/>
        <path d="M24 20 L31 26 L24 25 Z" fill="#ff007f" stroke="#0f172a" stroke-width="1"/>
        <path d="M16 2 L18 0 L20 2 Z" fill="#ff007f"/>
      </svg>
    `,

    // 3. Cometa Cósmico
    comet: `
      <svg viewBox="0 0 36 36" class="cursor-svg comet-svg" aria-hidden="true">
        <defs>
          <linearGradient id="cometTailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="transparent"/>
            <stop offset="60%" stop-color="#38bdf8" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#ffffff"/>
          </linearGradient>
        </defs>
        <polygon points="4,32 18,18 32,4 18,14 8,24" fill="url(#cometTailGrad)"/>
        <circle cx="28" cy="8" r="5" fill="#ffffff" filter="drop-shadow(0 0 10px #38bdf8)"/>
        <circle cx="28" cy="8" r="2.5" fill="#7dd3fc"/>
      </svg>
    `,

    // 4. Pez Payaso (Nemo)
    clownfish: `
      <svg viewBox="0 0 38 28" class="cursor-svg clownfish-svg" aria-hidden="true">
        <defs>
          <linearGradient id="fishBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ff4500"/>
            <stop offset="60%" stop-color="#ff7a00"/>
            <stop offset="100%" stop-color="#ff9e1b"/>
          </linearGradient>
        </defs>
        <!-- Aleta Caudal (Cola) -->
        <path d="M6 14 L0 8 Q3 14 0 20 Z" fill="#ff4500" stroke="#111" stroke-width="1"/>
        <path d="M5 14 L2 10 Q3 14 2 18 Z" fill="#ffffff"/>
        <!-- Aleta Dorsal -->
        <path d="M18 4 Q24 0 28 6 Z" fill="#ff5e00" stroke="#111" stroke-width="0.8"/>
        <!-- Aleta Ventral -->
        <path d="M20 23 Q25 28 27 22 Z" fill="#ff5e00" stroke="#111" stroke-width="0.8"/>
        <!-- Cuerpo Principal -->
        <path d="M6 14 Q10 4 26 6 Q36 10 37 14 Q36 18 26 22 Q10 24 6 14 Z" fill="url(#fishBodyGrad)" stroke="#111" stroke-width="1.2"/>
        <!-- Franjas Blancas con bordes negros -->
        <path d="M24 6 Q27 14 24 22 Q21 14 24 6 Z" fill="#ffffff" stroke="#111" stroke-width="0.8"/>
        <path d="M14 8 Q17 14 14 20 Q12 14 14 8 Z" fill="#ffffff" stroke="#111" stroke-width="0.8"/>
        <!-- Ojo -->
        <circle cx="32" cy="11" r="2.8" fill="#ffffff" stroke="#111" stroke-width="0.8"/>
        <circle cx="33" cy="11" r="1.5" fill="#000000"/>
        <circle cx="33.6" cy="10.4" r="0.6" fill="#ffffff"/>
        <!-- Aleta Pectoral -->
        <ellipse cx="22" cy="15" rx="3.5" ry="2.2" transform="rotate(-15 22 15)" fill="#ffa726" stroke="#111" stroke-width="0.8"/>
      </svg>
    `,

    // 5. Hatsune Miku
    miku: `
      <svg viewBox="0 0 36 36" class="cursor-svg miku-svg" aria-hidden="true">
        <defs>
          <linearGradient id="mikuHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#39C5BB"/>
            <stop offset="100%" stop-color="#00838f"/>
          </linearGradient>
        </defs>
        <!-- Coleta Izquierda (dinámica) -->
        <path d="M10 14 C4 18 2 28 4 34 C6 30 10 24 12 18 Z" fill="url(#mikuHairGrad)" filter="drop-shadow(0 0 4px #39C5BB)"/>
        <!-- Coleta Derecha (dinámica) -->
        <path d="M26 14 C32 18 34 28 32 34 C30 30 26 24 24 18 Z" fill="url(#mikuHairGrad)" filter="drop-shadow(0 0 4px #39C5BB)"/>
        <!-- Lazos de Coleta Rosa/Magenta -->
        <rect x="9" y="13" width="3.5" height="3.5" rx="1" fill="#ff007f" stroke="#111" stroke-width="0.6"/>
        <rect x="23.5" y="13" width="3.5" height="3.5" rx="1" fill="#ff007f" stroke="#111" stroke-width="0.6"/>
        <!-- Auriculares / Headset -->
        <path d="M11 15 C11 7 25 7 25 15" fill="none" stroke="#222" stroke-width="2"/>
        <rect x="9" y="13" width="3" height="5" rx="1.5" fill="#e91e63"/>
        <rect x="24" y="13" width="3" height="5" rx="1.5" fill="#e91e63"/>
        <!-- Rostro -->
        <ellipse cx="18" cy="18" rx="7.5" ry="7" fill="#ffe0bd"/>
        <!-- Flequillo Miku -->
        <path d="M11 15 C12 11 24 11 25 15 C23 17 21 16 18 18 C15 16 13 17 11 15 Z" fill="#39C5BB"/>
        <!-- Ojos Grandes Manga Teal -->
        <ellipse cx="15" cy="18" rx="1.6" ry="2.2" fill="#00838f"/>
        <circle cx="15.4" cy="17.4" r="0.7" fill="#ffffff"/>
        <ellipse cx="21" cy="18" rx="1.6" ry="2.2" fill="#00838f"/>
        <circle cx="21.4" cy="17.4" r="0.7" fill="#ffffff"/>
        <!-- Sonrisa & Rubor -->
        <circle cx="13.5" cy="20.5" r="1" fill="#ff80ab" opacity="0.7"/>
        <circle cx="22.5" cy="20.5" r="1" fill="#ff80ab" opacity="0.7"/>
        <path d="M17 21 Q18 22.5 19 21" fill="none" stroke="#e91e63" stroke-width="0.8" stroke-linecap="round"/>
      </svg>
    `
  };

  class CustomCursorController {
    constructor() {
      this.currentType = 'none'; // 'none', 'nyan', 'rocket', 'comet', 'clownfish', 'miku', 'custom'
      this.customDataUrl = null;
      this.avatarConfig = AVATAR_CONFIGS;
      this.loadStoredCustomAvatar();
    }

    loadStoredCustomAvatar() {
      try {
        const stored = localStorage.getItem('aetheria_custom_avatar');
        if (stored) {
          this.customDataUrl = stored;
        }
      } catch (e) {
        console.warn('LocalStorage no disponible para cursor personalizado:', e);
      }
    }

    saveCustomAvatar(dataUrl) {
      this.customDataUrl = dataUrl;
      try {
        localStorage.setItem('aetheria_custom_avatar', dataUrl);
        localStorage.setItem('aetheria-custom-avatar', dataUrl);
      } catch (e) {
        console.warn('No se pudo persistir el avatar en LocalStorage:', e);
      }
      this.setCursorType('custom');
    }

    setCustomImage(dataUrl) {
      this.saveCustomAvatar(dataUrl);
    }

    setCursorType(type) {
      const resolvedType = (type === 'fish') ? 'clownfish' : type;
      this.currentType = AVATAR_CONFIGS[resolvedType] ? resolvedType : 'none';
      this.currentAvatar = this.currentType;

      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.setUserAvatar(this.currentType);
      }
      if (typeof document !== 'undefined' && document.body) {
        document.body.classList.toggle('avatar-active', this.currentType !== 'none');
      }
      if (typeof AetheriaSymmetry !== 'undefined') {
        AetheriaSymmetry.updateCursorDOM();
      }
      if (typeof AetheriaParticles !== 'undefined' && typeof AetheriaParticles.setEffect === 'function') {
        const cfg = this.getTrailConfig();
        AetheriaParticles.setEffect(cfg.sparkType, (cfg.sparkColors && cfg.sparkColors[0]) || '#00f2fe');
      }
      try {
        localStorage.setItem('aetheria-avatar', this.currentType);
      } catch (e) {}
    }

    setAvatar(type) {
      this.setCursorType(type);
    }

    getCurrentAvatarConfig() {
      return this.getTrailConfig();
    }

    getAvatarHTML() {
      if (this.currentType === 'none') {
        return '';
      }
      if (this.currentType === 'custom' && this.customDataUrl) {
        return `<img src="${this.customDataUrl}" class="cursor-custom-img" alt="Cursor"/>`;
      }
      return AVATAR_SVGS[this.currentType] || '';
    }

    getTrailConfig() {
      return AVATAR_CONFIGS[this.currentType] || AVATAR_CONFIGS.none;
    }

    /**
     * Retorna la configuración de emisión de chispas y partículas para el puntero activo.
     */
    getSparkEmission() {
      const cfg = this.getTrailConfig();
      let colorHex = '#00f2fe';

      if (cfg.sparkColors && cfg.sparkColors.length > 0) {
        const randIdx = Math.floor(Math.random() * cfg.sparkColors.length);
        colorHex = cfg.sparkColors[randIdx];
      } else if (typeof AetheriaState !== 'undefined') {
        const rgb = AetheriaState.getUserColor(0);
        const r = Math.round(Math.min(1, Math.max(0, rgb[0])) * 255);
        const g = Math.round(Math.min(1, Math.max(0, rgb[1])) * 255);
        const b = Math.round(Math.min(1, Math.max(0, rgb[2])) * 255);
        colorHex = `rgb(${r},${g},${b})`;
      }

      return {
        sparkType: cfg.sparkType || 'star',
        colorHex,
        count: cfg.sparkCount || 2,
        radiusScale: cfg.radiusScale || 1.0
      };
    }

    /**
     * Obtiene el color para splat de usuario:
     * Al hacer click o arrastrar el usuario, respeta fielmente la paleta activa
     * consultando el estado centralizado AetheriaState.
     */
    getUserSplatColor(index = 0) {
      if (typeof AetheriaState !== 'undefined') {
        return AetheriaState.getUserColor(index);
      }
      return [0.0, 0.95, 1.0];
    }

    /**
     * Calcula la rotación angular precisa en grados según el vector de movimiento (dx, dy).
     */
    calculateRotation(dx, dy) {
      if (Math.hypot(dx, dy) < 0.0001) return 0;
      const angleRad = Math.atan2(-dy, dx);
      let deg = angleRad * (180 / Math.PI);

      const cfg = AVATAR_CONFIGS[this.currentType] || AVATAR_CONFIGS.none;
      return deg + (cfg.angleCorrection || 0);
    }

    /**
     * Calcula la posición de emisión trasera (tobera o cola) según el vector de avance.
     */
    getEmitterOffsetPoint(normX, normY, dx, dy) {
      const cfg = AVATAR_CONFIGS[this.currentType] || AVATAR_CONFIGS.none;
      if (this.currentType === 'none' || !cfg.offset) {
        return { x: normX, y: normY };
      }

      const speed = Math.hypot(dx, dy);
      if (speed < 0.001) return { x: normX, y: normY };

      const normVx = dx / speed;
      const normVy = dy / speed;
      const offsetDistance = Math.abs(cfg.offset);

      return {
        x: normX - normVx * offsetDistance,
        y: normY - normVy * offsetDistance
      };
    }
  }

  root.AetheriaCursor = new CustomCursorController();
})(typeof window !== 'undefined' ? window : this);
