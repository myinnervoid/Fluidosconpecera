# DECISIONS.md — Registro de Decisiones de Arquitectura (ADR) & Matriz de Trade-offs

**Proyecto:** Aetheria Fluid & Generative Studio  
**Versión:** `1.6.1`  
**Estándar:** Motor Autónomo de Auditoría y Evolución v3.1  

---

## 1. Registro de Decisiones de Arquitectura (ADR)

### ADR-01: Implementación de Contratos de Datos Formales y Catálogo de Errores
* **Contexto / Problema:** La aplicación carecía de contratos de tipos formales y utilizaba strings ad-hoc para advertencias de consola y mensajes de error, dificultando la predictibilidad, la depuración y el cumplimiento del estándar de arquitectura de 5 vectores.
* **Decisión Adoptada:** Crear un módulo centralizado `js/contracts.js` con tipado formal JSDoc, esquemas de validación de objetos en tiempo de ejecución, el estándar de transporte `ApiResponse<T>` y un catálogo canónico `AetheriaErrorCatalog` (`ERR_WEBGL_UNSUPPORTED`, `ERR_CONTEXT_LOST`, `ERR_RECORDER_UNSUPPORTED`, `ERR_INVALID_FILE_TYPE`, etc.).
* **Consecuencias Positivas:**
  - Garantiza consistencia en toda la pila de extensiones.
  - Elimina fallos silenciosos y errores no tipados.
  - Facilita pruebas automatizadas y extensiones futuras.
* **Consecuencias Negativas:**
  - Requiere envolver llamadas de exportación y carga en el nuevo formato estándar.

---

### ADR-02: Autómata Finito de Interfaz (`UIStateMachine`) de 5 Estados
* **Contexto / Problema:** La UI gestionaba los estados mediante conmutación manual de clases CSS dispersas en `ui.js`, sin un modelo de estados explícito para operaciones asíncronas (precarga de fondos, exportación PNG, grabación de video).
* **Decisión Adoptada:** Incorporar un despachador de máquina de estados finita que gestione formalmente el ciclo de vida de cada subsistema interactivo a través de los cinco estados canónicos: `[IDLE]`, `[PENDING]`, `[SUCCESS]`, `[EMPTY]`, `[FAULT]`.
* **Consecuencias Positivas:**
  - Manejo determinista de estados de carga y feedback visual inmediato al usuario.
  - Mapeo 1:1 entre códigos de error del sistema y mensajes accesibles en pantalla.
  - Imposibilidad de estados transitorios inválidos (ej. iniciar dos grabaciones simultáneas o pintar durante la apertura del drawer).
* **Consecuencias Negativas:**
  - Leve incremento en líneas de código del controlador de UI (~80 líneas).

---

### ADR-03: Guardia Activa de Contexto WebGL (`WEBGL_lose_context`)
* **Contexto / Problema:** En dispositivos móviles con GPU suspendida o drivers reiniciados, el render loop intentaba emitir draw calls continuas antes de que el evento de pérdida de contexto se propagara, arrojando advertencias en cascada en la consola.
* **Decisión Adoptada:** Introducir un método `FluidCore.isContextLost()` que verifique `gl.isContextLost()` de forma preventiva antes de cada `step()` y `render()`, pausando el loop y notificando a `UIStateMachine` en estado `[FAULT]`.
* **Consecuencias Positivas:**
  - Cero spam de errores en consola durante suspensión del sistema operativo.
  - Recuperación limpia y automática cuando el contexto se restaura.
* **Consecuencias Negativas:**
  - Micro-verificación booleana en el bucle principal (impacto despreciable $< 0.001\text{ ms}$).

---

### ADR-04: Suite de Pruebas Autónomas en el Navegador (Cero Dependencias de Node.js)
* **Contexto / Problema:** El proyecto es 100% autónomo y funciona sobre protocolo `file://`. Instalar jest/mocha con dependencias de Node.js rompería la portabilidad standalone.
* **Decisión Adoptada:** Construir un Test Harness nativo en el navegador (`tests/test_runner.html` y `tests/aetheria_spec.js`) que ejecuta aserciones síncronas y asíncronas sobre contratos, invariantes físicas, cálculo de rotación de avatares y respuestas de error.
* **Consecuencias Positivas:**
  - Ejecutable tanto en servidor local como abriendo el archivo HTML directamente en el navegador.
  - Cero dependencias npm/node requeridas.
  - Cobertura verificable de contratos, física y shaders.
* **Consecuencias Negativas:**
  - Requiere mantener el micro-runner de pruebas propio.

---

## 2. Matriz de Trade-offs

| Decisión Técnica | Beneficio Directo | Costo / Penalización | Alternativa Descartada | Razón del Rechazo |
| :--- | :--- | :--- | :--- | :--- |
| **Contratos en JS Nativo + JSDoc (`js/contracts.js`)** | Cero proceso de build (funciona en `file://` y GitHub Pages sin bundler) con tipado robusto. | No hay chequeo de tipos estático estricto en tiempo de compilación tipo `tsc`. | Migración total a TypeScript con Webpack / Vite. | Requiere toolchain de Node.js, perdiendo la filosofía de código puro y ejecución standalone sin build. |
| **Autómata de UI con 5 Estados Canónicos** | Predecibilidad total en operaciones asíncronas y accesibilidad mejorada. | Mayor estructura y control en el despachador de eventos UI. | Event listeners ad-hoc con flags booleanos locales. | Propenso a condiciones de carrera y estados inconsistentes durante carga de imágenes pesadas. |
| **Guardia `isContextLost()` en Render Loop** | Resiliencia total ante suspensión móvil o cuelgues temporales del driver GPU. | Chequeo booleano por frame. | Dejar que el listener pasivo de canvas maneje el error. | Arroja ráfagas de errores en consola antes de que el evento pasivo del navegador se active. |
| **Test Runner Nativo en HTML/JS (`tests/`)** | Pruebas ejecutables en cualquier navegador sin instalar Node ni paquetes npm. | Esfuerzo de implementar un harness de aserción ligero. | Frameworks pesados de Node.js (Jest, Vitest, Playwright). | Obliga a los desarrolladores a tener Node.js instalado para validar la suite básica. |
| **Standard `ApiResponse<T>` en Exportaciones** | Estandarización unificada de respuestas y catálogo de códigos de error. | Envolver retornos en `{ success, data, error_code, message }`. | Retornar `true`/`false` o `void`. | No permite distinguir entre fallos de permiso, cuota de disco, formato inválido o soporte de API. |
