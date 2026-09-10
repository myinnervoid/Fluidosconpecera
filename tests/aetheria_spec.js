/**
 * AETHERIA | Architecture Test Suite (Specification & Assertions)
 * Tests 5 Vectors: Contracts, Error Catalog, State Invariants, UI State Machine & Resiliency.
 */

(function () {
  'use strict';

  class TestRunner {
    constructor() {
      this.suites = [];
      this.totalTests = 0;
      this.passedTests = 0;
      this.failedTests = 0;
      this.startTime = 0;
    }

    describe(suiteName, fn) {
      const suite = { name: suiteName, tests: [] };
      this.suites.push(suite);
      const test = (testName, testFn) => {
        suite.tests.push({ name: testName, fn: testFn });
      };
      fn(test);
    }

    async run() {
      this.startTime = performance.now();
      const resultsContainer = document.getElementById('test-results');

      for (const suite of this.suites) {
        const suiteEl = document.createElement('div');
        suiteEl.className = 'suite-card';

        const headerEl = document.createElement('div');
        headerEl.className = 'suite-header';
        headerEl.innerHTML = `<span>${suite.name}</span><span id="suite-count-${this.suites.indexOf(suite)}"></span>`;
        suiteEl.appendChild(headerEl);

        let suitePassed = 0;

        for (const t of suite.tests) {
          this.totalTests++;
          const itemEl = document.createElement('div');
          itemEl.className = 'test-item';

          const tStart = performance.now();
          let passed = false;
          let errorMsg = '';

          try {
            const res = t.fn();
            if (res instanceof Promise) {
              await res;
            }
            passed = true;
            this.passedTests++;
            suitePassed++;
          } catch (err) {
            passed = false;
            this.failedTests++;
            errorMsg = err.message || String(err);
          }

          const tDuration = (performance.now() - tStart).toFixed(1);

          itemEl.innerHTML = `
            <span class="badge ${passed ? 'badge-pass' : 'badge-fail'}">${passed ? 'PASS' : 'FAIL'}</span>
            <span>${t.name}</span>
            ${errorMsg ? `<span class="test-error">${errorMsg}</span>` : `<span class="test-duration">${tDuration} ms</span>`}
          `;

          suiteEl.appendChild(itemEl);
        }

        const countBadge = suiteEl.querySelector(`#suite-count-${this.suites.indexOf(suite)}`);
        if (countBadge) {
          countBadge.textContent = `${suitePassed}/${suite.tests.length} OK`;
        }

        if (resultsContainer) resultsContainer.appendChild(suiteEl);
      }

      this.updateSummary();
    }

    updateSummary() {
      const totalEl = document.getElementById('stat-total');
      const passEl = document.getElementById('stat-pass');
      const failEl = document.getElementById('stat-fail');
      const timeEl = document.getElementById('stat-time');

      if (totalEl) totalEl.textContent = this.totalTests;
      if (passEl) passEl.textContent = this.passedTests;
      if (failEl) failEl.textContent = this.failedTests;
      if (timeEl) timeEl.textContent = `${(performance.now() - this.startTime).toFixed(0)} ms`;
    }
  }

  // Assertion Helpers
  function expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
      },
      toEqual(expected) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected deep equality with ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
        }
      },
      toBeTruthy() {
        if (!actual) throw new Error(`Expected truthy value, but got ${actual}`);
      },
      toBeFalsy() {
        if (actual) throw new Error(`Expected falsy value, but got ${actual}`);
      },
      toBeGreaterThan(val) {
        if (actual <= val) throw new Error(`Expected ${actual} to be > ${val}`);
      },
      toBeLessThanOrEqual(val) {
        if (actual > val) throw new Error(`Expected ${actual} to be <= ${val}`);
      },
      toContain(item) {
        if (!actual || !actual.includes(item)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
        }
      }
    };
  }

  const runner = new TestRunner();

  // ==========================================
  // VECTOR 1: Dominio, Invariantes & Paletas
  // ==========================================
  runner.describe('Vector 1: Dominio & Invariantes Físicas', (it) => {
    it('Las paletas de color contienen canales RGB normalizados [0.0, 1.0]', () => {
      expect(typeof AetheriaPalettes).toBe('object');
      const elements = ['fluid', 'lava', 'sand', 'gas'];
      for (const elem of elements) {
        expect(typeof AetheriaPalettes[elem]).toBe('object');
        for (const [key, pal] of Object.entries(AetheriaPalettes[elem])) {
          expect(typeof pal.name).toBe('string');
          expect(Array.isArray(pal.colors)).toBeTruthy();
          pal.colors.forEach((col) => {
            expect(col.length >= 3).toBeTruthy();
            col.forEach((c) => {
              expect(c >= 0.0).toBeTruthy();
              expect(c <= 1.0).toBeTruthy();
            });
          });
        }
      }
    });

    it('Simetría de puntero independiente y desacoplada del conteo de boids', () => {
      if (typeof AetheriaState !== 'undefined') {
        AetheriaState.swarmCount = 6;
        AetheriaState.setSymmetry(8);
        expect(AetheriaState.symmetry).toBe(8);
        expect(AetheriaState.swarmCount).toBe(6);
      }
    });
  });

  // ==========================================
  // VECTOR 2: Contratos de Datos & Catálogo de Errores
  // ==========================================
  runner.describe('Vector 2: Contratos de Datos & Catálogo de Errores', (it) => {
    it('El catálogo canónico AetheriaErrorCatalog está definido e inmutable', () => {
      expect(typeof AetheriaErrorCatalog).toBe('object');
      expect(Object.isFrozen(AetheriaErrorCatalog)).toBeTruthy();
      expect(AetheriaErrorCatalog.ERR_WEBGL_UNSUPPORTED).toBe('ERR_WEBGL_UNSUPPORTED');
      expect(AetheriaErrorCatalog.ERR_CONTEXT_LOST).toBe('ERR_CONTEXT_LOST');
      expect(AetheriaErrorCatalog.ERR_RECORDER_UNSUPPORTED).toBe('ERR_RECORDER_UNSUPPORTED');
      expect(AetheriaErrorCatalog.ERR_INVALID_FILE_TYPE).toBe('ERR_INVALID_FILE_TYPE');
    });

    it('createApiResponse genera el formato estándar { success, data, error_code, message }', () => {
      const okRes = createApiResponse(true, { fps: 60 }, null, 'OK');
      expect(okRes.success).toBe(true);
      expect(okRes.data.fps).toBe(60);
      expect(okRes.error_code).toBe(null);
      expect(okRes.message).toBe('OK');

      const errRes = createApiResponse(false, null, AetheriaErrorCatalog.ERR_CONTEXT_LOST, 'Contexto perdido');
      expect(errRes.success).toBe(false);
      expect(errRes.data).toBe(null);
      expect(errRes.error_code).toBe('ERR_CONTEXT_LOST');
      expect(errRes.message).toBe('Contexto perdido');
    });

    it('SchemaValidator valida tipos de datos y esquemas de forma estricta', () => {
      const v = AetheriaContracts.Validator;
      expect(v.validateColorRgb([0.5, 0.2, 0.9])).toBe(true);
      expect(v.validateColorRgb([1.5, 0.2, 0.9])).toBe(false); // fuera de rango
      expect(v.validateColorRgb('invalid')).toBe(false);

      expect(v.validateSymmetryMode(1)).toBe(true);
      expect(v.validateSymmetryMode(2)).toBe(true);
      expect(v.validateSymmetryMode(3)).toBe(true);
      expect(v.validateSymmetryMode(4)).toBe(true);
      expect(v.validateSymmetryMode(5)).toBe(true);
      expect(v.validateSymmetryMode(6)).toBe(true);
      expect(v.validateSymmetryMode(7)).toBe(true);
      expect(v.validateSymmetryMode(8)).toBe(true);
      expect(v.validateSymmetryMode(9)).toBe(false); // 9 no está en catálogo

      expect(v.validateElementMode('lava')).toBe(true);
      expect(v.validateElementMode('plasma')).toBe(false);

      expect(v.validateAvatarType('nyan')).toBe(true);
      expect(v.validateAvatarType('clownfish')).toBe(true);
      expect(v.validateAvatarType('fish')).toBe(true);
      expect(v.validateAvatarType('unknown')).toBe(false);
    });

    it('AetheriaSymmetry genera exactamente 3 puntos para 3x y 5 puntos para 5x', () => {
      AetheriaSymmetry.setSymmetry(3);
      const pts3 = AetheriaSymmetry.getPoints(0.6, 0.6, 1, 0, 1.0);
      expect(pts3.length).toBe(3);

      AetheriaSymmetry.setSymmetry(5);
      const pts5 = AetheriaSymmetry.getPoints(0.6, 0.6, 1, 0, 1.0);
      expect(pts5.length).toBe(5);

      AetheriaSymmetry.setSymmetry(4);
    });
  });

  // ==========================================
  // VECTOR 3: Lógica de Dominio, Concurrencia & Hardening
  // ==========================================
  runner.describe('Vector 3: Hardening de GPU & Gestión de Contexto', (it) => {
    it('FluidCore implementa isContextLost() y dispose() sin lanzar excepciones', () => {
      expect(typeof FluidCore.isContextLost).toBe('function');
      expect(typeof FluidCore.isContextLost()).toBe('boolean');
      expect(typeof FluidCore.dispose).toBe('function');
    });

    it('ParticleFXEngine inicializa pool estático circular de 200 partículas sin GC overhead', () => {
      expect(typeof AetheriaParticles).toBe('object');
      expect(AetheriaParticles.particles.length).toBe(200);
      expect(AetheriaParticles.particles[0].active).toBe(false);
    });
  });

  // ==========================================
  // VECTOR 4: Superficie de Interfaz & Autómata Finito
  // ==========================================
  runner.describe('Vector 4: Autómata Finito de UI & Cinemática de Avatares', (it) => {
    it('UIStateMachine gestiona los 5 estados canónicos [IDLE, PENDING, SUCCESS, EMPTY, FAULT]', () => {
      expect(typeof AetheriaUI.stateMachine).toBe('object');
      const sm = AetheriaUI.stateMachine;

      let notifiedState = null;
      const unsubscribe = sm.subscribe((event) => {
        notifiedState = event.newState;
      });

      sm.transition('background', 'PENDING', { background: 'universe' });
      expect(sm.getState('background')).toBe('PENDING');
      expect(notifiedState).toBe('PENDING');

      sm.transition('background', 'SUCCESS', { message: 'Fondo cargado' });
      expect(sm.getState('background')).toBe('SUCCESS');
      expect(notifiedState).toBe('SUCCESS');

      sm.transition('avatar', 'FAULT', { errorCode: 'ERR_INVALID_FILE_TYPE', message: 'Tipo no válido' });
      expect(sm.getState('avatar')).toBe('FAULT');
      expect(notifiedState).toBe('FAULT');

      // Transición a estado inválido rechazada
      const invalidRes = sm.transition('avatar', 'NON_EXISTENT_STATE');
      expect(invalidRes).toBe(false);

      unsubscribe();
    });

    it('AetheriaCursor calcula la rotación angular 360° precisa para avatares', () => {
      AetheriaCursor.setCursorType('rocket'); // angleCorrection: 90
      const rotNorth = AetheriaCursor.calculateRotation(0, 1); // Movimiento hacia arriba
      expect(rotNorth).toBe(0);

      const rotEast = AetheriaCursor.calculateRotation(1, 0); // Movimiento hacia la derecha
      expect(rotEast).toBe(90);
    });

    it('AetheriaCursor.setAvatar homologa el cambio de avatar y expone emisión de chispas', () => {
      AetheriaCursor.setAvatar('nyan');
      expect(AetheriaCursor.currentType).toBe('nyan');
      expect(AetheriaCursor.currentAvatar).toBe('nyan');
      const sparkNyan = AetheriaCursor.getSparkEmission();
      expect(sparkNyan.sparkType).toBe('pixel');
      expect(Array.isArray(AetheriaCursor.avatarConfig.nyan.sparkColors)).toBe(true);

      const cfg = AetheriaCursor.getCurrentAvatarConfig();
      expect(cfg.sparkType).toBe('pixel');

      AetheriaCursor.setAvatar('clownfish');
      expect(AetheriaCursor.currentType).toBe('clownfish');
      const sparkFish = AetheriaCursor.getSparkEmission();
      expect(sparkFish.sparkType).toBe('bubbles');

      // Test alias fish
      AetheriaCursor.setAvatar('fish');
      expect(AetheriaCursor.currentType).toBe('clownfish');

      AetheriaCursor.setAvatar('none');
      expect(AetheriaCursor.currentType).toBe('none');
    });

    it('AetheriaParticles.setEffect actualiza el modo de emisión y permite emit flexible', () => {
      expect(typeof AetheriaParticles.setEffect).toBe('function');
      AetheriaParticles.setEffect('fire', '#ff6600');
      expect(AetheriaParticles.effectType).toBe('fire');
      expect(AetheriaParticles.baseColor).toBe('#ff6600');

      AetheriaParticles.emit(100, 100, 5, 5, 4);
      expect(AetheriaParticles.particles[0].active).toBe(true);
    });

    it('AetheriaCursor calcula el punto de emisión limpio y directo', () => {
      AetheriaCursor.setCursorType('rocket');
      const pt = AetheriaCursor.getEmitterOffsetPoint(0.5, 0.5, 10, 0);
      expect(pt.x).toBe(0.5);
      expect(pt.y).toBe(0.5);
    });

    it('AetheriaFidgets ejecuta Supernova, Vórtice, Tsunami, Lluvia Cósmica y Gravedad', () => {
      expect(typeof AetheriaFidgets).toBe('object');
      expect(typeof AetheriaFidgets.supernova).toBe('function');
      expect(typeof AetheriaFidgets.vortex).toBe('function');
      expect(typeof AetheriaFidgets.tsunami).toBe('function');
      expect(typeof AetheriaFidgets.meteorRain).toBe('function');

      const mockCore = {
        splats: [],
        splat(x, y, dx, dy, col, rad) {
          this.splats.push({ x, y, dx, dy, col, rad });
        },
        setGravity(gx, gy) {
          this.gx = gx;
          this.gy = gy;
        },
        config: { PAUSED: false }
      };

      AetheriaFidgets.triggerSupernova(mockCore, [1, 0, 0], { x: 0.4, y: 0.6 });
      expect(mockCore.splats.length).toBeGreaterThan(15);

      mockCore.splats = [];
      AetheriaFidgets.triggerTsunami(mockCore, [0, 1, 1]);
      expect(mockCore.splats.length).toBeGreaterThan(10);

      mockCore.splats = [];
      AetheriaFidgets.triggerCosmicRain(mockCore, [0, 0, 1]);
      expect(mockCore.splats.length).toBeGreaterThan(10);

      const isGrav = AetheriaFidgets.toggleGravity(mockCore);
      expect(typeof isGrav).toBe('boolean');
      expect(mockCore.gy).toBe(-1.85);

      AetheriaFidgets.toggleGravity(mockCore); // Turn off
      expect(mockCore.gy).toBe(0.0);
    });
  });

  // ==========================================
  // VECTOR 5: Infraestructura, Resiliencia & Boids
  // ==========================================
  runner.describe('Vector 5: Resiliencia, Swarm Boids & Fondos Adaptativos', (it) => {
    it('AetheriaBackground expone la lista de 8 fondos inmersivos + vacío', () => {
      const list = AetheriaBackground.getBackgroundList();
      expect(list.length).toBeGreaterThan(7);
      const keys = list.map((b) => b.id);
      expect(keys).toContain('universe');
      expect(keys).toContain('galaxy');
      expect(keys).toContain('pool');
      expect(keys).toContain('cenote');
    });

    it('SwarmEngine boids se mantienen acotados dentro del margen de la pantalla (0.01 - 0.99)', () => {
      AetheriaSwarm.setBoidsCount(4);
      expect(AetheriaSwarm.boids.length).toBe(4);
      for (const b of AetheriaSwarm.boids) {
        b.x = 0.005; // Fuera del margen
        b.update(AetheriaSwarm.boids, 1.0, 0.016);
        expect(b.x).toBeGreaterThan(0.009); // Repulsión suave aplicada
      }
    });

    it('CanvasRecorder expone tipos MIME compatibles con WebM/MP4', () => {
      expect(typeof AetheriaRecorder).toBe('object');
      const mime = AetheriaRecorder.getSupportedMimeType();
      expect(typeof mime).toBe('string');
      expect(mime.length > 0).toBeTruthy();
    });
  });

  // Ejecutar Suite al cargar
  window.addEventListener('DOMContentLoaded', () => {
    runner.run();
  });
})();
