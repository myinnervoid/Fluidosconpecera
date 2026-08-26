# BACKEND_REVIEW.md — Auditoría de Arquitectura de Sistema y Motor GPU

**Rol:** Backend / System Engineer Senior (Auditoría)  
**Evaluación:** Motor WebGL Navier-Stokes (`fluidCore.js`), Coordinación de Memoria GPU y Ciclos de Vida de FBOs.

---

## 1. Diagnóstico de la Lógica Interna y Ciclo de Vida GPU

### Fortalezas de Ingeniería del Motor
1. **Separación Limpia de Pasadas de Shader:** El pipeline respeta rigurosamente el Teorema de Helmholtz-Hodge y la advección semi-Lagrangiana de Stam (GPU Gems Cap. 38).
2. **Ping-Pong FBOs Eficientes:** Las estructuras `createDoubleFBO` gestionan el swap de texturas de lectura y escritura en $\mathcal{O}(1)$ sin reasignación de memoria de GPU durante el render loop.
3. **Inyección Pre-Poisson Estable:** La aceleración `u_gravity` se añade dentro del shader de advección antes de divergence y Poisson, manteniendo la incompresibilidad $\nabla \cdot \mathbf{u} = 0$.

---

## 2. Hallazgos y Puntos de Riesgo del Sistema

### Hallazgo SYS-01: Falta de Destructores / Liberación de Recursos WebGL (Fuga de Memoria)
* **Severidad:** Media-Alta
* **Descripción:** `FluidCore` crea mallas, programas y hasta 9 texturas/FBOs flotantes en GPU durante `initFramebuffers()`. Sin embargo, la clase no expone un método `dispose()` / `destroy()` que llame a `gl.deleteTexture()`, `gl.deleteFramebuffer()`, `gl.deleteProgram()` y `gl.deleteBuffer()`.
* **Impacto:** Si la aplicación se embebe en una SPA o se reinicia el canvas dinámicamente, las texturas huérfanas permanecen en la VRAM de la tarjeta gráfica hasta que se destruye la pestaña del navegador.
* **Propuesta de Refactorización:**
  ```javascript
  dispose() {
    if (!this.gl) return;
    const gl = this.gl;
    // Liberar FBOs y Texturas
    [this.density, this.velocity, this.pressure].forEach(dfbo => {
      if (dfbo) {
        gl.deleteTexture(dfbo.read.texture);
        gl.deleteTexture(dfbo.write.texture);
        gl.deleteFramebuffer(dfbo.read.fbo);
        gl.deleteFramebuffer(dfbo.write.fbo);
      }
    });
    if (this.divergence) {
      gl.deleteTexture(this.divergence.texture);
      gl.deleteFramebuffer(this.divergence.fbo);
    }
    if (this.curlFBO) {
      gl.deleteTexture(this.curlFBO.texture);
      gl.deleteFramebuffer(this.curlFBO.fbo);
    }
    // Liberar Buffers y Programas
    if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
    Object.values(this.programs).forEach(p => {
      if (p && p.program) gl.deleteProgram(p.program);
    });
    this.isInitialized = false;
  }
  ```

### Hallazgo SYS-02: Gestión de Pérdida de Contexto WebGL (`WEBGL_lose_context`)
* **Severidad:** Media
* **Descripción:** Si el sistema operativo entra en suspensión o la GPU reinicia su driver por ahorro de energía, el contexto WebGL se pierde silenciosamente y el bucle `step(dt)` arroja advertencias sin recuperarse.
* **Solución Propuesta:**
  ```javascript
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn('WebGL Context Lost.');
  }, false);

  canvas.addEventListener('webglcontextrestored', () => {
    console.info('WebGL Context Restored. Reconstruyendo shaders y FBOs...');
    this.init(canvas);
  }, false);
  ```

### Hallazgo SYS-03: Paso de Uniformes booleanos como enteros (`gl.uniform1i`)
* **Severidad:** Baja (Estilo/Optimización)
* **Descripción:** En `advectionShader` y `displayShader`, variables como `isVelocity` y `uShading` se envían como `int` y se evalúan mediante `if (isVelocity == 1)`. En GPUs móviles antiguas, las bifurcaciones dinámicas (*branching*) en shaders de fragmentos pueden penalizar el rendimiento.
* **Solución:** Utilizar constantes o compilar variantes especializadas de shader si se busca exprimir microsegundos en hardware embebido.
