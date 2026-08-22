/**
 * AETHERIA | Sand & Granular Particle Post-Process Shader Engine
 * Transforms fluid flow into thousands of distinct falling sand grains with cellular outlines,
 * mineral grain specular noise, and retro LUT color palette mapping.
 */

(function (root) {
  'use strict';

  class SandParticlePostProcess {
    constructor() {
      this.gl = null;
      this.program = null;
      this.quadBuffer = null;
      this.isEnabled = false;
      this.grainSize = 10.0; // Size of individual sand grain in pixels
      this.borderDarkness = 0.45; // Outline contrast between grains
      this.grainJitter = 0.35; // Specular noise intensity per sand grain
    }

    init(gl) {
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

        // Hash function for procedural per-grain micro-variation
        float hash21(vec2 p) {
          p = fract(p * vec2(234.34, 435.345));
          p += dot(p, p + 34.23);
          return fract(p.x * p.y);
        }

        void main () {
          vec2 gridCount = uResolution / max(uGrainSize, 2.0);
          vec2 cellId = floor(vUv * gridCount);
          vec2 cellUv = fract(vUv * gridCount);
          vec2 sampleUv = (cellId + 0.5) / gridCount;

          vec3 src = texture2D(uTexture, sampleUv).rgb;
          float density = max(src.r, max(src.g, src.b));

          // If no fluid in cell, render background
          if (density < 0.02) {
            gl_FragColor = vec4(0.027, 0.035, 0.055, 1.0);
            return;
          }

          // Procedural mineral noise for each sand grain
          float grainSeed = hash21(cellId);
          float grainNoise = (grainSeed - 0.5) * uGrainJitter;

          // Cellular border & grain bevel (gives the distinct granular hourglass look)
          vec2 borderDist = min(cellUv, 1.0 - cellUv);
          float minBorder = min(borderDist.x, borderDist.y);
          float borderFactor = smoothstep(0.0, 0.16, minBorder);
          
          // Subtle circular bevel highlight
          float centerDist = distance(cellUv, vec2(0.5));
          float grainHighlight = smoothstep(0.45, 0.05, centerDist) * 0.25;

          vec3 baseColor = src + grainNoise + grainHighlight;
          baseColor *= mix(1.0 - uBorderDarkness, 1.0, borderFactor);

          // Tone-mapping
          baseColor = baseColor / (baseColor + vec3(0.65));

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
            baseColor = mix(bestColor, baseColor, 0.25) * mix(1.0 - uBorderDarkness, 1.0, borderFactor);
          }

          gl_FragColor = vec4(baseColor, 1.0);
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
