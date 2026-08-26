# RELEASE.md — Estrategia de Release, Despliegue y Changelog

**Proyecto:** Aetheria Fluid & Sand Studio  
**Versión Actual:** `v1.6.0` — *"Immersive Backgrounds, 6-Avatar Swarm & Mobile-First 3-Zone Touch Studio"*  
**Demo en Vivo:** [https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/](https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/)

---

## 📋 Changelog Acumulado (v1.0.0 $\to$ v1.6.0)

### `v1.6.0` (2026-08-25) — *Immersive Backgrounds, 6-Avatar Swarm & Mobile-First Touch Studio*
* **📱 Interfaz Táctil Responsive en 3 Zonas:**
  - **Bloque Derecho Fijo:** Botón `☰ Ajustes`, `⛶ Pantalla Completa` y `👁️ Modo Zen` fijados en la esquina superior derecha, garantizando acceso con un solo toque en cualquier smartphone ($320\text{px}-414\text{px}$) sin requerir activar "modo escritorio".
  - **Área Central con Desplazamiento Táctil:** Contenedor de fidgets con scroll horizontal suave (`touch-action: pan-x; -webkit-overflow-scrolling: touch;`).
  - **Barra Anclable (Arriba / Abajo):** Botón `↕️` para alternar la posición de la barra entre el borde superior e inferior para uso ergonómico a una mano.
  - **Modo Pantalla Completa (`[F]` o `⛶`):** Integración con Fullscreen API cross-browser para eliminar las barras de navegación en Android e iOS.
  - **Filtro Anti-Manchas UI:** `e.target.closest('#top-bar, #settings-drawer, #drawer-overlay, .ui-interactive')` y bloqueo total de trazos cuando el cajón de ajustes está abierto (`isDrawerOpen`).
  - **Tooltips Interactivos:** Tooltips en sliders que explican los parámetros físicos tanto en hover como en toque táctil.
  - **Persistencia Centralizada:** Almacenamiento en LocalStorage de `aetheria_bar_position`, `aetheria_dev_mode` y `aetheria_background`.
* **🖼️ 8 Fondos Inmersivos Adaptativos (16:9 Desktop / 9:16 Móvil):**
  - Módulo `AetheriaBackground` (`js/extensions/backgrounds.js`) con detección automática de orientación y cambio en caliente sin recargar la página.
  - Precarga de imágenes con `new Image()` y transición suave de opacidad (fade de 0.3s) para evitar parpadeos blancos.
  - 8 Fondos temáticos acuáticos y cósmicos:
    1. `universe`: Universo profundo con nebulosas y estrellas.
    2. `galaxy`: Galaxia espiral luminosa con brazos estelares.
    3. `pool`: Alberca cristalina con cáusticas solares bajo el agua.
    4. `bucket`: Cubeta de agua con reflejos metálicos.
    5. `caribbean`: Mar Caribe turquesa con arena blanca.
    6. `river`: Río de montaña cristalino corriendo entre piedras lisas.
    7. `lagoon`: Laguna bioluminiscente con vegetación mística.
    8. `cenote`: Cenote sagrado maya con rayo de sol.
    9. `none`: Fondo negro puro de contraste.
  - Transparencia en WebGL (`{ alpha: true, premultipliedAlpha: false }` y shader con alpha proporcional a la densidad) para que el fluido se mezcle sobre las fotos.
* **🐱 6 Punteros Temáticos Desacoplados:**
  - `none`: Trazo puro de fluido sin cursor invasivo con color sólido de paleta.
  - `nyan`: Nyan Cat (color sólido en clics de usuario / arcoíris continuo cromático en modo automático).
  - `rocket`: Cohete espacial orientado dinámicamente $360^\circ$ al avance con tobera trasera de fuego.
  - `comet`: Cometa cósmico con haz de plasma plateado y azul hielo.
  - `clownfish`: Pez Payaso Nemo con nado orgánico y estela de burbujas acuáticas.
  - `miku`: Hatsune Miku con estela techno pop (#39C5BB Teal neón y magenta).
  - `custom`: Soporte para cargar cualquier imagen PNG/GIF local como cursor.
* **🐟 Modo Pecera Swarm Boids (`AutoSwarmController`):**
  - Evasión cuadrática suave de bordes (*soft boundary repulsion* al 8% de margen) para mantener a los boids siempre en pantalla.
  - Modulación armónica natural basada en `performance.now()` para otorgar dinamismo orgánico y rítmico sin requerir audio.
* **🎨 Renderizador Visual de Boids (`SwarmRenderer`):**
  - Canvas 2D dedicado superpuesto que dibuja a los Boids en tiempo real con rotación angular exacta y sombras luminosas.
* **🪞 Simetría Radial Unificada (`SymmetryEngine.injectSplat`):**
  - Integración unificada de 1x a 8x para trazos de usuario y boids autónomos con auto-regulación de boids para preservar 60 FPS.
* **🏛️ Bus Centralizado de Estado (`AetheriaState`):**
  - Singleton `state.js` que desacopla la UI, la física y la automatización.
* **⏳ Shader de Arena Granular & Fidgets:**
  - Modo Arena Granular (*Reloj de arena*) con bisel y relieve celular.
  - Fidgets de 1 clic: Supernova, Vórtice y Gravedad continua.
  - Modo Zen (`[H]`) y panel Drawer superior con backdrop de cierre táctil.

---

### `v1.0.0` (Versión Base)
* Motor de simulación Navier-Stokes original de Pavel Dobryakov adaptado a WebGL.

---

## 🚀 Despliegue en GitHub Pages

1. **Ruta del repositorio:** `myinnervoid/Memexicanisimos-Aetheria-Fluid---Sand-Studio`
2. **Configuración de Pages:** Source: `Deploy from a branch` -> `main` / `root`.
3. **URL Pública:** `https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/`
