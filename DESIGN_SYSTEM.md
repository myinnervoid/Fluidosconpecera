# DESIGN_SYSTEM.md — Sistema de Diseño Aetheria

Sistema visual y tokens de diseño extraídos del entorno Glassmorphic y Canvas de Aetheria.

---

## 1. Tokens de Color (Color Palette Tokens)

### Colores Base de Superficie y Vidrio (Glassmorphic Neutral Surfaces)
```css
--bg-dark:            #07090e;                      /* Fondo profundo / Canvas backdrop */
--bg-panel:           rgba(14, 18, 28, 0.82);       /* Superficie panel con saturación */
--bg-btn:             rgba(255, 255, 255, 0.08);    /* Botón neutro reposo */
--bg-btn-hover:       rgba(255, 255, 255, 0.16);    /* Botón hover */
--bg-btn-active:      rgba(0, 242, 254, 0.25);      /* Botón seleccionado/activo */

--border-glass:       rgba(255, 255, 255, 0.14);    /* Borde sutil traslúcido */
--border-glow:        rgba(0, 242, 254, 0.50);      /* Resplandor hover */
--border-glow-active: #00f2fe;                      /* Borde activo */
```

### Colores Semánticos y Resplandores (Accent & Glow Tokens)
```css
--accent-cyan:        #00f2fe;    /* Color primario interactivo / Fluido */
--accent-magenta:     #ff007f;    /* Supernova / Energía */
--accent-green:       #00f5d4;    /* Vórtice / Gas / Éter */
--accent-gold:        #ffbe0b;    /* Gravedad / Calor */
--accent-purple:      #9d4edd;    /* Paleta / Seda mística */
--accent-danger:      #ff4757;    /* Pausa / Limpiar */
```

### Jerarquía Tipográfica de Color
```css
--text-main:          #f8fafc;    /* Alto contraste (Titulares y valores) */
--text-muted:         #94a3b8;    /* Contraste medio (Etiquetas secundarias) */
--text-dim:           #64748b;    /* Contraste bajo (Grupos de herramientas) */
```

---

## 2. Tipografía (Typography Stack)

Aetheria utiliza un **System Font Stack** optimizado de carga inmediata (cero peticiones de red externas):

```css
--font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

### Escala de Tamaños
* **Display / Brand:** `0.95rem` (15.2px) | Peso: `800` | Tracking: `2px` | Gradiente Cyan-Magenta
* **H3 Panel Header:** `0.95rem` (15.2px) | Peso: `700` | Tracking: `0.5px`
* **H4 Section Title:** `0.75rem` (12.0px) | Peso: `700` | Tracking: `1px` (Uppercase)
* **Button Text:** `0.78rem` (12.5px) | Peso: `600` | Tracking: `0.3px`
* **Label / Badge:** `0.65rem` (10.4px) | Peso: `700` | Tracking: `1px` (Uppercase)
* **Mono Value:** `0.75rem` (12.0px) | Peso: `600` (Mono)

---

## 3. Espaciado, Bordes y Elevación (Spacings & Elevation)

### Radios de Borde (Border Radius)
* `border-radius: 20px;` (Toolbar flotante y Drawer de ajustes)
* `border-radius: 12px;` (Botones de herramientas y fidgets)
* `border-radius: 10px;` (Tarjetas de paleta)
* `border-radius: 50%;` (Swatches y cursores de simetría)

### Sombras y Resplandores (Elevation / Shadows)
* **Panel Glass:** `0 12px 36px 0 rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)`
* **Active Glow:** `0 0 20px rgba(0, 242, 254, 0.60)`
* **Backdrop Blur:** `blur(20px) saturate(180%)`

---

## 4. Estados de Componentes (Component States)

| Componente | Reposo (Default) | Hover | Active / Focus | Disabled |
| :--- | :--- | :--- | :--- | :--- |
| **Tool Button** | Borde `0.14` alfa, Fondo `0.08` | `translateY(-2px)`, Borde `0.35` | Fondo Cyan `0.25`, Sombra Glow | Opacidad `0.4`, `cursor: not-allowed` |
| **Fidget Button** | Borde acentuado de color suave | Sombra intensa de color | `scale(0.92)` en clic | - |
| **Slider Range** | Pista `0.12` alfa, Pulgar Cyan | Pulgar `scale(1.2)` | Resplandor en foco | - |
| **Palette Card** | Fondo `0.05` alfa | Fondo `0.10` alfa, `translateY(-1px)` | Borde Cyan, Sombra `0 0 12px` | - |
