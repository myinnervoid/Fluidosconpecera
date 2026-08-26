# FRONTEND_REVIEW.md — Auditoría de Frontend y Componentes GUI

**Rol:** Frontend / GUI Developer Senior (Auditoría)  
**Evaluación:** Capa DOM, Enrutamiento de Eventos Táctiles, Semántica HTML y CSS.

---

## 1. Auditoría de Semántica y Arquitectura DOM

### Fortalezas de Frontend
1. **Estructura HTML5 Semántica:** Uso apropiado de `<header>`, `<aside>`, `<section>`, `<button>` y `<canvas>`.
2. **Cero Dependencias y Cero FOUC:** Los estilos están optimizados en un único archivo CSS local sin dependencias de red.
3. **Aislamiento de Capas Canvas:** El apilamiento de `#gl-canvas` (z:1), `#silk-canvas` (z:2, `pointer-events: none`) y `#cursor-overlay` (z:3, `pointer-events: none`) garantiza que los eventos de puntero no se intercepten erróneamente.

---

## 2. Hallazgos y Áreas de Mejora

### Hallazgo FE-01: Registro de Eventos Pointer en `window` en lugar de `#gl-canvas`
* **Impacto:** Medio
* **Ubicación:** `js/main.js` (Línea 47):
  ```javascript
  const target = window;
  target.addEventListener('pointerdown', (e) => this.onPointerDown(e));
  ```
* **Análisis:** Al escuchar en `window`, el código debe comprobar manualmente `if (e.target.closest('#main-toolbar') || e.target.closest('#settings-panel')) return;`. Si se añaden modales futuros o enlaces en la página, podrían capturar clicks accidentales como splats de fluido.
* **Propuesta de Mejora:** Escuchar `pointerdown` directamente en `#canvas-container` o `#gl-canvas`, y delegar `pointermove` y `pointerup` a `window` únicamente mientras el puntero esté presionado (*pointer capture*).

### Hallazgo FE-02: Generación Dinámica de Nodos DOM en Simetría
* **Impacto:** Bajo
* **Ubicación:** `js/extensions/symmetry.js` (`updateCursorDOM`):
  ```javascript
  this.cursorOverlay.innerHTML = '';
  // Crea nuevos <div> por cada cambio de simetría
  ```
* **Análisis:** Aunque el impacto es mínimo debido al bajo número de elementos (máximo 8), la manipulación con `innerHTML = ''` causa recolección de basura (*GC thrashing*).
* **Propuesta:** Reutilizar un pool fijo de 8 elementos `div` creados al inicio, alternando su visibilidad (`display: none` o `opacity: 0`) según el modo activo.

### Hallazgo FE-03: Falta de `aria-pressed` y Roles en Botones de Toggle
* **Impacto:** Medio (Accesibilidad y Semántica)
* **Ubicación:** `index.html` y `js/extensions/ui.js`
* **Análisis:** Botones como *Gravedad* y *Pausa* alternan su estado visual mediante clases CSS, pero no comunican su estado a tecnologías de asistencia.
* **Propuesta:** Añadir `aria-pressed="false"` dinámico en `ui.js`:
  ```javascript
  this.btnGravity.setAttribute('aria-pressed', isGravityOn ? 'true' : 'false');
  ```
