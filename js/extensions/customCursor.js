/**
 * AETHERIA | Dynamic Custom Cursor & Thematic Avatars
 * Supports Nyan Cat (Rainbow trail), Cosmic Rocket, Comet, Energy Orb,
 * and user-uploaded local avatars persisted via localStorage.
 */

(function (root) {
  'use strict';

  // Crisp, lightweight inline SVG avatars
  const AVATAR_SVGS = {
    orb: `
      <svg viewBox="0 0 32 32" class="cursor-svg orb-svg">
        <circle cx="16" cy="16" r="10" fill="url(#orbGrad)" filter="drop-shadow(0 0 8px #00f2fe)"/>
        <defs>
          <radialGradient id="orbGrad" cx="35%" cy="35%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="50%" stop-color="#00f2fe"/>
            <stop offset="100%" stop-color="#ff007f"/>
          </radialGradient>
        </defs>
      </svg>
    `,

    nyan: `
      <svg viewBox="0 0 48 32" class="cursor-svg nyan-svg">
        <!-- Rainbow trail aura -->
        <path d="M0 8h8v16H0z" fill="#ff0000" opacity="0.8"/>
        <path d="M0 11h8v10H0z" fill="#ff9900" opacity="0.8"/>
        <path d="M0 14h8v4H0z" fill="#ffff00" opacity="0.8"/>
        <path d="M0 16h8v4H0z" fill="#33ff00" opacity="0.8"/>
        <path d="M0 18h8v4H0z" fill="#0099ff" opacity="0.8"/>
        <path d="M0 20h8v4H0z" fill="#6633ff" opacity="0.8"/>
        <!-- Pop-tart Body -->
        <rect x="10" y="6" width="24" height="20" rx="3" fill="#ffd199" stroke="#000" stroke-width="1.5"/>
        <rect x="13" y="9" width="18" height="14" rx="2" fill="#ff99bb"/>
        <!-- Sprinkles -->
        <circle cx="16" cy="12" r="1" fill="#ff0055"/>
        <circle cx="22" cy="11" r="1" fill="#9900cc"/>
        <circle cx="27" cy="14" r="1" fill="#ff0055"/>
        <circle cx="17" cy="18" r="1" fill="#9900cc"/>
        <circle cx="24" cy="19" r="1" fill="#ff0055"/>
        <!-- Cat Head -->
        <rect x="26" y="10" width="16" height="14" rx="3" fill="#999999" stroke="#000" stroke-width="1.5"/>
        <!-- Ears -->
        <polygon points="27,10 31,4 33,10" fill="#999999" stroke="#000" stroke-width="1.2"/>
        <polygon points="37,10 39,4 41,10" fill="#999999" stroke="#000" stroke-width="1.2"/>
        <!-- Face -->
        <circle cx="31" cy="15" r="1.5" fill="#000"/>
        <circle cx="37" cy="15" r="1.5" fill="#000"/>
        <circle cx="34" cy="17" r="1" fill="#ff6699"/>
        <circle cx="28" cy="17" r="1.5" fill="#ff9999"/>
        <circle cx="40" cy="17" r="1.5" fill="#ff9999"/>
        <!-- Paws & Tail -->
        <rect x="6" y="14" width="5" height="3" rx="1.5" fill="#999999" stroke="#000" stroke-width="1"/>
        <rect x="14" y="25" width="4" height="4" rx="2" fill="#999999" stroke="#000" stroke-width="1"/>
        <rect x="26" y="25" width="4" height="4" rx="2" fill="#999999" stroke="#000" stroke-width="1"/>
      </svg>
    `,

    rocket: `
      <svg viewBox="0 0 36 36" class="cursor-svg rocket-svg">
        <!-- Thruster Flame -->
        <polygon points="18,34 13,24 23,24" fill="#ffbe0b" filter="drop-shadow(0 0 6px #ff007f)"/>
        <polygon points="18,30 15,24 21,24" fill="#ff007f"/>
        <!-- Rocket Body -->
        <path d="M18 2 Q27 12 24 25 L12 25 Q9 12 18 2 Z" fill="#f8fafc" stroke="#0f172a" stroke-width="1.5"/>
        <!-- Cockpit Window -->
        <circle cx="18" cy="14" r="3.5" fill="#00f2fe" stroke="#0f172a" stroke-width="1"/>
        <circle cx="17" cy="13" r="1" fill="#ffffff"/>
        <!-- Wings -->
        <path d="M12 20 L5 26 L12 25 Z" fill="#ff007f" stroke="#0f172a" stroke-width="1"/>
        <path d="M24 20 L31 26 L24 25 Z" fill="#ff007f" stroke="#0f172a" stroke-width="1"/>
        <path d="M16 2 L18 0 L20 2 Z" fill="#ff007f"/>
      </svg>
    `,

    comet: `
      <svg viewBox="0 0 36 36" class="cursor-svg comet-svg">
        <defs>
          <linearGradient id="cometTail" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="transparent"/>
            <stop offset="60%" stop-color="#00f2fe" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#ffffff"/>
          </linearGradient>
        </defs>
        <!-- Trail -->
        <polygon points="4,32 18,18 32,4 18,14 8,24" fill="url(#cometTail)"/>
        <!-- Comet Core -->
        <circle cx="28" cy="8" r="5" fill="#ffffff" filter="drop-shadow(0 0 10px #00f2fe)"/>
        <circle cx="28" cy="8" r="2.5" fill="#00f2fe"/>
      </svg>
    `
  };

  class CustomCursorController {
    constructor() {
      this.currentType = 'nyan'; // 'orb', 'nyan', 'rocket', 'comet', 'custom'
      this.customDataUrl = null;
      this.nyanRainbowIndex = 0;
      this.nyanColors = [
        [1.0, 0.0, 0.25],   // Rojo Nyan
        [1.0, 0.55, 0.0],   // Naranja
        [1.0, 0.95, 0.1],   // Amarillo
        [0.1, 0.95, 0.2],   // Verde
        [0.0, 0.75, 1.0],   // Azul Cyan
        [0.65, 0.1, 1.0]    // Púrpura Indigo
      ];

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
      } catch (e) {
        console.warn('No se pudo persistir el avatar en LocalStorage:', e);
      }
      this.setCursorType('custom');
    }

    setCursorType(type) {
      this.currentType = type;
      if (typeof AetheriaSymmetry !== 'undefined') {
        AetheriaSymmetry.updateCursorDOM();
      }
      if (typeof AetheriaSwarm !== 'undefined') {
        AetheriaSwarm.updateAvatarHTML();
      }
    }

    getAvatarHTML() {
      if (this.currentType === 'custom' && this.customDataUrl) {
        return `<img src="${this.customDataUrl}" class="cursor-custom-img" alt="Cursor"/>`;
      }
      return AVATAR_SVGS[this.currentType] || AVATAR_SVGS.orb;
    }

    getSpecialTrailColor(baseColor) {
      if (this.currentType === 'nyan') {
        const col = this.nyanColors[this.nyanRainbowIndex % this.nyanColors.length];
        this.nyanRainbowIndex++;
        return col;
      }
      if (this.currentType === 'rocket') {
        const rocketTones = [
          [1.0, 0.15, 0.0],
          [1.0, 0.65, 0.0],
          [1.0, 0.95, 0.3],
          [1.0, 0.0, 0.5]
        ];
        return rocketTones[Math.floor(Math.random() * rocketTones.length)];
      }
      return baseColor;
    }

    calculateRotation(dx, dy) {
      if (Math.hypot(dx, dy) < 0.0001) return 0;
      const angleRad = Math.atan2(-dy, dx);
      let deg = angleRad * (180 / Math.PI);

      if (this.currentType === 'nyan') {
        return deg;
      }
      if (this.currentType === 'rocket') {
        return deg + 90;
      }
      if (this.currentType === 'comet') {
        return deg + 45;
      }
      return deg;
    }

    getEmitterOffsetPoint(normX, normY, dx, dy) {
      const speed = Math.hypot(dx, dy);
      if (speed < 0.001) return { x: normX, y: normY };

      const normVx = dx / speed;
      const normVy = dy / speed;
      const offsetDistance = 0.022; // Distance from center to rear exhaust/tail

      return {
        x: normX - normVx * offsetDistance,
        y: normY - normVy * offsetDistance
      };
    }
  }

  root.AetheriaCursor = new CustomCursorController();
})(typeof window !== 'undefined' ? window : this);
