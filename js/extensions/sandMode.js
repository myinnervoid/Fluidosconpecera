/**
 * AETHERIA | Sand & Mineral Granular Post-Process Shader Engine (Hexagonal / Voronoi Tessellation)
 * Transforms fluid flow into thousands of organic mineral grains (Tezontle, Nixtamal, Chaquira Wixárika)
 * with staggered hexagonal packing, crystalline facet normals, and Sanzo Wada palette quantization.
 */

(function (root) {
  'use strict';

  class SandParticlePostProcess {
    constructor() {
      this.gl = null;
      this.program = null;
      this.quadBuffer = null;
      this.isEnabled = false;
      this.grainSize = 10.0; // Size of individual mineral grain in pixels
      this.borderDarkness = 0.52; // Inter-grain shadow contrast
      this.grainJitter = 0.32; // Mineral facet sparkle intensity
    }

    setGrainSize(val) {
      const parsed = parseFloat(val);
      if (Number.isFinite(parsed)) {
        this.grainSize = Math.max(4.0, Math.min(32.0, parsed));
      }
    }

    init(gl) {
      if (!gl) return;
      this.gl = gl;

      const vertexShaderSource = `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        void main () {
          vUv = aPosition * 0.5 + 0.5;
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `;

      const fragmentShaderSource = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        uniform float uGrainSize;
        uniform float uBorderDarkness;
        uniform float uGrainJitter;
        uniform vec3 uPalette[16];
        uniform int uPaletteSize;
        uniform int uUsePalette;

        // Deterministic 2D hash for organic grain variation
        vec2 hash22(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return fract(sin(p) * 43758.5453);
        }

        float hash21(vec2 p) {
          p = fract(p * vec2(234.34, 435.345));
          p += dot(p, p + 34.23);
          return fract(p.x * p.y);
        }

        void main () {
          float scale = max(uGrainSize, 3.0);
          vec2 gridCount = uResolution / scale;

          // Staggered Hexagonal-like Row Offset for organic mineral packing (zero rigid square grid)
          vec2 st = vUv * gridCount;
          float rowIndex = floor(st.y);
          st.x += mod(rowIndex, 2.0) * 0.5;

          vec2 cellId = floor(st);
          vec2 cellUv = fract(st) - 0.5;

          // Micro-jitter per grain center
          vec2 jitter = (hash22(cellId) - 0.5) * 0.22;
          vec2 grainVec = cellUv - jitter;
          float distFromCenter = length(grainVec);

          // Sample underlying fluid density at grain center
          vec2 sampleUv = (vec2(cellId.x - mod(rowIndex, 2.0) * 0.5, cellId.y) + 0.5) / gridCount;
          sampleUv = clamp(sampleUv, 0.001, 0.999);

          vec3 src = texture2D(uTexture, sampleUv).rgb;
          float density = max(src.r, max(src.g, src.b));

          if (density < 0.018) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
            return;
          }

          // Rounded pebble / chaquira grain boundary with bevel normal
          float grainRadius = 0.46 + (hash21(cellId + 7.1) - 0.5) * 0.08;
          float rimMask = 1.0 - smoothstep(grainRadius - 0.14, grainRadius + 0.04, distFromCenter);

          // 3D hemispherical normal per grain for mineral light reflection
          vec2 normXY = grainVec / max(grainRadius, 0.1);
          float normZ = sqrt(max(0.0, 1.0 - dot(normXY, normXY)));
          vec3 grainNormal = normalize(vec3(normXY, normZ));
          vec3 lightDir = normalize(vec3(-0.35, 0.45, 0.82));
          float diffuse = clamp(dot(grainNormal, lightDir), 0.25, 1.0);
          float spec = pow(max(dot(grainNormal, normalize(lightDir + vec3(0.0, 0.0, 1.0))), 0.0), 12.0) * 0.28;

          float grainSeed = hash21(cellId);
          float grainNoise = (grainSeed - 0.5) * uGrainJitter;

          vec3 baseColor = src + grainNoise;
          baseColor = baseColor / (baseColor + vec3(0.55));

          if (uUsePalette == 1 && uPaletteSize > 0) {
            float minDist = 999.0;
            vec3 bestColor = uPalette[0];

            for (int i = 0; i < 16; i++) {
              if (i >= uPaletteSize) break;
              float d = distance(baseColor, uPalette[i]);
              if (d < minDist) {
                minDist = d;
                bestColor = uPalette[i];
              }
            }
            baseColor = mix(bestColor, baseColor, 0.22);
          }

          // Apply 3D mineral facet shading & inter-grain mortar shadow
          float shadowFactor = mix(1.0 - uBorderDarkness, 1.0, rimMask);
          vec3 finalColor = (baseColor * (0.55 + 0.55 * diffuse) + vec3(spec)) * shadowFactor;

          float alpha = clamp((density - 0.018) * 14.0, 0.0, 1.0) * mix(0.65, 1.0, rimMask);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `;

      this.program = this.createProgram(gl, vertexShaderSource, fragmentShaderSource);

      this.quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    }

    createProgram(gl, vertexSource, fragmentSource) {
      const vShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vShader, vertexSource);
      gl.compileShader(vShader);

      const fShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fShader, fragmentSource);
      gl.compileShader(fShader);

      const prog = gl.createProgram();
      gl.attachShader(prog, vShader);
      gl.attachShader(prog, fShader);
      gl.linkProgram(prog);

      const uniforms = {};
      const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < count; i++) {
        const info = gl.getActiveUniform(prog, i);
        uniforms[info.name] = gl.getUniformLocation(prog, info.name);
      }

      return { program: prog, uniforms, bind: () => gl.useProgram(prog) };
    }

    render(sourceTexture, paletteColors = null) {
      if (!this.gl || !this.program) return;
      const gl = this.gl;
      const p = this.program;

      p.bind();

      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
      gl.uniform1i(p.uniforms.uTexture, 0);
      gl.uniform2f(p.uniforms.uResolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1f(p.uniforms.uGrainSize, this.grainSize);
      gl.uniform1f(p.uniforms.uBorderDarkness, this.borderDarkness);
      gl.uniform1f(p.uniforms.uGrainJitter, this.grainJitter);

      if (paletteColors && paletteColors.length > 0) {
        const flatColors = [];
        const size = Math.min(paletteColors.length, 16);
        for (let i = 0; i < 16; i++) {
          if (i < size) {
            flatColors.push(paletteColors[i][0], paletteColors[i][1], paletteColors[i][2]);
          } else {
            flatColors.push(0, 0, 0);
          }
        }
        gl.uniform3fv(p.uniforms['uPalette[0]'], new Float32Array(flatColors));
        gl.uniform1i(p.uniforms.uPaletteSize, size);
        gl.uniform1i(p.uniforms.uUsePalette, 1);
      } else {
        gl.uniform1i(p.uniforms.uUsePalette, 0);
        gl.uniform1i(p.uniforms.uPaletteSize, 0);
      }

      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
  }

  root.AetheriaSandMode = new SandParticlePostProcess();
})(typeof window !== 'undefined' ? window : this);
