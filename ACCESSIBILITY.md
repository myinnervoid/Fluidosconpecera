# ACCESSIBILITY.md — Auditoría de Accesibilidad (WCAG 2.2 Nivel AA)

**Proyecto:** Aetheria Fluid Studio  
**Versión:** `1.6.0`  
**Evaluación:** Contraste de Color, Foco Visible, Semántica ARIA, Objetivos Táctiles y Reducción de Movimiento.

---

## 1. Matriz de Cumplimiento WCAG 2.2 AA

| Criterio WCAG | Descripción | Estado en v1.6.0 | Implementación |
| :--- | :--- | :--- | :--- |
| **1.4.3 Contraste** | Ratio mínimo de 4.5:1 en texto. | ✅ **CUMPLIDO** | Texto en `#f8fafc` y `#94a3b8` sobre fondo `#07090e` con ratio > 8.5:1. |
| **2.4.7 Foco Visible** | Indicador claro al navegar con teclado (`Tab`). | ✅ **CUMPLIDO** | Anillo de enfoque de alto contraste (`outline: 2px solid var(--accent-cyan)` con `outline-offset: 3px`). |
| **2.5.5 Tamaño de Objetivo Táctil** | Mínimo $44 \times 44\text{ px}$ en dispositivos táctiles. | ✅ **CUMPLIDO** | Botones del top bar, drawer y selector de fondos configurados con altura mínima $\ge 44\text{px}$. |
| **2.3.3 Reducción de Movimiento** | Respeto a `prefers-reduced-motion`. | ✅ **CUMPLIDO** | `@media (prefers-reduced-motion: reduce)` desactiva transiciones y animaciones oscilantes. |
| **4.1.2 Nombre, Función y Valor** | Roles ARIA en lectores de pantalla. | ✅ **CUMPLIDO** | `aria-pressed`, `aria-expanded`, `aria-live="polite"` en `#toast-container` y `aria-hidden="true"` en elementos decorativos. |

---

## 2. Soporte de Teclado y Screen Readers
* **Navegación completa sin ratón:** Mediante la tecla `Tab`, `Espacio` y `Enter` es posible abrir el Drawer, alternar los modos de simulación, cambiar fondos y seleccionar paletas.
* **Atajos globales de una sola pulsación:** [1-4], [H], [A], [S], [V], [G], [C], [Espacio], [Del].
