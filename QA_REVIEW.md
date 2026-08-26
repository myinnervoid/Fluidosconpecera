# QA_REVIEW.md — Auditoría de Calidad de Software, Casos Borde y Pruebas

**Proyecto:** Aetheria Fluid Studio  
**Versión:** `1.6.0`  
**Evaluación:** Matriz de Casos Borde, Fondos Adaptativos, Boids Swarm y Simetría.

---

## 1. Matriz de Casos Borde Evaluados en v1.6.0

| Escenario de Prueba | Procedimiento y Entrada | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- |
| **TC-01: Fondos Adaptativos (16:9 $\leftrightarrow$ 9:16)** | Cambiar entre orientación horizontal (desktop) y vertical (móvil). | El gestor `AetheriaBackground` detecta el cambio de aspecto con debounce y actualiza la imagen a `_9_16.jpeg` o `_16_9.jpeg` sin recargar la página. | ✅ **APROBADO** |
| **TC-02: Transparencia WebGL sobre Fondo** | Pintar sobre la alberca, el cenote o el universo. | El fluido se mezcla sobre la imagen con sombreado 3D y alpha blending; las zonas sin fluido revelan la imagen limpia. | ✅ **APROBADO** |
| **TC-03: Interacción de los 6 Punteros** | Seleccionar sucesivamente `none`, `nyan`, `rocket`, `comet`, `clownfish`, `miku` y arrastrar. | El avatar visual sigue al cursor con orientación angular $360^\circ$ suave; los splats del usuario usan color sólido de la paleta activa. | ✅ **APROBADO** |
| **TC-04: Modo Automático "Pecera"** | Activar Swarm con 10 Boids y dejarlos correr durante 15 minutos. | Los Boids rebotan suavemente dentro del margen del 8% sin cruzar los bordes de la pantalla ni saturar a blanco. | ✅ **APROBADO** |
| **TC-05: Simetría Radial + Boids (Bug #2)** | Activar simetría 8x con el Swarm en ejecución. | Tanto los clics del usuario como los Boids generan mandalas de 8 ejes coordinados; los Boids se auto-regulan a 3 para 60 FPS. | ✅ **APROBADO** |
| **TC-06: Modo Arena Granular sobre Fondo** | Activar Modo Arena sobre fondo de Mar Caribe / Universo. | Los granos de arena caen dejando ver el fondo a través de las celdas vacías sin parpadeo. | ✅ **APROBADO** |
| **TC-07: Resiliencia de GPU Context Loss** | Forzar `webglcontextlost`. | El sistema captura el evento, muestra un aviso y recarga limpiamente sin bloquear la pestaña. | ✅ **APROBADO** |

---

## 2. Pruebas de Compatibilidad de Plataforma

* **Navegadores Desktop:** Google Chrome 115+, Microsoft Edge 115+, Mozilla Firefox 118+, Apple Safari 16+.
* **Dispositivos Móviles:** Android Chrome (PWA / Touch 10 dedos) e iOS Safari (gestos superiores y modo Zen).
* **Entornos Standalone:** Protocolo `file:///` 100% libre de errores CORS.
