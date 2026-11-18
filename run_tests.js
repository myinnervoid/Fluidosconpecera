/**
 * AETHERIA | Zero-Dependency Node & Headless Browser Test Runner
 * Executes all 5 architectural test vectors directly in Node.js VM (or Puppeteer if installed).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

(async () => {
  const rootDir = __dirname;
  const elements = {};

  const createEl = (id = '') => ({
    id,
    className: '',
    innerHTML: '',
    innerText: '',
    textContent: '',
    style: {},
    dataset: {},
    children: [],
    childNodes: [],
    firstChild: null,
    parentNode: null,
    open: true,
    value: '10',
    checked: false,
    classList: {
      _set: new Set(),
      add(...cls) { cls.forEach(c => this._set.add(c)); },
      remove(...cls) { cls.forEach(c => this._set.delete(c)); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._set.has(c)) { this._set.delete(c); return false; }
          this._set.add(c); return true;
        }
        if (force) this._set.add(c); else this._set.delete(c);
        return !!force;
      },
      contains(c) { return this._set.has(c); }
    },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener() {},
    removeEventListener() {},
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      this.childNodes.push(child);
      this.firstChild = this.childNodes[0] || null;
      return child;
    },
    removeChild(child) {
      const idx = this.childNodes.indexOf(child);
      if (idx >= 0) this.childNodes.splice(idx, 1);
      this.firstChild = this.childNodes[0] || null;
    },
    querySelector(sel) {
      if (sel.startsWith('#')) {
        const idKey = sel.slice(1);
        return elements[idKey] || createEl(idKey);
      }
      return createEl();
    },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 1920, height: 1080 }; },
    getContext() {
      return {
        clearRect() {},
        save() {},
        restore() {},
        translate() {},
        rotate() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        quadraticCurveTo() {},
        bezierCurveTo() {},
        closePath() {},
        fill() {},
        stroke() {},
        arc() {},
        ellipse() {},
        fillRect() {},
        strokeRect() {},
        fillText() {},
        drawImage() {},
        createLinearGradient() { return { addColorStop() {} }; },
        createRadialGradient() { return { addColorStop() {} }; }
      };
    },
    captureStream() { return { getTracks: () => [] }; }
  });

  ['stat-total', 'stat-pass', 'stat-fail', 'stat-time', 'test-results', 'gl-canvas', 'particle-canvas', 'cursor-overlay', 'top-bar', 'settings-drawer', 'drawer-overlay', 'btn-hamburger', 'toast-container', 'palette-selector-grid', 'current-mode-badge'].forEach(id => {
    elements[id] = createEl(id);
  });

  const domLoadedListeners = [];
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    performance: { now: () => Date.now() },
    requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    localStorage: {
      _store: {},
      getItem(k) { return this._store[k] || null; },
      setItem(k, v) { this._store[k] = String(v); },
      removeItem(k) { delete this._store[k]; }
    },
    MediaRecorder: {
      isTypeSupported: (mime) => mime.includes('webm')
    },
    Image: class {
      set src(v) { if (this.onload) setTimeout(() => this.onload(), 5); }
    },
    FileReader: class {},
    Blob: class {},
    URL: { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} },
    navigator: { userAgent: 'NodeTestRunner', vibrate: () => {} },
    document: {
      body: createEl('body'),
      documentElement: createEl('html'),
      fullscreenElement: null,
      createElement: (tag) => createEl(tag),
      getElementById: (id) => {
        if (!elements[id]) elements[id] = createEl(id);
        return elements[id];
      },
      querySelector: () => createEl(),
      querySelectorAll: () => [],
      addEventListener: (evt, fn) => {
        if (evt === 'DOMContentLoaded') domLoadedListeners.push(fn);
      }
    }
  };
  sandbox.window = sandbox;
  sandbox.window.addEventListener = (evt, fn) => {
    if (evt === 'DOMContentLoaded' || evt === 'load') domLoadedListeners.push(fn);
  };
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);

  const scripts = [
    'js/contracts.js',
    'js/utils/mathUtils.js',
    'assets/palettes.js',
    'js/state.js',
    'js/extensions/backgrounds.js',
    'js/original/fluidCore.js',
    'js/extensions/particleFx.js',
    'js/extensions/customCursor.js',
    'js/extensions/swarmEngine.js',
    'js/extensions/swarmRenderer.js',
    'js/extensions/symmetry.js',
    'js/extensions/fidgets.js',
    'js/extensions/sandMode.js',
    'js/extensions/recorder.js',
    'js/extensions/ui.js',
    'tests/aetheria_spec.js'
  ];

  for (const relPath of scripts) {
    const fullPath = path.join(rootDir, relPath);
    const code = fs.readFileSync(fullPath, 'utf8');
    vm.runInContext(code, sandbox, { filename: relPath });
  }

  // Trigger DOMContentLoaded to run the test suite
  for (const fn of domLoadedListeners) {
    await fn();
  }

  // Wait briefly for any async promises in tests
  await new Promise(r => setTimeout(r, 150));

  const total = parseInt(elements['stat-total'].textContent || '0', 10);
  const pass = parseInt(elements['stat-pass'].textContent || '0', 10);
  const fail = parseInt(elements['stat-fail'].textContent || '0', 10);
  const time = elements['stat-time'].textContent || '0 ms';

  console.log(`====================================================`);
  console.log(`AETHERIA TEST SUITE: ${pass}/${total} PASSED (${fail} FAILED) in ${time}`);
  console.log(`====================================================`);

  if (fail > 0 || total === 0) {
    process.exit(1);
  }
})();
