/**
 * AETHERIA | FluidCore (Navier-Stokes GPU Simulation Engine)
 * Extracted and encapsulated from PavelDoGreat's WebGL-Fluid-Simulation & GPU Gems 38.
 * Pure WebGL physics engine: GUI decoupled, u_gravity pre-Poisson support, velocity clamping,
 * WebGL context loss recovery, and full VRAM disposal lifecycle.
 */

(function (root) {
  'use strict';

  class FluidSimulationEngine {
    constructor() {
      this.canvas = null;
      this.gl = null;
      this.ext = null;
      this.isInitialized = false;

      // Default configuration parameters
      this.config = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        CAPTURE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 0.98,
        VELOCITY_DISSIPATION: 0.2,
        PRESSURE: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 30.0,
        SPLAT_RADIUS: 0.25,
        SPLAT_FORCE: 6000,
        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 10,
        PAUSED: false,
        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: false,
        BLOOM: true,
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.8,
        BLOOM_THRESHOLD: 0.6,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: true,
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 1.0,
        GRAVITY: { x: 0.0, y: 0.0 }
      };

      this.pointers = [];
      this.splatStack = [];
      this.lastUpdateTime = performance.now();
      this.colorUpdateTimer = 0.0;
      this.ditheringTexture = null;
      this.boundContextLost = null;
      this.boundContextRestored = null;
    }

    init(canvas) {
      this.canvas = canvas;
      this.resizeCanvas();

      const contextData = this.getWebGLContext(this.canvas);
      this.gl = contextData.gl;
      this.ext = contextData.ext;

      if (!this.ext.supportLinearFiltering) {
        this.config.DYE_RESOLUTION = 512;
        this.config.SHADING = false;
        this.config.BLOOM = false;
        this.config.SUNRAYS = false;
      }

      this.initDitheringTexture();
      this.initShaders();
      this.initFramebuffers();
      this.bindContextLossEvents();

      this.isInitialized = true;
    }

    bindContextLossEvents() {
      if (!this.canvas) return;

      if (!this.boundContextLost) {
        this.boundContextLost = (e) => {
          e.preventDefault();
          console.warn('FluidCore: WebGL Context Lost.');
          this.isInitialized = false;
        };
        this.canvas.addEventListener('webglcontextlost', this.boundContextLost, false);
      }

      if (!this.boundContextRestored) {
        this.boundContextRestored = () => {
          console.info('FluidCore: WebGL Context Restored. Reconstruyendo recursos GPU...');
          this.init(this.canvas);
        };
        this.canvas.addEventListener('webglcontextrestored', this.boundContextRestored, false);
      }
    }

    resizeCanvas() {
      const width = this.canvas.clientWidth || window.innerWidth;
      const height = this.canvas.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (this.canvas.width !== Math.floor(width * dpr) || this.canvas.height !== Math.floor(height * dpr)) {
        this.canvas.width = Math.floor(width * dpr);
        this.canvas.height = Math.floor(height * dpr);
        return true;
      }
      return false;
    }

    resize() {
      if (!this.isInitialized) return;
      if (this.resizeCanvas()) {
        this.initFramebuffers();
      }
    }

    getWebGLContext(canvas) {
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false
      };

      let gl = canvas.getContext('webgl2', params);
      const isWebGL2 = !!gl;
      if (!gl) {
        gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
      }

      if (!gl) {
        throw new Error('WebGL no está disponible en este dispositivo.');
      }

      let halfFloat;
      let supportLinearFiltering;
      if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
      } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
      }

      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat ? halfFloat.HALF_FLOAT_OES : gl.FLOAT);
      let formatRGBA, formatRG, formatR;

      if (isWebGL2) {
        formatRGBA = this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG = this.getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        formatR = this.getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
      } else {
        formatRGBA = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      }

      return {
        gl,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering
        }
      };
    }

    getSupportedFormat(gl, internalFormat, format, type) {
      if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
        switch (internalFormat) {
          case gl.R16F:
            return this.getSupportedFormat(gl, gl.RG16F, gl.RG, type);
          case gl.RG16F:
            return this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
          default:
            return null;
        }
      }
      return { internalFormat, format };
    }

    supportRenderTextureFormat(gl, internalFormat, format, type) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      return status === gl.FRAMEBUFFER_COMPLETE;
    }

    initDitheringTexture() {
      const gl = this.gl;
      this.ditheringTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.ditheringTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

      // Default 1x1 neutral noise until PNG loads
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));

      const image = new Image();
      image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, this.ditheringTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      };
      image.src = 'assets/LDR_LLL1_0.png';
    }

    initShaders() {
      const gl = this.gl;

      const baseVertexShader = `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `;

      const clearShader = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
        }
      `;

      const splatShader = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / max(radius, 0.00001)) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(clamp(base + splat, -3000.0, 3000.0), 1.0);
        }
      `;

      // Advection shader with u_gravity pre-Poisson injection and manual bilinear interpolation
      const advectionShader = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;
        uniform vec2 u_gravity;
        uniform int isVelocity;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tSize) {
          vec2 st = uv / tSize - 0.5;
          vec2 iuv = floor(st);
          vec2 fuv = fract(st);

          vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tSize);
          vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tSize);
          vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tSize);
          vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tSize);

          return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          vec4 result = bilerp(uSource, coord, dyeTexelSize);
          
          if (isVelocity == 1) {
            result.xy += u_gravity * dt;
            result.xy = clamp(result.xy, -3000.0, 3000.0);
          }

          float decay = 1.0 + dissipation * dt;
          gl_FragColor = result / decay;
        }
      `;

      const divergenceShader = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;

          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }

          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `;

      const curlShader = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `;

      const vorticityShader = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
          float L = texture2D(uCurl, vL).x;
          float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;

          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;

          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity += force * dt;
          velocity = clamp(velocity, -3000.0, 3000.0);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `;

      const pressureShader = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `;

      const gradientSubtractShader = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= 0.5 * vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `;

      // 3D Specular Shading and Tone-Mapping
      const displayShader = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform sampler2D uBloom;
        uniform sampler2D uSunrays;
        uniform sampler2D uDithering;
        uniform vec2 ditherScale;
        uniform vec2 texelSize;
        uniform int uShading;
        uniform vec3 uBgColor;

        vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0.0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0.0));
        }

        void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;

          if (uShading == 1) {
            vec3 lc = texture2D(uTexture, vL).rgb;
            vec3 rc = texture2D(uTexture, vR).rgb;
            vec3 tc = texture2D(uTexture, vT).rgb;
            vec3 bc = texture2D(uTexture, vB).rgb;

            float dx = length(rc) - length(lc);
            float dy = length(tc) - length(bc);

            vec3 n = normalize(vec3(dx, dy, length(texelSize)));
            vec3 l = vec3(0.0, 0.0, 1.0);

            float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
            c *= diffuse;
          }

          vec3 bloom = texture2D(uBloom, vUv).rgb;
          vec3 sunrays = texture2D(uSunrays, vUv).rgb;
          c += bloom;
          c += sunrays * 0.4;

          vec2 ditherUv = vUv * ditherScale;
          float noise = texture2D(uDithering, ditherUv).r * 2.0 - 1.0;
          c += noise / 255.0;

          // Mix with deep background
          float lum = max(c.r, max(c.g, c.b));
          vec3 finalColor = mix(uBgColor, c, clamp(lum * 1.5, 0.0, 1.0));

          gl_FragColor = vec4(linearToGamma(finalColor), 1.0);
        }
      `;

      this.programs = {
        clear: this.createProgram(baseVertexShader, clearShader),
        splat: this.createProgram(baseVertexShader, splatShader),
        advection: this.createProgram(baseVertexShader, advectionShader),
        divergence: this.createProgram(baseVertexShader, divergenceShader),
        curl: this.createProgram(baseVertexShader, curlShader),
        vorticity: this.createProgram(baseVertexShader, vorticityShader),
        pressure: this.createProgram(baseVertexShader, pressureShader),
        gradientSubtract: this.createProgram(baseVertexShader, gradientSubtractShader),
        display: this.createProgram(baseVertexShader, displayShader)
      };

      this.quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    }

    createProgram(vertexSource, fragmentSource) {
      const gl = this.gl;
      const program = gl.createProgram();

      const vShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
      const fShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);

      gl.attachShader(program, vShader);
      gl.attachShader(program, fShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error al linkear shader program:', gl.getProgramInfoLog(program));
        return null;
      }

      const uniforms = {};
      const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const uniformInfo = gl.getActiveUniform(program, i);
        uniforms[uniformInfo.name] = gl.getUniformLocation(program, uniformInfo.name);
      }

      return {
        program,
        uniforms,
        bind: () => gl.useProgram(program)
      };
    }

    compileShader(type, source) {
      const gl = this.gl;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error al compilar shader:', gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    }

    createTexture(width, height, formatObj, minFilter, magFilter) {
      const gl = this.gl;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, formatObj.internalFormat, width, height, 0, formatObj.format, this.ext.halfFloatTexType, null);
      return texture;
    }

    createFBO(width, height, formatObj, minFilter, magFilter) {
      const gl = this.gl;
      const texture = this.createTexture(width, height, formatObj, minFilter, magFilter);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      return {
        texture,
        fbo,
        width,
        height,
        texelSizeX: 1.0 / width,
        texelSizeY: 1.0 / height,
        attach: (id) => {
          gl.activeTexture(gl.TEXTURE0 + id);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          return id;
        }
      };
    }

    createDoubleFBO(width, height, formatObj, minFilter, magFilter) {
      let fbo1 = this.createFBO(width, height, formatObj, minFilter, magFilter);
      let fbo2 = this.createFBO(width, height, formatObj, minFilter, magFilter);

      return {
        width,
        height,
        texelSizeX: 1.0 / width,
        texelSizeY: 1.0 / height,
        get read() { return fbo1; },
        set read(val) { fbo1 = val; },
        get write() { return fbo2; },
        set write(val) { fbo2 = val; },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        }
      };
    }

    initFramebuffers() {
      const gl = this.gl;
      const ext = this.ext;

      const simRes = this.getResolution(this.config.SIM_RESOLUTION);
      const dyeRes = this.getResolution(this.config.DYE_RESOLUTION);

      const linear = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

      this.density = this.createDoubleFBO(dyeRes.width, dyeRes.height, ext.formatRGBA, linear, linear);
      this.velocity = this.createDoubleFBO(simRes.width, simRes.height, ext.formatRG, linear, linear);
      this.divergence = this.createFBO(simRes.width, simRes.height, ext.formatR, gl.NEAREST, gl.NEAREST);
      this.curlFBO = this.createFBO(simRes.width, simRes.height, ext.formatR, gl.NEAREST, gl.NEAREST);
      this.pressure = this.createDoubleFBO(simRes.width, simRes.height, ext.formatR, gl.NEAREST, gl.NEAREST);
    }

    getResolution(resolution) {
      const gl = this.gl;
      let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

      const min = Math.round(resolution);
      const max = Math.round(resolution * aspectRatio);

      if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
        return { width: max, height: min };
      } else {
        return { width: min, height: max };
      }
    }

    blit(targetFBO = null) {
      const gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      if (targetFBO == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, targetFBO.width, targetFBO.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, targetFBO.fbo);
      }

      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    splat(x, y, dx, dy, color) {
      if (!this.isInitialized) return;
      const gl = this.gl;
      const p = this.programs.splat;
      p.bind();

      const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
      const rad = (this.config.SPLAT_RADIUS / 100.0) * (aspectRatio > 1 ? aspectRatio : 1.0);

      // Splat Velocity
      gl.uniform1i(p.uniforms.uTarget, this.velocity.read.attach(0));
      gl.uniform1f(p.uniforms.aspectRatio, aspectRatio);
      gl.uniform2f(p.uniforms.point, x, y);
      gl.uniform3f(p.uniforms.color, dx, dy, 0.0);
      gl.uniform1f(p.uniforms.radius, rad);
      this.blit(this.velocity.write);
      this.velocity.swap();

      // Splat Dye Color
      gl.uniform1i(p.uniforms.uTarget, this.density.read.attach(0));
      gl.uniform3f(p.uniforms.color, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
      this.blit(this.density.write);
      this.density.swap();
    }

    step(dt) {
      if (this.config.PAUSED || !this.isInitialized) return;

      const gl = this.gl;

      // 1. Curl Calculation
      const pCurl = this.programs.curl;
      pCurl.bind();
      gl.uniform2f(pCurl.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
      gl.uniform1i(pCurl.uniforms.uVelocity, this.velocity.read.attach(0));
      this.blit(this.curlFBO);

      // 2. Vorticity Confinement (Fedkiw et al.)
      const pVort = this.programs.vorticity;
      pVort.bind();
      gl.uniform2f(pVort.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
      gl.uniform1i(pVort.uniforms.uVelocity, this.velocity.read.attach(0));
      gl.uniform1i(pVort.uniforms.uCurl, this.curlFBO.attach(1));
      gl.uniform1f(pVort.uniforms.curl, this.config.CURL);
      gl.uniform1f(pVort.uniforms.dt, dt);
      this.blit(this.velocity.write);
      this.velocity.swap();

      // 3. Divergence
      const pDiv = this.programs.divergence;
      pDiv.bind();
      gl.uniform2f(pDiv.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
      gl.uniform1i(pDiv.uniforms.uVelocity, this.velocity.read.attach(0));
      this.blit(this.divergence);

      // 4. Clear Pressure Guess
      const pClear = this.programs.clear;
      pClear.bind();
      gl.uniform1i(pClear.uniforms.uTexture, this.pressure.read.attach(0));
      gl.uniform1f(pClear.uniforms.value, this.config.PRESSURE);
      this.blit(this.pressure.write);
      this.pressure.swap();

      // 5. Poisson Pressure Solver (Jacobi Iterations)
      const pPress = this.programs.pressure;
      pPress.bind();
      gl.uniform2f(pPress.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
      gl.uniform1i(pPress.uniforms.uDivergence, this.divergence.attach(0));

      for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pPress.uniforms.uPressure, this.pressure.read.attach(1));
        this.blit(this.pressure.write);
        this.pressure.swap();
      }

      // 6. Subtract Pressure Gradient (Helmholtz-Hodge projection)
      const pGrad = this.programs.gradientSubtract;
      pGrad.bind();
      gl.uniform2f(pGrad.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
      gl.uniform1i(pGrad.uniforms.uPressure, this.pressure.read.attach(0));
      gl.uniform1i(pGrad.uniforms.uVelocity, this.velocity.read.attach(1));
      this.blit(this.velocity.write);
      this.velocity.swap();

      // 7. Advect Velocity (with u_gravity pre-Poisson force)
      const pAdv = this.programs.advection;
      pAdv.bind();
      gl.uniform2f(pAdv.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
      gl.uniform2f(pAdv.uniforms.dyeTexelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
      gl.uniform1i(pAdv.uniforms.uVelocity, this.velocity.read.attach(0));
      gl.uniform1i(pAdv.uniforms.uSource, this.velocity.read.attach(0));
      gl.uniform1f(pAdv.uniforms.dt, dt);
      gl.uniform1f(pAdv.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
      gl.uniform2f(pAdv.uniforms.u_gravity, this.config.GRAVITY.x, this.config.GRAVITY.y);
      gl.uniform1i(pAdv.uniforms.isVelocity, 1);
      this.blit(this.velocity.write);
      this.velocity.swap();

      // 8. Advect Density (Dye Color Field)
      gl.uniform2f(pAdv.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
      gl.uniform2f(pAdv.uniforms.dyeTexelSize, this.density.texelSizeX, this.density.texelSizeY);
      gl.uniform1i(pAdv.uniforms.uVelocity, this.velocity.read.attach(0));
      gl.uniform1i(pAdv.uniforms.uSource, this.density.read.attach(1));
      gl.uniform1f(pAdv.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
      gl.uniform2f(pAdv.uniforms.u_gravity, 0.0, 0.0);
      gl.uniform1i(pAdv.uniforms.isVelocity, 0);
      this.blit(this.density.write);
      this.density.swap();
    }

    render(targetFBO = null) {
      if (!this.isInitialized) return;

      const gl = this.gl;
      const p = this.programs.display;
      p.bind();

      gl.uniform2f(p.uniforms.texelSize, 1.0 / gl.drawingBufferWidth, 1.0 / gl.drawingBufferHeight);
      gl.uniform1i(p.uniforms.uTexture, this.density.read.attach(0));

      if (this.ditheringTexture) {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.ditheringTexture);
        gl.uniform1i(p.uniforms.uDithering, 3);
        gl.uniform2f(p.uniforms.ditherScale, gl.drawingBufferWidth / 128.0, gl.drawingBufferHeight / 128.0);
      }

      gl.uniform1i(p.uniforms.uShading, this.config.SHADING ? 1 : 0);
      gl.uniform3f(p.uniforms.uBgColor, this.config.BACK_COLOR.r / 255.0, this.config.BACK_COLOR.g / 255.0, this.config.BACK_COLOR.b / 255.0);

      this.blit(targetFBO);
    }

    setGravity(x, y) {
      this.config.GRAVITY.x = x;
      this.config.GRAVITY.y = y;
    }

    setConfig(key, value) {
      if (typeof key === 'object') {
        Object.assign(this.config, key);
      } else {
        this.config[key] = value;
      }
    }

    reset() {
      if (!this.isInitialized) return;
      this.initFramebuffers();
    }

    dispose() {
      if (!this.gl) return;
      const gl = this.gl;

      // Free double FBOs
      [this.density, this.velocity, this.pressure].forEach((dfbo) => {
        if (dfbo) {
          gl.deleteTexture(dfbo.read.texture);
          gl.deleteTexture(dfbo.write.texture);
          gl.deleteFramebuffer(dfbo.read.fbo);
          gl.deleteFramebuffer(dfbo.write.fbo);
        }
      });

      // Free single FBOs
      if (this.divergence) {
        gl.deleteTexture(this.divergence.texture);
        gl.deleteFramebuffer(this.divergence.fbo);
      }
      if (this.curlFBO) {
        gl.deleteTexture(this.curlFBO.texture);
        gl.deleteFramebuffer(this.curlFBO.fbo);
      }
      if (this.ditheringTexture) {
        gl.deleteTexture(this.ditheringTexture);
      }

      // Free Buffers & Programs
      if (this.quadBuffer) gl.deleteBuffer(this.quadBuffer);
      if (this.programs) {
        Object.values(this.programs).forEach((p) => {
          if (p && p.program) gl.deleteProgram(p.program);
        });
      }

      if (this.canvas) {
        if (this.boundContextLost) this.canvas.removeEventListener('webglcontextlost', this.boundContextLost);
        if (this.boundContextRestored) this.canvas.removeEventListener('webglcontextrestored', this.boundContextRestored);
      }

      this.isInitialized = false;
      console.info('FluidCore: Recursos de VRAM liberados exitosamente.');
    }

    getCanvas() {
      return this.canvas;
    }

    getGL() {
      return this.gl;
    }

    getDensityTexture() {
      return this.density ? this.density.read.texture : null;
    }
  }

  root.FluidCore = new FluidSimulationEngine();
})(typeof window !== 'undefined' ? window : this);
