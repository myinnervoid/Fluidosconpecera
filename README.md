# AETHERIA | Generative Fluid & Sand Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WebGL](https://img.shields.io/badge/WebGL-1.0%20%2F%202.0-00f2fe.svg)](https://www.khronos.org/webgl/)
[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-00f5d4.svg)](manifest.json)
[![Standalone](https://img.shields.io/badge/Standalone-file%3A%2F%2F%20Ready-ff007f.svg)](index.html)

**Aetheria** es un estudio interactivo de arte generativo y física de fluidos en tiempo real ejecutado en WebGL sobre la GPU. Combina la resolución numérica de las ecuaciones de Navier-Stokes para fluidos incompresibles con modos de partículas de arena granular (*reloj de arena*), humo espacial de alta vorticidad, simetrías radiales multicursor y aceleración gravitatoria continua.

---

## 🌟 Características Principales

* 💧 **Modo Fluido 3D:** Dinámica líquida con sombreado de normales difuso/especular, Bloom HDR y dithering óptico libre de artefactos.
* ⏳ **Modo Arena Granular (Reloj de Arena):** Shader post-procesado que cuantiza el fluido en miles de granos individuales con relieve, bordes biselados y textura mineral que caen con la gravedad.
* 💨 **Modo Gas / Humo:** Perfil volumétrico de baja disipación de masa y alta vorticidad ($\text{CURL} = 42.0$) para simular vapor y nebulosas espaciales.
* 🪞 **Simetría Angular (1x, 2x, 4x, 6x, 8x):** Multiplica los trazos táctiles con normalización $[0,1]$, corrección de aspect ratio y regulación de splats (*splat throttle* de 16 impulsos/cuadro).
* 💥 **Fidgets Físicos Instantáneos (1 Clic):**
  - **Supernova (💥):** Detona una onda de choque radial expansiva desde el centro.
  - **Vórtice (🌪️):** Inyecta un momento angular tangencial en espiral.
  - **Gravedad Cósmica (🪐):** Aplica aceleración vertical continua hacia abajo en cascada.
* 👁️ **Modo Zen (`[H]` / Botón 👁️):** Oculta por completo la interfaz para dibujar sobre el lienzo en pantalla 100% limpia.
* 📱 **Menú Hamburguesa Superior:** Elimina cualquier elemento inferior, evitando salidas accidentales con los gestos de inicio de Android/iOS.
* 📸 **Captura PNG en Alta Resolución:** Exporta el arte generado en resolución nativa con un solo clic.
* ⚡ **100% Standalone y Offline:** Funciona abriendo directamente `index.html` con doble clic (`file:///`) sin requerir servidores web, CDNs ni conexiones a internet.

---

## 📐 Fundamentos Matemáticos y Físicos (GPU Gems 38)

El núcleo de simulación resuelve las ecuaciones de **Navier-Stokes para fluidos incompresibles y homogéneos**:

$$\frac{\partial \mathbf{u}}{\partial t} = -(\mathbf{u} \cdot \nabla)\mathbf{u} - \frac{1}{\rho}\nabla p + \nu \nabla^2 \mathbf{u} + \mathbf{F}$$

$$\nabla \cdot \mathbf{u} = 0$$

### Pipeline de Shaders en GPU:
1. **Confinamiento de Vorticidad (Fedkiw et al.):** Restaura la energía rotacional perdida por viscosidad numérica:
   $$\mathbf{\omega} = \nabla \times \mathbf{u}, \quad \mathbf{N} = \frac{\nabla |\mathbf{\omega}|}{|\nabla |\mathbf{\omega}|| + \epsilon}, \quad \mathbf{F}_{vort} = \varepsilon (\mathbf{N} \times \mathbf{\omega})$$
2. **Cálculo de Divergencia:** Medición de expansión/compresión del campo de velocidad mediante diferencias finitas centrales:
   $$\text{div}(\mathbf{w}) = \frac{1}{2\Delta x} (w_{x(i+1,j)} - w_{x(i-1,j)} + w_{y(i,j+1)} - w_{y(i,j-1)})$$
3. **Ecuación de Poisson para la Presión (Solver de Jacobi):** 20 iteraciones en GPU:
   $$p^{(k+1)}_{i,j} = \frac{p^{(k)}_{i+1,j} + p^{(k)}_{i-1,j} + p^{(k)}_{i,j+1} + p^{(k)}_{i,j-1} - (\Delta x)^2 \text{div}(\mathbf{w})_{i,j}}{4}$$
4. **Proyección de Helmholtz-Hodge:** Sustracción del gradiente de presión para obtener un campo de velocidad libre de divergencia ($\nabla \cdot \mathbf{u} = 0$):
   $$\mathbf{u} = \mathbf{w} - \nabla p$$
5. **Advección Semi-Lagrangiana con Gravedad Pre-Poisson:** Transporte de velocidad y tinte con interpolación bilineal e inyección de fuerza gravitatoria continua:
   $$\mathbf{u}(\mathbf{x}, t+\Delta t) = \mathbf{u}(\mathbf{x} - \mathbf{u}\Delta t, t) + \mathbf{g}\Delta t$$

> 📖 **Nota Técnica:** El texto completo con las derivaciones matemáticas originales se encuentra incluido en el repositorio en el archivo [`GPU_GEMS_Chapter_38_Fast_Fluid_Dynamics.txt`](GPU_GEMS_Chapter_38_Fast_Fluid_Dynamics.txt).

---

## 🔗 Referencias y Proyectos Base (Fork Origins)

Este proyecto es un **fork evolucionado y reestructurado**, construido a partir de los siguientes repositorios y publicaciones académicas de referencia:

1. **[WebGL-Fluid-Simulation](https://github.com/paveldogreat/WebGL-Fluid-Simulation)** de [Pavel Dobryakov](https://github.com/paveldogreat) *(Base canónica de simulación en WebGL)*.
2. **[fluids-2d](https://github.com/mharrys/fluids-2d)** de [Mark J. Harris](https://github.com/mharrys) *(Implementación C++/OpenGL de referencia para GPU Gems)*.
3. **[GPU-Fluid-Experiments](https://github.com/haxiomic/GPU-Fluid-Experiments)** de [Haxiomic](https://github.com/haxiomic) *(Experimentos de interacción e iluminación de fluidos)*.
4. **[NVIDIA GPU Gems Capítulo 38: Fast Fluid Dynamics Simulation on the GPU](https://developer.nvidia.com/gpugems/gpugems/part-vi-beyond-triangles/chapter-38-fast-fluid-dynamics-simulation-gpu)** por Mark J. Harris (University of North Carolina at Chapel Hill).

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
| :--- | :--- |
| **`[1]`** | Modo Fluido 3D |
| **`[2]`** | Modo Arena Granular (Reloj de Arena) |
| **`[3]`** | Modo Gas / Humo Espacial |
| **`[H]`** | **Modo Zen** (Ocultar / Mostrar toda la interfaz) |
| **`[M]`** | Abrir / Cerrar Menú Hamburguesa de Ajustes |
| **`[S]`** | Detonar Supernova (1 Clic) |
| **`[V]`** | Inyectar Vórtice (1 Clic) |
| **`[G]`** | Alternar Gravedad de Cascada (ON / OFF) |
| **`[C]`** | Cambiar Paleta de Color Activa |
| **`[Espacio]`** | Pausar / Reanudar Flujo Físico |
| **`[Del]` / `[Backspace]`** | Limpiar Lienzo |

---

## 🚀 Cómo Ejecutar

### Opción 1: Doble Clic (100% Offline)
Simplemente haz doble clic en `index.html` en tu explorador de archivos. No requiere dependencias, terminal ni servidor web.

### Opción 2: Servidor Local (para PWA)
```bash
# Con Python
python3 -m http.server 8080

# Con Node.js / npx
npx serve .
```
Abre `http://localhost:8080` en tu navegador.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

Copyright (c) 2017 Pavel Dobryakov  
Mejoras y arquitectura modular por Estudio Memexicanisimos.
