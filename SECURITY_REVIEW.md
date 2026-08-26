# SECURITY_REVIEW.md — Auditoría de Seguridad de Aplicaciones (AppSec)

**Rol:** Application Security Engineer (AppSec - Auditoría)  
**Modelo de Amenazas:** STRIDE / LINDDUN aplicado a Client-Side WebGL Graphics Application.

---

## 1. Análisis de Vectores de Ataque y Matriz STRIDE

| Categoría STRIDE | Vector Evaluado | Nivel de Riesgo | Estado y Mitigación Actual |
| :--- | :--- | :--- | :--- |
| **Spoofing (Suplantación)** | Inyección de identidad o sesiones | **N/A** | La aplicación es 100% client-side, sin autenticación ni endpoints remotos. |
| **Tampering (Manipulación)** | Inyección de Shaders maliciosos / Código GLSL | **Bajo** | Todos los shaders están hardcodeados como plantillas estáticas inmutables. No se permite compilación de código GLSL arbitrario introducido por el usuario. |
| **Repudiation (Repudio)** | Trazabilidad de transacciones | **N/A** | No existen transacciones ni almacenamiento persistente de datos de usuario. |
| **Information Disclosure (Fuga de Información)** | Extracción de datos o cookies | **Inexistente** | No se utilizan cookies, `localStorage`, ni telemetría externa. La textura `LDR_LLL1_0.png` es local. |
| **Denial of Service (DoS)** | Saturación de memoria GPU / Crash del Driver | **Bajo-Medio** | **Mitigado:** Se ha implementado un límite estricto (*splat throttle*) de 16 splats/frame y watchdog de frames (>150ms) para evitar congelamientos de GPU por multitouch masivo. |
| **Elevation of Privilege (Elevación de Privilegio)** | Ejecución de comandos del sistema | **Inexistente** | Ejecución en el sandbox nativo del navegador sin APIs de acceso al sistema de archivos local (`FileSystem API`). |

---

## 2. Hallazgos Específicos y Recomendaciones

### SEC-01: Ausencia de Cabecera Content Security Policy (CSP)
* **Severidad:** Baja (Preventiva)
* **Riesgo:** Si la aplicación se aloja en un servidor web público sin cabecera CSP, se vuelve vulnerable a inyecciones de scripts de terceros o ataques de tipo Clickjacking.
* **Mitigación Recomendada:** Añadir la metaetiqueta CSP restrictiva en [index.html](file:///home/myinnervoid/Estudio%20Memexicanisimos/Fluidos/index.html):
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self';">
  ```

### SEC-02: Exportación de Archivos Blob / Sanitización de Nombres
* **Severidad:** Informativa
* **Ubicación:** `js/main.js` (`exportPNG`)
* **Análisis:** El nombre del archivo exportado se genera automáticamente con `new Date().toISOString()`. Es seguro y libre de inyecciones de caracteres ilegales o rutas de escape (`../`).
