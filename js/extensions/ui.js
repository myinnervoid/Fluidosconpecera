/**
 * AETHERIA | User Interface & Interaction Controller
 * Manages Responsive 3-Zone Top Bar, Fullscreen API, Docking Position,
 * Drawer Navigation, Thematic Avatars, Adaptive Backgrounds, and Fidgets.
 * License: MIT
 */

(function (root) {
  'use strict';

  /**
   * Estados canónicos del Autómata Finito de Interfaz (Global Law 6).
   */
  const UIStates = Object.freeze({
    IDLE: 'IDLE',
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    EMPTY: 'EMPTY',
    FAULT: 'FAULT'
  });

  /**
   * Autómata Finito de UI que orquesta subsistemas interactivos.
   */
  class UIStateMachine {
    constructor(uiController) {
      this.ui = uiController;
      this.currentState = UIStates.IDLE;
      this.subsystemStates = {
        background: UIStates.IDLE,
        recorder: UIStates.IDLE,
        exporter: UIStates.IDLE,
        avatar: UIStates.IDLE
      };
      this.listeners = [];
    }

    getState(subsystem = null) {
      return subsystem ? (this.subsystemStates[subsystem] || UIStates.IDLE) : this.currentState;
    }

    transition(subsystem, newState, details = {}) {
      const validStates = Object.values(UIStates);
      if (!validStates.includes(newState)) {
        console.warn(`[UIStateMachine] Intento de transición a estado inválido: ${newState}`);
        return false;
      }

      const prev = this.subsystemStates[subsystem] || this.currentState;
      this.subsystemStates[subsystem] = newState;
      this.currentState = newState;

      for (let i = 0; i < this.listeners.length; i++) {
        try {
          this.listeners[i]({ subsystem, prevState: prev, newState, details });
        } catch (e) {
          console.error('[UIStateMachine] Error en listener:', e);
        }
      }

      if (newState === UIStates.FAULT && details.message) {
        this.ui.showToast(`⚠️ [${details.errorCode || 'FAULT'}]: ${details.message}`);
      } else if (newState === UIStates.SUCCESS && details.message) {
        this.ui.showToast(details.message);
      }
      return true;
    }

    subscribe(listener) {
      this.listeners.push(listener);
      return () => {
        this.listeners = this.listeners.filter((l) => l !== listener);
      };
    }
  }

  class UIController {
    constructor() {
      this.app = null;
      this.activeElement = 'fluid';
      this.currentPaletteKey = 'aurora';
      this.colorIndex = 0;
      this.isZenMode = false;
      this.stateMachine = new UIStateMachine(this);
      this.avatarList = [
        { id: 'none', label: 'Sin puntero', icon: '🚫', badge: 'Solo fluido' },
        { id: 'nyan', label: 'Nyan Cat', icon: '🐱', badge: 'Arcoíris pixel' },
        { id: 'rocket', label: 'Cohete', icon: '🚀', badge: 'Tobera fuego' },
        { id: 'comet', label: 'Cometa', icon: '☄️', badge: 'Plasma cósmico' },
        { id: 'clownfish', label: 'Pez Nemo', icon: '🐠', badge: 'Burbujas' },
        { id: 'miku', label: 'Hatsune Miku', icon: '🩵', badge: 'Neón techno' },
        { id: 'custom', label: 'Personalizado', icon: '📁', badge: 'Estrellas oro' }
      ];
    }

    init(app) {
      this.app = app;
      this.initDOM();
      this.restorePreferences();
      this.bindEvents();
      this.renderPaletteGrid();
      this.syncBackgroundButtons();

      // Asegurar que el modo por defecto sea FLUIDO, no arena
      this.setElement('fluid');

      // [MEJORA] Sincronizar el estado del swarm en el drawer al iniciar
      if (typeof AetheriaSwarm !== 'undefined') {
        this.updateSwarmUI(AetheriaSwarm.isEnabled);
      }
    }

    initDOM() {
      // Top Bar Elements
      this.topBar = document.getElementById('top-bar');
      this.btnHamburger = document.getElementById('btn-hamburger');
      this.btnZenToggle = document.getElementById('btn-zen-toggle');
      this.btnFullscreenToggle = document.getElementById('btn-fullscreen-toggle');
      this.fullscreenIcon = document.getElementById('fullscreen-icon');
      this.btnBarPositionToggle = document.getElementById('btn-bar-position-toggle');
      this.currentModeBadge = document.getElementById('current-mode-badge');
      this.brandCapsuleBtn = document.getElementById('brand-capsule-btn');

      // Fidget Quick Buttons
      this.btnQuickSupernova = document.getElementById('btn-quick-supernova');
      this.btnQuickVortex = document.getElementById('btn-quick-vortex');
      this.btnQuickGravity = document.getElementById('btn-quick-gravity');
      this.btnQuickSwarm = document.getElementById('btn-quick-swarm');
      this.btnQuickClear = document.getElementById('btn-quick-clear');

      // Drawer Elements
      this.settingsDrawer = document.getElementById('settings-drawer');
      this.drawerOverlay = document.getElementById('drawer-overlay');
      this.btnCloseDrawer = document.getElementById('btn-close-drawer');
      this.btnCollapseAll = document.getElementById('btn-collapse-all');
      this.btnExpandAll = document.getElementById('btn-expand-all');

      // Element Mode Buttons
      this.elementBtns = document.querySelectorAll('.mode-btn');

      // Avatar Cursor Buttons
      this.avatarBtns = document.querySelectorAll('.avatar-btn');
      this.customAvatarInput = document.getElementById('custom-avatar-input');
      this.btnUploadAvatar = document.getElementById('btn-upload-avatar');

      // Background Buttons
      this.bgBtns = document.querySelectorAll('.bg-btn');

      // Swarm Auto-pilot Elements
      this.btnDrawerSwarm = document.getElementById('drawer-btn-swarm');
      this.swarmStatusText = document.getElementById('swarm-status-text');

      // [MEJORA] Botón toggle del swarm en el drawer
      this.drawerSwarmToggle = document.getElementById('drawer-swarm-toggle');

      // Symmetry Buttons
      this.symmetryBtns = document.querySelectorAll('.sym-btn');

      // Drawer Action Buttons
      this.btnDrawerSupernova = document.getElementById('drawer-btn-supernova');
      this.btnDrawerVortex = document.getElementById('drawer-btn-vortex');
      this.btnDrawerTsunami = document.getElementById('drawer-btn-tsunami');
      this.btnDrawerRain = document.getElementById('drawer-btn-rain');
      this.btnDrawerGravity = document.getElementById('drawer-btn-gravity');
      this.gravityStatusText = document.getElementById('gravity-status-text');
      this.btnDrawerPalette = document.getElementById('drawer-btn-palette');
      this.paletteStatusText = document.getElementById('palette-status-text');
      this.btnDrawerPause = document.getElementById('drawer-btn-pause');
      this.pauseStatusText = document.getElementById('pause-status-text');
      this.btnDrawerClear = document.getElementById('drawer-btn-clear');
      this.btnDrawerRecord = document.getElementById('drawer-btn-record');
      this.recordBtnText = document.getElementById('record-btn-text');
      this.btnDrawerExport = document.getElementById('drawer-btn-export');
      this.boidPresetBtns = document.querySelectorAll('.boid-preset-btn');

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

      this.sliderBoidsCount = document.getElementById('slider-boids-count');
      this.valBoidsCount = document.getElementById('val-boids-count');
      this.boidslimitBadge = document.getElementById('boids-limit-badge');
      this.toggleDevMode = document.getElementById('toggle-dev-mode');
      this.devWarningText = document.getElementById('dev-warning-text');

      this.paletteSelectorGrid = document.getElementById('palette-selector-grid');
      this.toastContainer = document.getElementById('toast-container');
    }

    restorePreferences() {
      // 1. Restaurar posición de la barra
      if (typeof AetheriaState !== 'undefined') {
        const isBottom = AetheriaState.barPosition === 'bottom';
        if (this.topBar) {
          this.topBar.classList.toggle('pos-bottom', isBottom);
        }

        // 2. Restaurar modo Desarrollador
        if (this.toggleDevMode) {
          this.toggleDevMode.checked = AetheriaState.devMode;
          this.applyDevModeUI(AetheriaState.devMode, false);
        }
      }
    }

    bindEvents() {
      const app = this.app;

      // 1. Hamburger Menu Toggle & Backdrop
      if (this.btnHamburger) {
        this.btnHamburger.addEventListener('click', () => this.toggleDrawer());
      }
      if (this.btnCloseDrawer) {
        this.btnCloseDrawer.addEventListener('click', () => this.toggleDrawer(false));
      }
      if (this.drawerOverlay) {
        this.drawerOverlay.addEventListener('click', () => this.toggleDrawer(false));
      }

      // Quick Fidget Buttons (Barra Superior)
      const getQuickCursorPos = () => {
        const canvas = document.getElementById('gl-canvas');
        if (canvas && window._lastPointerEvent) {
          const rect = canvas.getBoundingClientRect();
          const pe = window._lastPointerEvent;
          return {
            x: Math.max(0, Math.min(1, (pe.clientX - rect.left) / rect.width)),
            y: Math.max(0, Math.min(1, 1.0 - (pe.clientY - rect.top) / rect.height))
          };
        }
        return { x: 0.5, y: 0.5 };
      };

      if (this.btnQuickSupernova) {
        this.btnQuickSupernova.addEventListener('click', () => {
          const pos = getQuickCursorPos();
          if (typeof AetheriaFidgets !== 'undefined') {
            AetheriaFidgets.supernova(pos.x, pos.y);
          }
          this.flashButton(this.btnQuickSupernova, 'supernova-flash', 300);
          this.showToast('💥 ¡Supernova detonada!');
        });
      }

      if (this.btnQuickVortex) {
        this.btnQuickVortex.addEventListener('click', () => {
          const pos = getQuickCursorPos();
          if (typeof AetheriaFidgets !== 'undefined') {
            AetheriaFidgets.vortex(pos.x, pos.y);
          }
          this.flashButton(this.btnQuickVortex, 'vortex-flash', 300);
          this.showToast('🌪️ ¡Vórtice inyectado!');
        });
      }

      if (this.btnQuickGravity) {
        this.btnQuickGravity.addEventListener('click', () => {
          if (typeof AetheriaFidgets !== 'undefined') {
            const isOn = AetheriaFidgets.toggleGravity();
            this.updateGravityUI(isOn);
          }
        });
      }

      // 2. Fullscreen API Toggle
      if (this.btnFullscreenToggle) {
        this.btnFullscreenToggle.addEventListener('click', () => this.toggleFullscreen());
      }

      const onFsChange = () => {
        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (typeof AetheriaState !== 'undefined') {
          AetheriaState.isFullscreen = isFs;
        }
        if (this.btnFullscreenToggle) {
          this.btnFullscreenToggle.classList.toggle('active', isFs);
          this.btnFullscreenToggle.setAttribute('aria-pressed', isFs ? 'true' : 'false');
        }
        if (this.fullscreenIcon) {
          this.fullscreenIcon.textContent = isFs ? '✖' : '⛶';
        }
      };

      document.addEventListener('fullscreenchange', onFsChange);
      document.addEventListener('webkitfullscreenchange', onFsChange);
      document.addEventListener('mozfullscreenchange', onFsChange);
      document.addEventListener('MSFullscreenChange', onFsChange);

      // 3. Bar Position Toggle (Top / Bottom)
      if (this.btnBarPositionToggle) {
        this.btnBarPositionToggle.addEventListener('click', () => {
          if (typeof AetheriaState !== 'undefined') {
            const newPos = AetheriaState.barPosition === 'top' ? 'bottom' : 'top';
            AetheriaState.setBarPosition(newPos);
            this.topBar.classList.toggle('pos-bottom', newPos === 'bottom');
            this.showToast(newPos === 'bottom' ? '⬇️ Barra anclada abajo' : '⬆️ Barra anclada arriba');
          }
        });
      }

      // 4. Zen Mode Toggle
      if (this.btnZenToggle) {
        this.btnZenToggle.addEventListener('click', () => this.toggleZenMode());
      }

      // 5. Brand Capsule Click (Abre el Drawer de Ajustes)
      if (this.brandCapsuleBtn) {
        this.brandCapsuleBtn.addEventListener('click', () => this.toggleDrawer(true));
      }

      // 5.1 Collapse / Expand All Accordions
      if (this.btnCollapseAll) {
        this.btnCollapseAll.addEventListener('click', () => {
          const accs = document.querySelectorAll('.drawer-accordion');
          accs.forEach((a) => { a.open = false; });
          this.showToast('⊟ Secciones colapsadas');
        });
      }

      if (this.btnExpandAll) {
        this.btnExpandAll.addEventListener('click', () => {
          const accs = document.querySelectorAll('.drawer-accordion');
          accs.forEach((a) => { a.open = true; });
          this.showToast('⊞ Secciones expandidas');
        });
      }

      // 6. Element Selectors
      this.elementBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const elem = btn.dataset.element;
          this.setElement(elem);
        });
      });

      // 7. Avatar Cursor Selectors
      this.avatarBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.avatar;
          this.setAvatarType(type);
        });
      });

      // Upload Custom Avatar Image
      if (this.btnUploadAvatar && this.customAvatarInput) {
        this.btnUploadAvatar.addEventListener('click', () => {
          this.customAvatarInput.click();
        });

        this.customAvatarInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            if (!file.type || !file.type.startsWith('image/')) {
              this.stateMachine.transition('avatar', UIStates.FAULT, {
                errorCode: 'ERR_INVALID_FILE_TYPE',
                message: 'El archivo debe ser una imagen válida (PNG, GIF, JPEG, WEBP).'
              });
              return;
            }
            if (file.size > 3 * 1024 * 1024) {
              this.stateMachine.transition('avatar', UIStates.FAULT, {
                errorCode: 'ERR_FILE_TOO_LARGE',
                message: 'La imagen excede el límite de 3MB.'
              });
              return;
            }
            this.stateMachine.transition('avatar', UIStates.PENDING, { message: 'Cargando avatar personalizado...' });
            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataUrl = ev.target.result;
              if (typeof AetheriaCursor !== 'undefined') {
                AetheriaCursor.saveCustomAvatar(dataUrl);
              }
              this.setAvatarType('custom');
              this.stateMachine.transition('avatar', UIStates.SUCCESS, { message: '✨ Avatar personalizado guardado en local' });
            };
            reader.onerror = () => {
              this.stateMachine.transition('avatar', UIStates.FAULT, {
                errorCode: 'ERR_IMAGE_LOAD_FAILED',
                message: 'Fallo al leer archivo de imagen local.'
              });
            };
            reader.readAsDataURL(file);
          }
        });
      }

      // 8. Background Selectors
      this.bgBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const bg = btn.dataset.bg;
          this.setBackground(bg);
        });
      });

      // 9. Swarm Auto-Pilot Bindings (Barra superior y Drawer)
      const toggleSwarmAction = () => {
        const isSwarmOn = AetheriaSwarm.toggle();
        this.updateSwarmUI(isSwarmOn);
        this.showToast(isSwarmOn ? '🐟 Auto-Piloto Boids Swarm ACTIVO' : '🛑 Auto-Piloto Swarm Desactivado');
      };

      if (this.btnQuickSwarm) this.btnQuickSwarm.addEventListener('click', toggleSwarmAction);
      if (this.btnDrawerSwarm) this.btnDrawerSwarm.addEventListener('click', toggleSwarmAction);

      // [MEJORA] Listener para el botón toggle del drawer
      if (this.drawerSwarmToggle) {
        this.drawerSwarmToggle.addEventListener('click', toggleSwarmAction);
      }

      // 10. Symmetry Selectors
      this.symmetryBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const sym = parseInt(btn.dataset.symmetry, 10);
          this.setSymmetry(sym);
        });
      });

      // 11. Action Buttons Setup (Subgrupos de Fidgets & Estudio)
      this.setupActionButtons();

      // 14. Cycle Palette Action
      if (this.btnDrawerPalette) {
        this.btnDrawerPalette.addEventListener('click', () => {
          const nextPal = this.cycleNextPalette();
          this.updatePaletteActiveCard();
          if (this.paletteStatusText) {
            this.paletteStatusText.textContent = nextPal.name.split(' ')[1] || nextPal.name;
          }
          this.showToast(`🎨 Paleta: ${nextPal.name}`);
        });
      }

      // 15. Pause / Resume Simulation
      if (this.btnDrawerPause) {
        this.btnDrawerPause.addEventListener('click', () => {
          const isPaused = AetheriaFidgets.togglePause(FluidCore);
          this.btnDrawerPause.classList.toggle('active', isPaused);
          this.btnDrawerPause.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
          if (this.pauseStatusText) {
            this.pauseStatusText.textContent = isPaused ? 'Reanudar' : 'Pausar';
          }
          this.showToast(isPaused ? '⏸️ Simulación pausada' : '▶️ Simulación reanudada');
        });
      }

      // 16. Clear Canvas Action
      const clearAction = () => {
        AetheriaFidgets.clearCanvas(FluidCore, AetheriaParticles);
        this.showToast('🧹 Lienzo limpio');
      };
      if (this.btnQuickClear) this.btnQuickClear.addEventListener('click', clearAction);
      if (this.btnDrawerClear) this.btnDrawerClear.addEventListener('click', clearAction);

      // 17.1 Native Canvas Recorder
      if (this.btnDrawerRecord) {
        this.btnDrawerRecord.addEventListener('click', () => {
          if (typeof AetheriaRecorder !== 'undefined') {
            if (AetheriaRecorder.isRecording) {
              const res = AetheriaRecorder.stopRecording();
              if (res && res.success) {
                this.stateMachine.transition('recorder', UIStates.SUCCESS, { message: '⏹️ Grabación finalizada y descargando...' });
              } else {
                this.stateMachine.transition('recorder', UIStates.FAULT, { errorCode: (res && res.error_code) || 'ERR_RECORDER_FAILED', message: (res && res.message) || 'Error al detener grabación.' });
              }
            } else {
              this.toggleDrawer(false);
              const res = AetheriaRecorder.startRecording(0, true);
              if (res && res.success) {
                this.stateMachine.transition('recorder', UIStates.PENDING, { message: '⏺️ Grabando Canvas (Usa el botón flotante para detener)' });
              } else {
                this.stateMachine.transition('recorder', UIStates.FAULT, { errorCode: (res && res.error_code) || 'ERR_RECORDER_FAILED', message: (res && res.message) || 'Error al iniciar grabación.' });
              }
            }
          }
        });
      }

      // 17.2 Boids Count Preset Buttons (1, 2, 4, 6, 8)
      if (this.boidPresetBtns) {
        this.boidPresetBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.boids, 10);
            if (this.sliderBoidsCount) {
              this.sliderBoidsCount.value = count;
            }
            if (this.valBoidsCount) {
              this.valBoidsCount.textContent = count;
            }
            if (typeof AetheriaState !== 'undefined') {
              AetheriaState.swarmCount = count;
            }
            if (typeof AetheriaSwarm !== 'undefined') {
              AetheriaSwarm.setBoidsCount(count);
            }
            this.showToast(`🐟 ${count} Boid${count > 1 ? 's' : ''} activo${count > 1 ? 's' : ''}`);
          });
        });
      }

      // 17.3 Export High-Res PNG
      if (this.btnDrawerExport) {
        this.btnDrawerExport.addEventListener('click', async () => {
          this.stateMachine.transition('exporter', UIStates.PENDING, { message: '📸 Procesando captura PNG...' });
          if (this.app && this.app.exportPNG) {
            const res = await this.app.exportPNG();
            if (res && res.success) {
              this.stateMachine.transition('exporter', UIStates.SUCCESS, { message: `📸 ${res.message}` });
            } else {
              this.stateMachine.transition('exporter', UIStates.FAULT, { errorCode: (res && res.error_code) || 'ERR_CANVAS_CAPTURE_FAILED', message: (res && res.message) || 'Error al exportar PNG.' });
            }
          }
        });
      }

      // 18. Physical Parameters Sliders
      if (this.sliderVorticity) {
        this.sliderVorticity.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          if (this.valVorticity) this.valVorticity.textContent = val;
          FluidCore.config.CURL = val;
        });
      }

      if (this.sliderDissipation) {
        this.sliderDissipation.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          if (this.valDissipation) this.valDissipation.textContent = val.toFixed(2);
          FluidCore.config.DENSITY_DISSIPATION = val;
        });
      }

      if (this.sliderSplatRadius) {
        this.sliderSplatRadius.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          if (this.valSplatRadius) this.valSplatRadius.textContent = val.toFixed(2);
          FluidCore.config.SPLAT_RADIUS = val;
        });
      }

      if (this.sliderGrainSize) {
        this.sliderGrainSize.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          if (this.valGrainSize) this.valGrainSize.textContent = `${val}px`;
          if (typeof AetheriaSandMode !== 'undefined') {
            AetheriaSandMode.setGrainSize(val);
          }
        });
      }

      if (this.sliderGravityForce) {
        this.sliderGravityForce.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          if (this.valGravityForce) this.valGravityForce.textContent = val.toFixed(1);
          if (typeof AetheriaFidgets !== 'undefined') {
            AetheriaFidgets.setGravityMagnitude(val);
          }
        });
      }

      // 19. Boids Count Input & Dev Mode
      if (this.sliderBoidsCount) {
        this.sliderBoidsCount.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          if (this.valBoidsCount) this.valBoidsCount.textContent = val;
          if (typeof AetheriaState !== 'undefined') {
            AetheriaState.swarmCount = val;
          }
          if (typeof AetheriaSwarm !== 'undefined') {
            AetheriaSwarm.setBoidsCount(val);
          }
        });
      }

      if (this.toggleDevMode) {
        this.toggleDevMode.addEventListener('change', (e) => {
          const isDev = e.target.checked;
          if (typeof AetheriaState !== 'undefined') {
            AetheriaState.setDevMode(isDev);
          }
          this.applyDevModeUI(isDev, true);
        });
      }

      // 20. Keyboard Shortcuts Map
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const f = window.AetheriaFidgets;
        const getCursorPos = () => {
          const canvas = document.getElementById('gl-canvas');
          if (canvas && window._lastPointerEvent) {
            const rect = canvas.getBoundingClientRect();
            const pe = window._lastPointerEvent;
            return {
              x: Math.max(0, Math.min(1, (pe.clientX - rect.left) / rect.width)),
              y: Math.max(0, Math.min(1, 1.0 - (pe.clientY - rect.top) / rect.height))
            };
          }
          return { x: 0.5, y: 0.5 };
        };

        switch (e.key.toLowerCase()) {
          case '1': this.setElement('fluid'); break;
          case '2': this.setElement('lava'); break;
          case '3': this.setElement('sand'); break;
          case '4': this.setElement('gas'); break;
          case 'f': this.toggleFullscreen(); break;
          case 'h': this.toggleZenMode(); break;
          case 'm': this.toggleDrawer(); break;
          case 'a': toggleSwarmAction(); break;
          case 's': {
            e.preventDefault();
            const pos = getCursorPos();
            if (f) f.supernova(pos.x, pos.y);
            this.showToast('💥 ¡Supernova detonada!');
            const btn = document.querySelector('[data-action="supernova"]');
            if (btn) this.flashButton(btn, 'supernova-flash', 300);
            break;
          }
          case 'v': {
            e.preventDefault();
            const pos = getCursorPos();
            if (f) f.vortex(pos.x, pos.y);
            this.showToast('🌪️ ¡Vórtice inyectado!');
            const btn = document.querySelector('[data-action="vortex"]');
            if (btn) this.flashButton(btn, 'vortex-flash', 300);
            break;
          }
          case 't': {
            e.preventDefault();
            if (f) f.tsunami();
            this.showToast('🌊 ¡Tsunami activado!');
            break;
          }
          case 'l': {
            e.preventDefault();
            if (f) f.meteorRain();
            this.showToast('🌧️ ¡Lluvia cósmica activa!');
            break;
          }
          case 'g': {
            e.preventDefault();
            if (f) {
              const isOn = f.toggleGravity();
              const btn = document.querySelector('[data-action="gravity"]');
              if (btn) {
                btn.classList.toggle('active', isOn);
                btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
              }
              this.showToast(isOn ? '🪐 Gravedad: Activada' : '🪐 Gravedad: Desactivada');
            }
            break;
          }
          case 'p': {
            e.preventDefault();
            if (f) f.toggleRecording();
            break;
          }
          case 'r': {
            e.preventDefault();
            this.exportSnapshot();
            break;
          }
          case 'c': {
            const pal = this.cycleNextPalette();
            this.updatePaletteActiveCard();
            if (this.paletteStatusText) {
              this.paletteStatusText.textContent = pal.name.split(' ')[1] || pal.name;
            }
            this.showToast(`🎨 Paleta: ${pal.name}`);
            break;
          }
          case 'escape':
            if (this.settingsDrawer && this.settingsDrawer.classList.contains('open')) {
              this.toggleDrawer(false);
            }
            break;
          case ' ': {
            e.preventDefault();
            if (f) {
              const paused = f.togglePause();
              const btn = document.querySelector('[data-action="pause"]');
              if (btn) {
                btn.classList.toggle('active', paused);
                btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
              }
              const pauseLabel = document.getElementById('pause-label');
              if (pauseLabel) {
                pauseLabel.textContent = paused ? 'Reanudar' : 'Pausar';
              }
              this.showToast(paused ? '⏸️ Simulación pausada' : '▶️ Simulación reanudada');
            }
            break;
          }
          case 'delete':
          case 'backspace':
          case 'd': {
            if (f) f.clearFluid();
            if (typeof AetheriaParticles !== 'undefined' && typeof AetheriaParticles.reset === 'function') {
              AetheriaParticles.reset();
            }
            this.showToast('🧹 Lienzo purgado');
            break;
          }
        }
      });
    }

    setupActionButtons() {
      const container = document.getElementById('action-grid-container');
      if (!container) return;

      container.querySelectorAll('.action-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          const f = window.AetheriaFidgets;
          if (!f) return;

          // Obtener posición del cursor desde evento reciente (o centro)
          const getPos = () => {
            const canvas = document.getElementById('gl-canvas');
            if (canvas && window._lastPointerEvent) {
              const rect = canvas.getBoundingClientRect();
              const pe = window._lastPointerEvent;
              return {
                x: Math.max(0, Math.min(1, (pe.clientX - rect.left) / rect.width)),
                y: Math.max(0, Math.min(1, 1.0 - (pe.clientY - rect.top) / rect.height))
              };
            }
            return { x: 0.5, y: 0.5 };
          };

          let pos;
          switch (action) {
            case 'supernova':
              pos = getPos();
              f.supernova(pos.x, pos.y);
              this.flashButton(btn, 'supernova-flash', 300);
              this.showToast('💥 ¡Supernova detonada!');
              break;
            case 'vortex':
              pos = getPos();
              f.vortex(pos.x, pos.y);
              this.flashButton(btn, 'vortex-flash', 300);
              this.showToast('🌪️ ¡Vórtice inyectado!');
              break;
            case 'tsunami':
              f.tsunami();
              this.showToast('🌊 ¡Tsunami activado!');
              break;
            case 'meteor':
              f.meteorRain();
              this.showToast('🌧️ ¡Lluvia cósmica activa!');
              break;
            case 'gravity': {
              const isOn = f.toggleGravity();
              btn.classList.toggle('active', isOn);
              btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
              this.showToast(isOn ? '🪐 Gravedad: Activada' : '🪐 Gravedad: Desactivada');
              break;
            }
            case 'pause': {
              const isPaused = f.togglePause();
              btn.classList.toggle('active', isPaused);
              btn.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
              const pauseLabel = document.getElementById('pause-label');
              if (pauseLabel) {
                pauseLabel.textContent = isPaused ? 'Reanudar' : 'Pausar';
              }
              this.showToast(isPaused ? '⏸️ Simulación pausada' : '▶️ Simulación reanudada');
              break;
            }
            case 'clear':
              f.clearFluid();
              if (typeof AetheriaParticles !== 'undefined' && typeof AetheriaParticles.reset === 'function') {
                AetheriaParticles.reset();
              }
              this.showToast('🧹 Lienzo purgado');
              break;
            case 'screenshot':
              this.exportSnapshot();
              this.showToast('📸 Captura guardada');
              break;
            case 'record':
              f.toggleRecording();
              break;
            default:
              break;
          }
        });
      });
    }

    flashButton(btn, className, duration = 300) {
      if (!btn) return;
      btn.classList.add(className);
      setTimeout(() => btn.classList.remove(className), duration);
    }

    updateRecordingUI(isActive, timerText = '00:00') {
      const btn = document.querySelector('[data-action="record"]');
      const label = document.getElementById('record-label');
      const timer = document.getElementById('record-timer');
      if (!btn) return;
      if (isActive) {
        btn.classList.add('recording-active');
        if (label) label.textContent = 'Detener';
        if (timer) {
          timer.style.display = 'inline';
          timer.textContent = timerText;
        }
      } else {
        btn.classList.remove('recording-active');
        if (label) label.textContent = 'Grabar';
        if (timer) {
          timer.style.display = 'none';
        }
      }
    }

    async exportSnapshot() {
      this.stateMachine.transition('exporter', UIStates.PENDING, { message: '📸 Procesando captura PNG...' });
      if (this.app && this.app.exportPNG) {
        const res = await this.app.exportPNG();
        if (res && res.success) {
          this.stateMachine.transition('exporter', UIStates.SUCCESS, { message: `📸 ${res.message}` });
        } else {
          this.stateMachine.transition('exporter', UIStates.FAULT, { errorCode: (res && res.error_code) || 'ERR_CANVAS_CAPTURE_FAILED', message: (res && res.message) || 'Error al exportar PNG.' });
        }
      }
    }

    toggleFullscreen() {
      const doc = document;
      const docEl = document.documentElement;
      const isFs = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

      if (!isFs) {
        if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
        else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
        else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen();
        else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
        this.showToast('⛶ Pantalla Completa Activada');
      } else {
        if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
        else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
        else if (doc.msExitFullscreen) doc.msExitFullscreen();
        this.showToast('⛶ Pantalla Completa Desactivada');
      }
    }

    applyDevModeUI(isDev, showToastMsg = true) {
      if (!this.sliderBoidsCount) return;
      if (isDev) {
        this.sliderBoidsCount.max = 50;
        if (this.boidslimitBadge) {
          this.boidslimitBadge.textContent = 'dev: máx. 50';
          this.boidslimitBadge.style.color = 'var(--accent-magenta)';
        }
        if (this.devWarningText) this.devWarningText.style.display = 'block';
        if (showToastMsg) this.showToast('🛠️ Modo Dev: Boids desbloqueados hasta 50');
      } else {
        this.sliderBoidsCount.max = 10;
        if (parseInt(this.sliderBoidsCount.value, 10) > 10) {
          this.sliderBoidsCount.value = 10;
          this.valBoidsCount.textContent = 10;
          if (typeof AetheriaSwarm !== 'undefined') AetheriaSwarm.setBoidsCount(10);
        }
        if (this.boidslimitBadge) {
          this.boidslimitBadge.textContent = 'máx. 10';
          this.boidslimitBadge.style.color = 'var(--accent-cyan)';
        }
        if (this.devWarningText) this.devWarningText.style.display = 'none';
        if (showToastMsg) this.showToast('🔒 Modo Normal: Límite 10 boids');
      }
    }

    // [MEJORA] Método para actualizar la UI del swarm en barra y drawer
    updateSwarmUI(isOn) {
      // Botón de la barra superior
      if (this.btnQuickSwarm) {
        this.btnQuickSwarm.classList.toggle('active-swarm', isOn);
        this.btnQuickSwarm.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      }
      // Botón del drawer (si existe)
      if (this.drawerSwarmToggle) {
        this.drawerSwarmToggle.textContent = isOn ? 'Desactivar' : 'Activar';
        this.drawerSwarmToggle.style.borderColor = isOn ? 'var(--accent-cyan)' : 'transparent';
        this.drawerSwarmToggle.style.backgroundColor = isOn ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.08)';
      }
      // Texto de estado (si existe)
      if (this.swarmStatusText) {
        this.swarmStatusText.textContent = isOn ? 'ON' : 'OFF';
      }
      // Guardar en estado global
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.isSwarmActive = isOn;
      }
    }

    toggleDrawer(forceState = null) {
      const isOpen = forceState !== null ? forceState : !this.settingsDrawer.classList.contains('open');
      this.settingsDrawer.classList.toggle('open', isOpen);
      this.drawerOverlay.classList.toggle('open', isOpen);
      this.settingsDrawer.setAttribute('aria-hidden', (!isOpen).toString());
      this.btnHamburger.setAttribute('aria-expanded', isOpen.toString());
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.isDrawerOpen = isOpen;
      }
    }

    toggleZenMode() {
      this.isZenMode = !this.isZenMode;
      this.topBar.classList.toggle('zen-hidden', this.isZenMode);
      if (this.settingsDrawer.classList.contains('open')) {
        this.toggleDrawer(false);
      }
      this.showToast(this.isZenMode ? '👁️ Modo Zen ACTIVO (Pulsa [H] para salir)' : '👁️ Interfaz visible');
    }

    selectAvatar(type, silent = false) {
      this.setAvatarType(type, silent);
    }

    setAvatarType(type, silent = false) {
      const resolvedType = (type === 'fish') ? 'clownfish' : type;
      this.avatarBtns.forEach((b) => {
        const btnType = b.dataset.avatar;
        const isActive = (btnType === resolvedType || (btnType === 'clownfish' && resolvedType === 'fish'));
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      if (typeof AetheriaCursor !== 'undefined') {
        AetheriaCursor.setAvatar(resolvedType);
      }
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.setUserAvatar(resolvedType);
      }
      if (!silent) {
        const avatarName = (typeof AetheriaCursor !== 'undefined' && AetheriaCursor.avatarConfig && AetheriaCursor.avatarConfig[resolvedType])
          ? AetheriaCursor.avatarConfig[resolvedType].name
          : resolvedType.toUpperCase();
        this.showToast(`✨ Puntero: ${avatarName}`);
      }
    }

    async setBackground(bgName) {
      this.stateMachine.transition('background', UIStates.PENDING, { background: bgName });
      if (typeof AetheriaBackground !== 'undefined') {
        const res = await AetheriaBackground.setBackground(bgName);
        this.syncBackgroundButtons();
        if (res && res.success) {
          const bgInfo = (AetheriaBackground.backgrounds[bgName]) ? AetheriaBackground.backgrounds[bgName].name : bgName;
          this.stateMachine.transition('background', UIStates.SUCCESS, { message: `🖼️ Fondo: ${bgInfo}` });
        } else {
          const errCode = (res && res.error_code) || 'ERR_IMAGE_LOAD_FAILED';
          const errMsg = (res && res.message) || 'Error al cargar fondo';
          this.stateMachine.transition('background', UIStates.FAULT, { errorCode: errCode, message: errMsg });
        }
        return res;
      }
    }

    syncBackgroundButtons() {
      const activeBg = (typeof AetheriaBackground !== 'undefined') ? AetheriaBackground.getCurrentBackground() : 'universe';
      this.bgBtns.forEach((b) => {
        const isActive = b.dataset.bg === activeBg;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
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
      } else if (elem === 'lava') {
        AetheriaFidgets.applyElementProfile(FluidCore, 'lava');
        this.currentModeBadge.textContent = '🔴 Lava Lamp';
      } else {
        AetheriaFidgets.applyElementProfile(FluidCore, 'fluid');
        this.currentModeBadge.textContent = '💧 Fluido 3D';
      }

      // Sync Slider UI to reflect new physics profile
      if (typeof FluidCore !== 'undefined' && FluidCore.config) {
        if (this.sliderVorticity) {
          this.sliderVorticity.value = FluidCore.config.CURL;
          if (this.valVorticity) this.valVorticity.textContent = FluidCore.config.CURL;
        }
        if (this.sliderDissipation) {
          this.sliderDissipation.value = FluidCore.config.DENSITY_DISSIPATION;
          if (this.valDissipation) this.valDissipation.textContent = FluidCore.config.DENSITY_DISSIPATION.toFixed(2);
        }
        if (this.sliderSplatRadius) {
          this.sliderSplatRadius.value = FluidCore.config.SPLAT_RADIUS;
          if (this.valSplatRadius) this.valSplatRadius.textContent = FluidCore.config.SPLAT_RADIUS.toFixed(2);
        }
      }

      // Sync Palettes & Global State
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.setElement(elem);
      }
      const palettes = this.getPalettesForActiveElement();
      this.currentPaletteKey = Object.keys(palettes)[0];
      this.colorIndex = 0;
      this.renderPaletteGrid();

      const currPal = this.getCurrentPalette();
      if (this.paletteStatusText) {
        this.paletteStatusText.textContent = currPal.name.split(' ')[1] || currPal.name;
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
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.setSymmetry(sym);
      }
      this.showToast(`🪞 Simetría: ${sym}x`);
    }

    getPalettesForActiveElement() {
      const p = AetheriaPalettes;
      if (this.activeElement === 'sand') return p.sand;
      if (this.activeElement === 'gas') return p.gas;
      if (this.activeElement === 'lava') return p.lava;
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
        if (typeof AetheriaState !== 'undefined') {
          AetheriaState.setPalette(key);
        }
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
            this.paletteStatusText.textContent = pal.name.split(' ')[1] || pal.name;
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
