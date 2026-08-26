# RELEASE.md — Estrategia de Release, Despliegue y Changelog

**Proyecto:** Aetheria Fluid & Sand Studio  
**Versión Actual:** `v1.6.0` — *"Immersive Backgrounds, 6-Avatar Swarm & Multi-Touch Studio"*  
**Demo en Vivo:** [https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/](https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/)

---

## 📋 Changelog Acumulado (v1.0.0 $\to$ v1.6.0)

### `v1.6.0` (2026-08-25) — *Immersive Backgrounds, 6-Avatar Swarm & Multi-Touch Studio*
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
  - Modo Zen (`[H]`) y panel Drawer superior.

---

### `v1.0.0` (Versión Base)
* Motor de simulación Navier-Stokes original de Pavel Dobryakov adaptado a WebGL.

---

## 🚀 Despliegue en GitHub Pages

1. **Ruta del repositorio:** `myinnervoid/Memexicanisimos-Aetheria-Fluid---Sand-Studio`
2. **Configuración de Pages:** Source: `Deploy from a branch` -> `main` / `root`.
3. **URL Pública:** `https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/`
