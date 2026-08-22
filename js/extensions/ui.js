/**
 * AETHERIA | UI & Interaction Controller
 * Coordinates Floating Top Navigation, Hamburger Menu Drawer, Zen Mode, Accessibility, and Tooltips.
 */

(function (root) {
  'use strict';

  class UIController {
    constructor() {
      this.app = null;
      this.activeElement = 'fluid'; // 'fluid', 'sand', 'gas'
      this.currentPaletteKey = 'biolum';
      this.colorIndex = 0;
      this.isZenMode = false;
    }

    init(app) {
      this.app = app;
      this.initDOM();
      this.bindEvents();
      this.renderPaletteGrid();
    }

    initDOM() {
      this.topBar = document.getElementById('top-bar');

      // Top Bar Elements
      this.btnHamburger = document.getElementById('btn-hamburger');
      this.currentModeBadge = document.getElementById('current-mode-badge');
      this.btnZenToggle = document.getElementById('btn-zen-toggle');
      this.btnQuickSupernova = document.getElementById('btn-quick-supernova');
      this.btnQuickVortex = document.getElementById('btn-quick-vortex');
      this.btnQuickGravity = document.getElementById('btn-quick-gravity');
      this.btnQuickClear = document.getElementById('btn-quick-clear');
      this.btnQuickExport = document.getElementById('btn-quick-export');

      // Drawer Elements
      this.settingsDrawer = document.getElementById('settings-drawer');
      this.drawerOverlay = document.getElementById('drawer-overlay');
      this.btnCloseDrawer = document.getElementById('btn-close-drawer');

      // Element Mode Buttons
      this.elementBtns = document.querySelectorAll('.mode-btn');

      // Symmetry Buttons
      this.symmetryBtns = document.querySelectorAll('.sym-btn');

      // Drawer Action Buttons
      this.btnDrawerSupernova = document.getElementById('drawer-btn-supernova');
      this.btnDrawerVortex = document.getElementById('drawer-btn-vortex');
      this.btnDrawerGravity = document.getElementById('drawer-btn-gravity');
      this.gravityStatusText = document.getElementById('gravity-status-text');
      this.btnDrawerPalette = document.getElementById('drawer-btn-palette');
      this.paletteStatusText = document.getElementById('palette-status-text');
      this.btnDrawerPause = document.getElementById('drawer-btn-pause');
      this.pauseStatusText = document.getElementById('pause-status-text');
      this.btnDrawerClear = document.getElementById('drawer-btn-clear');
      this.btnDrawerExport = document.getElementById('drawer-btn-export');

      // Sliders & Values
      this.sliderVorticity = document.getElementById('slider-vorticity');
      this.valVorticity = document.getElementById('val-vorticity');
      this.sliderDissipation = document.getElementById('slider-dissipation');
      this.valDissipation = document.getElementById('val-dissipation');
      this.sliderSplatRadius = document.getElementById('slider-splat-radius');
      this.valSplatRadius = document.getElementById('val-splat-radius');
      this.sliderGrainSize = document.getElementById('slider-grain-size');
      this.valGrainSize = document.getElementById('val-grain-size');
      this.sliderGravityForce = document.getElementById('slider-gravity-force');
      this.valGravityForce = document.getElementById('val-gravity-force');

      this.paletteSelectorGrid = document.getElementById('palette-selector-grid');
      this.toastContainer = document.getElementById('toast-container');
    }

    bindEvents() {
      const app = this.app;

      // 1. Hamburger Menu Toggle
      this.btnHamburger.addEventListener('click', () => this.toggleDrawer(true));
      this.btnCloseDrawer.addEventListener('click', () => this.toggleDrawer(false));
      this.drawerOverlay.addEventListener('click', () => this.toggleDrawer(false));

      // 2. Zen Mode Toggle (Hide / Show HUD)
      if (this.btnZenToggle) {
        this.btnZenToggle.addEventListener('click', () => this.toggleZenMode());
      }

      // 3. Element Selectors
      this.elementBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const elem = btn.dataset.element;
          this.setElement(elem);
        });
      });

      // 4. Symmetry Selectors
      this.symmetryBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const sym = parseInt(btn.dataset.symmetry, 10);
          this.setSymmetry(sym);
        });
      });

      // 5. Supernova Action
      const triggerSupernovaAction = () => {
        const col = this.getNextColor();
        AetheriaFidgets.triggerSupernova(FluidCore, col);
        this.showToast('💥 ¡Supernova detonada!');
      };
      if (this.btnQuickSupernova) this.btnQuickSupernova.addEventListener('click', triggerSupernovaAction);
      if (this.btnDrawerSupernova) this.btnDrawerSupernova.addEventListener('click', triggerSupernovaAction);

      // 6. Vortex Action
      const triggerVortexAction = () => {
        const col = this.getNextColor();
        AetheriaFidgets.triggerVortex(FluidCore, col);
        this.showToast('🌪️ ¡Vórtice inyectado!');
      };
      if (this.btnQuickVortex) this.btnQuickVortex.addEventListener('click', triggerVortexAction);
      if (this.btnDrawerVortex) this.btnDrawerVortex.addEventListener('click', triggerVortexAction);

      // 7. Gravity Toggle Action
      const toggleGravityAction = () => {
        const isGravityOn = AetheriaFidgets.toggleGravity(FluidCore);
        this.updateGravityUI(isGravityOn);
      };
      if (this.btnQuickGravity) this.btnQuickGravity.addEventListener('click', toggleGravityAction);
      if (this.btnDrawerGravity) this.btnDrawerGravity.addEventListener('click', toggleGravityAction);

      // 8. Cycle Palette
      if (this.btnDrawerPalette) {
        this.btnDrawerPalette.addEventListener('click', () => {
          const pal = this.cycleNextPalette();
          this.paletteStatusText.textContent = pal.name.split(' ')[0];
          this.updatePaletteActiveCard();
          this.showToast(`🎨 Paleta: ${pal.name}`);
        });
      }

      // 9. Pause / Freeze
      if (this.btnDrawerPause) {
        this.btnDrawerPause.addEventListener('click', () => {
          const isPaused = AetheriaFidgets.togglePause(FluidCore);
          this.pauseStatusText.textContent = isPaused ? 'Reanudar' : 'Pausar';
          this.btnDrawerPause.classList.toggle('active', isPaused);
          this.btnDrawerPause.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
          this.showToast(isPaused ? '⏸️ Tiempo congelado' : '▶️ Flujo reanudado');
        });
      }

      // 10. Clear
      const clearAction = () => {
        AetheriaFidgets.clear(FluidCore);
        this.showToast('🧹 Lienzo limpio');
      };
      if (this.btnQuickClear) this.btnQuickClear.addEventListener('click', clearAction);
      if (this.btnDrawerClear) this.btnDrawerClear.addEventListener('click', clearAction);

      // 11. Export PNG
      const exportAction = () => {
        app.exportPNG();
        this.showToast('📸 Captura de arte guardada');
      };
      if (this.btnQuickExport) this.btnQuickExport.addEventListener('click', exportAction);
      if (this.btnDrawerExport) this.btnDrawerExport.addEventListener('click', exportAction);

      // 12. Sliders
      if (this.sliderVorticity) {
        this.sliderVorticity.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.valVorticity.textContent = val;
          FluidCore.setConfig('CURL', val);
        });
      }

      if (this.sliderDissipation) {
        this.sliderDissipation.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.valDissipation.textContent = val;
          FluidCore.setConfig('DENSITY_DISSIPATION', val);
        });
      }

      if (this.sliderSplatRadius) {
        this.sliderSplatRadius.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.valSplatRadius.textContent = val;
          FluidCore.setConfig('SPLAT_RADIUS', val);
        });
      }

      if (this.sliderGrainSize) {
        this.sliderGrainSize.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.valGrainSize.textContent = `${val}px`;
          AetheriaSandMode.grainSize = val;
        });
      }

      if (this.sliderGravityForce) {
        this.sliderGravityForce.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.valGravityForce.textContent = val.toFixed(1);
          AetheriaFidgets.setGravityMagnitude(FluidCore, -val);
        });
      }

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.code === 'Space') {
          e.preventDefault();
          if (this.btnDrawerPause) this.btnDrawerPause.click();
        } else if (e.key === 'c' || e.key === 'C') {
          if (this.btnDrawerPalette) this.btnDrawerPalette.click();
        } else if (e.key === 'h' || e.key === 'H') {
          this.toggleZenMode();
        } else if (e.key === 's' || e.key === 'S') {
          triggerSupernovaAction();
        } else if (e.key === 'v' || e.key === 'V') {
          triggerVortexAction();
        } else if (e.key === 'g' || e.key === 'G') {
          toggleGravityAction();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          clearAction();
        } else if (e.key === '1') {
          this.setElement('fluid');
        } else if (e.key === '2') {
          this.setElement('sand');
        } else if (e.key === '3') {
          this.setElement('gas');
        } else if (e.key === 'm' || e.key === 'M') {
          this.toggleDrawer();
        }
      });
    }

    toggleZenMode() {
      this.isZenMode = !this.isZenMode;
      if (this.topBar) {
        this.topBar.classList.toggle('zen-hidden', this.isZenMode);
      }
      if (this.btnZenToggle) {
        this.btnZenToggle.setAttribute('aria-pressed', this.isZenMode ? 'true' : 'false');
      }
      this.showToast(this.isZenMode ? '👁️ Modo Zen (Pulsa H o toca arriba para mostrar)' : '✨ Interfaz visible');
    }

    toggleDrawer(forceState = null) {
      const isCurrentlyOpen = this.settingsDrawer.classList.contains('open');
      const shouldOpen = forceState !== null ? forceState : !isCurrentlyOpen;

      if (shouldOpen) {
        this.settingsDrawer.classList.add('open');
        this.drawerOverlay.classList.add('open');
        this.btnHamburger.setAttribute('aria-expanded', 'true');
      } else {
        this.settingsDrawer.classList.remove('open');
        this.drawerOverlay.classList.remove('open');
        this.btnHamburger.setAttribute('aria-expanded', 'false');
      }
    }

    updateGravityUI(isGravityOn) {
      if (this.btnQuickGravity) {
        this.btnQuickGravity.classList.toggle('active-gravity', isGravityOn);
        this.btnQuickGravity.setAttribute('aria-pressed', isGravityOn ? 'true' : 'false');
      }
      if (this.btnDrawerGravity) {
        this.btnDrawerGravity.classList.toggle('active', isGravityOn);
        this.btnDrawerGravity.setAttribute('aria-pressed', isGravityOn ? 'true' : 'false');
      }
      if (this.gravityStatusText) {
        this.gravityStatusText.textContent = isGravityOn ? 'ON' : 'OFF';
      }
      this.showToast(isGravityOn ? '🪐 Gravedad ACTIVA (flujo en cascada)' : '🌌 Gravedad CERO (flotación libre)');
    }

    setElement(elem) {
      this.activeElement = elem;
      this.elementBtns.forEach((b) => {
        const isActive = b.dataset.element === elem;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      // Configure Sand Particle Post-Process
      AetheriaSandMode.isEnabled = (elem === 'sand');

      // Apply Physics Profile
      if (elem === 'gas') {
        AetheriaFidgets.applyElementProfile(FluidCore, 'gas');
        this.currentModeBadge.textContent = '💨 Gas / Humo';
      } else if (elem === 'sand') {
        AetheriaFidgets.applyElementProfile(FluidCore, 'sand');
        this.currentModeBadge.textContent = '⏳ Arena Granular';
      } else {
        AetheriaFidgets.applyElementProfile(FluidCore, 'fluid');
        this.currentModeBadge.textContent = '💧 Fluido 3D';
      }

      // Sync Palettes
      const palettes = this.getPalettesForActiveElement();
      this.currentPaletteKey = Object.keys(palettes)[0];
      this.colorIndex = 0;
      this.renderPaletteGrid();

      const currPal = this.getCurrentPalette();
      if (this.paletteStatusText) {
        this.paletteStatusText.textContent = currPal.name.split(' ')[0];
      }
      this.showToast(`✨ Modo: ${this.currentModeBadge.textContent}`);
    }

    setSymmetry(sym) {
      this.symmetryBtns.forEach((b) => {
        const isActive = parseInt(b.dataset.symmetry, 10) === sym;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
      AetheriaSymmetry.setSymmetry(sym);
      this.showToast(`🪞 Simetría: ${sym}x`);
    }

    getPalettesForActiveElement() {
      const p = AetheriaPalettes;
      if (this.activeElement === 'sand') return p.sand;
      if (this.activeElement === 'gas') return p.gas;
      return p.fluid;
    }

    getCurrentPalette() {
      const palettes = this.getPalettesForActiveElement();
      return palettes[this.currentPaletteKey] || Object.values(palettes)[0];
    }

    setPalette(key) {
      const palettes = this.getPalettesForActiveElement();
      if (palettes[key]) {
        this.currentPaletteKey = key;
        this.colorIndex = 0;
      }
    }

    cycleNextPalette() {
      const palettes = this.getPalettesForActiveElement();
      const keys = Object.keys(palettes);
      const currIdx = keys.indexOf(this.currentPaletteKey);
      const nextIdx = (currIdx + 1) % keys.length;
      this.setPalette(keys[nextIdx]);
      return palettes[keys[nextIdx]];
    }

    getNextColor() {
      const pal = this.getCurrentPalette();
      const colors = pal.colors;
      const color = colors[this.colorIndex % colors.length];
      this.colorIndex++;
      return color;
    }

    getColorForAngle(angleIndex, totalAngles) {
      const pal = this.getCurrentPalette();
      const colors = pal.colors;
      const idx = (this.colorIndex + angleIndex) % colors.length;
      return colors[idx];
    }

    renderPaletteGrid() {
      if (!this.paletteSelectorGrid) return;
      this.paletteSelectorGrid.innerHTML = '';
      const palettes = this.getPalettesForActiveElement();

      for (const [key, pal] of Object.entries(palettes)) {
        const card = document.createElement('button');
        card.className = `palette-card ${key === this.currentPaletteKey ? 'active' : ''}`;
        card.dataset.key = key;
        card.setAttribute('aria-label', `Seleccionar paleta ${pal.name}`);

        const swatches = document.createElement('div');
        swatches.className = 'palette-swatches';
        for (const col of pal.colors.slice(0, 4)) {
          const s = document.createElement('div');
          s.className = 'palette-swatch';
          s.style.backgroundColor = `rgb(${Math.round(col[0] * 255)}, ${Math.round(col[1] * 255)}, ${Math.round(col[2] * 255)})`;
          swatches.appendChild(s);
        }

        const title = document.createElement('span');
        title.className = 'palette-title';
        title.textContent = pal.name;

        card.appendChild(swatches);
        card.appendChild(title);

        card.addEventListener('click', () => {
          this.setPalette(key);
          this.updatePaletteActiveCard();
          if (this.paletteStatusText) {
            this.paletteStatusText.textContent = pal.name.split(' ')[0];
          }
          this.showToast(`🎨 Paleta: ${pal.name}`);
        });

        this.paletteSelectorGrid.appendChild(card);
      }
    }

    updatePaletteActiveCard() {
      if (!this.paletteSelectorGrid) return;
      const cards = this.paletteSelectorGrid.querySelectorAll('.palette-card');
      cards.forEach((c) => c.classList.toggle('active', c.dataset.key === this.currentPaletteKey));
    }

    showToast(message) {
      if (!this.toastContainer) return;
      // Cap max simultaneous toasts
      while (this.toastContainer.childNodes.length >= 3) {
        this.toastContainer.removeChild(this.toastContainer.firstChild);
      }
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      this.toastContainer.appendChild(toast);
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 1800);
    }
  }

  root.AetheriaUI = new UIController();
})(typeof window !== 'undefined' ? window : this);
