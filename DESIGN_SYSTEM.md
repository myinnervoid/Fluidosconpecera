# DESIGN_SYSTEM.md — Sistema de Diseño Aetheria (Sanzo Wada × Meximalismo v2.2.0)

Sistema visual y tokens de diseño de **Fluidos Studio (Aetheria)**, alineado al 100% con el [MANUAL_ARMONIA_CROMATICA_WADA_MEXICO.md](file:///home/myinnervoid/Estudio%20Memexicanisimos/MANUAL_ARMONIA_CROMATICA_WADA_MEXICO.md) (159 pigmentos base de Sanzo Wada y el Canon del Rotulismo Popular Mexicano).

---

## 1. Proporción Áurea 60-30-10 y Tokens Cromáticos

### 60% Dominante: Cielo Nocturno & Obsidiana (FAM-07)
```css
--bg-dark:            #051230;                      /* Deep Indigo (Wada) — Lienzo y cielo nocturno */
--bg-obsidian:        #111314;                      /* Obsidian — Sombra dura de recorte */
--bg-panel:           rgba(5, 18, 48, 0.92);        /* Consola principal de estudio */
--bg-drawer:          rgba(5, 18, 48, 0.96);        /* Tablero arquitectónico de configuración */
```

### 30% Estructura Secundaria: Talavera, Cal & Latón (FAM-04 / FAM-08)
```css
--bg-card:            rgba(18, 53, 78, 0.72);       /* Dark Tyrian Blue (#12354e) */
--bg-card-hover:      rgba(18, 53, 78, 0.95);       /* Superficie activa de tarjeta */
--blanco-hueso:       #f5ecc2;                      /* Sulpher Yellow — Cal viva y filetes de luz */
--border-glass:       rgba(245, 236, 194, 0.28);    /* Filete de cal (>3:1 contraste no-textual) */
--border-brass:       rgba(139, 131, 91, 0.55);     /* Dark Citrine (#8b835b) — Bisel de latón */
```

### 10% Acentos de Ignición: Tríada del Rótulo & Cenote (FAM-01 / FAM-02 / FAM-05)
```css
--accent-carmine:     #cc1236;    /* Carmine — Rojo Tocino de llamado */
--accent-primary:     #dd4027;    /* Red Orange — Rojo Enchilada / Cinabrio */
--accent-active:      #ffdd00;    /* Apricot Yellow — Amarillo Canario radiante */
--accent-gold:        #f37420;    /* Orange — Naranja Cempasúchil */
--accent-amber:       #f99d1b;    /* Amber Yellow — Oro Solar */
--accent-green:       #00b49b;    /* Sea Green — Jade de Cenote / Quetzal */
--accent-maya:        #0093a5;    /* Cerulian Blue — Azul Maya */
--accent-cobalt:      #006eb8;    /* Cobalt Blue — Sombra de Rótulo */
--accent-olympic:     #005b8d;    /* Olympic Blue — Contorno profundo */
--accent-grenadine:   #f48067;    /* Grenadine Pink — Coral cálido */
```

> **Regla Anti-Morado de Plantilla IA:** Queda prohibido el uso de morados/violetas sintéticos (`#7B1FA2`, `#8A2BE2`, `#9B51E0`, `#9d4edd`) y negros puros en titulares.

---

## 2. Tipografía y Regla Sagrada Anti-Negro

* **Brand / Rótulo (`--font-display`):** `"Arial Black", "Impact", system-ui, sans-serif` — Titulado en **Amarillo Canario (`#ffdd00`)** con sombra dura 3D escalonada en **Rojo Carmín (`#cc1236`)** y **Azul Olímpico (`#005b8d`)**.
* **UI Principal (`--font-main`):** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` en **Blanco Hueso (`#f5ecc2`)**.
* **Valores de Telemetría (`--font-mono`):** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` en medallas de alto contraste (`#ffdd00` sobre `#12354e`).

---

## 3. Elevación Meximalista (Layering & Sombra Dura 3D)

* **Sombra de Rótulo Corta (`--shadow-rotulo-sm`):** `1px 1px 0px #051230, 2px 2px 0px #111314, 3px 3px 0px #000000`
* **Sombra de Rótulo Media (`--shadow-rotulo-md`):** `2px 2px 0px #005b8d, 4px 4px 0px #111314`
* **Estado Activo (`--shadow-active`):** `0 0 18px rgba(255, 221, 0, 0.45), 2px 2px 0px #cc1236`
* **Accesibilidad WCAG 2.2 AA:** Soporte nativo para `color-scheme: dark`, `accent-color: #ffdd00`, `@media (forced-colors: active)` y `@media (prefers-reduced-motion: reduce)`.
