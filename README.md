# AETHERIA | Generative Fluid & Sand Studio

[![Live Demo](https://img.shields.io/badge/Demo%20Online-GitHub%20Pages-00f2fe.svg?style=for-the-badge&logo=github)](https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![WebGL](https://img.shields.io/badge/WebGL-1.0%20%2F%202.0-00f5d4.svg?style=for-the-badge&logo=webgl)](https://www.khronos.org/webgl/)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-ff007f.svg?style=for-the-badge)](manifest.json)
[![English Version](https://img.shields.io/badge/Language-English%20README-38bdf8.svg?style=for-the-badge)](README.en.md)

![Aetheria Fluid Studio Screenshot](assets/screenshot1.png)

> 🌐 **Prueba la experiencia interactiva en vivo aquí:**  
> 👉 **[https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/](https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/)**

**Aetheria** es un estudio interactivo de arte generativo y física de fluidos incompresibles en tiempo real ejecutado en WebGL sobre la GPU (Navier-Stokes). Combina simulación física líquida con sombreado 3D difuso/especular, modos de partículas de arena granular (*reloj de arena*), humo espacial de alta vorticidad, simetrías radiales unificadas (1x a 8x), un enjambre de 6 avatares autónomos ("pecera") y una galería de **8 fondos inmersivos adaptativos** en resoluciones horizontal (16:9) y vertical móvil (9:16).

---

## 🌟 Novedades y Evolución (Versión 1.6.0)

Desde la versión inicial 1.0.0, Aetheria ha evolucionado con las siguientes arquitecturas:

* 🖼️ **8 Fondos Inmersivos Adaptativos (16:9 PC / 9:16 Móvil):**
  - El motor detecta en tiempo real la orientación de tu dispositivo y carga la versión optimizada:
    1. `🌑 Vacío (Negro)`: Fondo minimalista de alto contraste para dibujo puro.
    2. `🌌 Universo Profundo`: Campo estelar cósmico con nebulosas violetas y cian.
    3. `🌀 Galaxia Espiral`: Núcleo galáctico luminoso con brazos de luz estelar.
    4. `🏊 Alberca Cristalina`: Piscina con cáusticas solares y reflejos acuáticos bajo el agua.
    5. `🪣 Cubeta de Agua`: Interior de balde con agua cristalina y reflejos metálicos.
    6. `🏝️ Mar Caribe`: Aguas turquesas y arrecifes con arena blanca caribeña.
    7. `🏞️ Río de Montaña`: Arroyo cristalino corriendo sobre piedras lisas y musgo.
    8. `🌿 Laguna Mística`: Laguna bioluminiscente rodeada de vegetación nocturna.
    9. `🕳️ Cenote Sagrado`: Cenote maya con rayo de sol penetrando el agua azul profunda.
  - **Transparencia WebGL:** El fluido se superpone con *alpha blending* natural, interactuando estéticamente con el fondo.

* 🐱 **6 Punteros Temáticos Desacoplados:**
  1. `🚫 Ninguno`: Trazo puro de fluido sin cursor invasivo con el color de la paleta activa.
  2. `🐱 Nyan Cat`: Color sólido en clics de usuario y arcoíris continuo cromático en modo automático.
  3. `🚀 Cohete Espacial`: Orientación dinámica $360^\circ$ en dirección al avance con tobera trasera de fuego reactivo.
  4. `☄️ Cometa Cósmico`: Núcleo frontal con haz de plasma y polvo estelar plateado.
  5. `🐠 Pez Payaso (Nemo)`: Nado orgánico ondulatorio con estela de burbujas bioluminiscentes.
  6. `🩵 Hatsune Miku`: Estela techno pop (#39C5BB Teal neón y magenta eléctrico) con destellos.
  7. `📁 Puntero Propio`: Sube cualquier imagen PNG/GIF local desde tu dispositivo.

* 🐟 **Modo Automático "Pecera" (Swarm Boids):** Agentes autónomos con física de bandada (separación, alineación, cohesión), **evasión suave de bordes** (*soft boundary repulsion* al 8% de margen) para mantenerlos dentro de la pantalla indefinidamente y oscilación armónica suave.
* 🎨 **Renderizador Visual de Boids en Tiempo Real (`SwarmRenderer`):** Lienzo 2D superpuesto que dibuja a los avatares volando y nadando con sombras luminosas y rotación angular precisa.
* 🪞 **Simetría Radial Unificada (1x a 8x):** Los Boids y el usuario inyectan a través del mismo pipeline (`SymmetryEngine.injectSplat`), creando mandalas en movimiento. Auto-regula los boids a 3 en simetrías altas para garantizar 60 FPS estables.
* 🏛️ **Bus de Estado Centralizado (`AetheriaState`):** Gestión desacoplada y robusta que previene colisiones entre el usuario y la automatización.

---

## 🌊 Guía de Parámetros Físicos

| Parámetro | Rango | Descripción y Efecto Visual |
|---|:---:|---|
| **🌪️ Vorticidad** | 0 – 60 | Intensidad de los torbellinos. A mayor valor, el fluido se retuerce más creando rizos y volutas caóticas vivas. |
| **💨 Disipación de Densidad** | 0.1 – 2.0 | Velocidad de desvanecimiento del color. Un valor bajo (0.1) mantiene el tinte por minutos; un valor alto (2.0) lo desvanece casi al instante (humo ligero). |
| **🎯 Radio de Splat** | 0.05 – 1.0 | Grosor y área del chorro inyectado por el cursor o los Boids. |
| **⏳ Tamaño de Grano** | 4px – 32px | Tamaño aparente de las partículas en Modo Arena (granos gruesos vs textura mineral fina). |
| **🪐 Fuerza de Gravedad** | 0.5 – 5.0 | Aceleración vertical continua hacia abajo. Crea cascadas y ríos fluidos. |
| **🐟 Cantidad de Boids** | 1 – 10 (50 dev) | Número de avatares autónomos nadando en la pecera. |

---

## 📐 Fundamentos Matemáticos y Físicos (GPU Gems 38)

El motor resuelve numéricamente las ecuaciones de **Navier-Stokes para fluidos incompresibles**:

$$\frac{\partial \mathbf{u}}{\partial t} = -(\mathbf{u} \cdot \nabla)\mathbf{u} - \frac{1}{\rho}\nabla p + \nu \nabla^2 \mathbf{u} + \mathbf{F}$$

$$\nabla \cdot \mathbf{u} = 0$$

### Pipeline en GPU:
1. **Confinamiento de Vorticidad (Fedkiw et al.):** Restaura la energía rotacional perdida por viscosidad numérica: $\mathbf{F}_{vort} = \varepsilon (\mathbf{N} \times \mathbf{\omega})$.
2. **Cálculo de Divergencia:** Medición de compresión del campo de velocidad mediante diferencias finitas centrales.
3. **Solver de Jacobi para la Presión:** 20 iteraciones continuas en GPU resolviendo la ecuación de Poisson.
4. **Proyección de Helmholtz-Hodge:** Sustracción del gradiente de presión ($\mathbf{u} = \mathbf{w} - \nabla p$) para garantizar velocidad solenoidal libre de divergencia.
5. **Advección Semi-Lagrangiana con Gravedad:** Transporte bilineal de velocidad y color con aceleración gravitatoria continua pre-Poisson.

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
| :--- | :--- |
| **`[1]`** | Modo Fluido 3D |
| **`[2]`** | Modo Lava Lamp (Convección térmica viscosa) |
| **`[3]`** | Modo Arena Granular (Reloj de Arena) |
| **`[4]`** | Modo Gas / Humo Espacial |
| **`[H]`** | **Modo Zen** (Ocultar / Mostrar interfaz) |
| **`[A]`** | Alternar Auto-Piloto Swarm (Pecera) |
| **`[M]`** | Abrir / Cerrar Cajón de Ajustes |
| **`[S]`** | Detonar Supernova |
| **`[V]`** | Inyectar Vórtice |
| **`[G]`** | Alternar Gravedad (ON / OFF) |
| **`[C]`** | Cambiar Paleta de Color Activa |
| **`[Espacio]`** | Pausar / Reanudar Simulación |
| **`[Del]` / `[Backspace]`** | Limpiar Lienzo |

---

## 🚀 Cómo Ejecutar

### Opción 1: Probar en Línea (Demo GitHub Pages)
Visita directamente [https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/](https://myinnervoid.github.io/Memexicanisimos-Aetheria-Fluid---Sand-Studio/).

### Opción 2: 100% Offline (Doble Clic)
Haz doble clic en `index.html` en tu explorador de archivos. Funciona de inmediato sin internet, terminal ni Node.js.

### Opción 3: Servidor Local
```bash
# Con Python
python3 -m http.server 8080

# Con npx
npx serve .
```

---

## 📄 Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más información.

Copyright (c) 2017 Pavel Dobryakov  
Arquitectura modular, física extendida, fondos adaptativos, avatares y enjambre por Estudio Memexicanisimos.
