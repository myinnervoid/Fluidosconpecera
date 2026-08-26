# LEGAL_PRIVACY.md — Asesoría Legal, Licenciamiento y Privacidad

**Rol:** Asesor Legal y de Privacidad para Software Interactivo / Hobbie  
**Evaluación:** Flujo de Datos, Licenciamiento de Dependencias y Requisitos de Publicación.

---

## 1. Auditoría de Licenciamiento y Atribuciones

### 1. Código Base de Pavel Dobryakov (WebGL Fluid Simulation)
* **Licencia Aplicable:** **MIT License** (Copyright © 2017 Pavel Dobryakov).
* **Obligaciones Legales:** La licencia MIT permite el uso, modificación, distribución, sublicencia y uso comercial sin costo, con **una única condición irrenunciable:**
  > *"The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software."*
* **Estado en Aetheria:** ✅ **CUMPLIDO**. El archivo `LICENSE` original permanece en la raíz del proyecto y debe conservarse íntegramente en cualquier distribución o repositorio derivado.

### 2. Algoritmos Matemáticos de GPU Gems Capítulo 38
* **Autores:** Mark J. Harris (UNC Chapel Hill) y Jos Stam (Alias/Wavefront).
* **Publicación:** *GPU Gems: Programming Techniques, Tips, and Tricks for Real-Time Graphics* (NVIDIA / Addison-Wesley, 2004).
* **Estado:** Los conceptos matemáticos de Navier-Stokes y algoritmos de diferencias finitas son de dominio público. Se incluye la debida referencia bibliográfica en la documentación técnica del proyecto.

### 3. Conceptos Generativos de Weavesilk y PICO-8
* **Weavesilk:** Silk generativo (concepto original de Yuri Vishnevsky). Aetheria implementa una recreación matemática propia desde cero basada en muelles armónicos en Canvas 2D.
* **Paleta PICO-8:** La paleta de 16 colores es de uso estándar en la comunidad indie/retro.

---

## 2. Auditoría de Privacidad y Flujo de Datos (GDPR / CCPA / LFPDPPP)

* **Recolección de Datos Personales:** **0% (Cero)**. No se solicitan nombres, correos electrónicos, identificadores de dispositivo, IP ni geolocalización.
* **Almacenamiento Local:** No se escriben cookies de rastreo ni `localStorage`.
* **Telemetría / Analíticas:** Se han eliminado por completo las llamadas a `google-analytics.com` que existían en el fork antiguo móvil.
* **Aviso de Privacidad:** Al no existir tratamiento de datos personales, la aplicación está **exenta de la obligación de publicar políticas de privacidad** bajo el RGPD (GDPR) y la CCPA.

---

## 3. Checklist de Publicación en Tiendas (Google Play / App Store / Web PWA)

- [x] Licencia MIT visible y preservada en el paquete de distribución.
- [x] Ausencia de permisos peligrosos (no requiere cámara, micrófono, contactos ni almacenamiento sensible).
- [x] Clasificación por edades sugerida: **PEGI 3 / Everyone (E)** (contenido de arte abstracto sin violencia ni temas sensibles).
- [ ] En caso de empaquetar para Google Play / App Store (vía Capacitor/Cordova), declarar *"No se recopilan datos del usuario"* en el cuestionario de Seguridad de los Datos (*Data Safety Section*).
