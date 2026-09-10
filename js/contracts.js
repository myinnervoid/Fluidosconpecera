/**
 * AETHERIA | Architecture Contracts, Type Definitions & Error Catalog
 * Standard: 5-Vector Architecture Specification v3.1 (Global Law 2 & Law 5)
 * - Canonical Error Catalog (AetheriaErrorCatalog)
 * - Standard Transport Wrapper (createApiResponse -> ApiResponse<T>)
 * - JSDoc Type Definitions for Core Entities
 * License: MIT
 */

(function (root) {
  'use strict';

  /**
   * @typedef {Object} ApiResponse
   * @property {boolean} success - Indica si la operación concluyó exitosamente.
   * @property {*} [data] - Carga útil de datos de retorno si success = true.
   * @property {string|null} [error_code] - Código de error canónico si success = false.
   * @property {string} [message] - Mensaje descriptivo o accesible de la operación.
   */

  /**
   * Catálogo Canónico e Inmutable de Códigos de Error del Sistema (Vector 2).
   */
  const AetheriaErrorCatalog = Object.freeze({
    // Hardware & WebGL Errors (100-199)
    ERR_WEBGL_UNSUPPORTED: 'ERR_WEBGL_UNSUPPORTED',
    ERR_CONTEXT_LOST: 'ERR_CONTEXT_LOST',
    ERR_SHADER_COMPILE_FAILED: 'ERR_SHADER_COMPILE_FAILED',
    ERR_FBO_INCOMPLETE: 'ERR_FBO_INCOMPLETE',

    // Media & Recorder Errors (200-299)
    ERR_RECORDER_UNSUPPORTED: 'ERR_RECORDER_UNSUPPORTED',
    ERR_RECORDER_ACTIVE: 'ERR_RECORDER_ACTIVE',
    ERR_RECORDER_FAILED: 'ERR_RECORDER_FAILED',
    ERR_CANVAS_CAPTURE_FAILED: 'ERR_CANVAS_CAPTURE_FAILED',

    // Assets & File Loading Errors (300-399)
    ERR_IMAGE_LOAD_FAILED: 'ERR_IMAGE_LOAD_FAILED',
    ERR_INVALID_FILE_TYPE: 'ERR_INVALID_FILE_TYPE',
    ERR_FILE_TOO_LARGE: 'ERR_FILE_TOO_LARGE',
    ERR_STORAGE_QUOTA: 'ERR_STORAGE_QUOTA',

    // State & UI Transitions Errors (400-499)
    ERR_INVALID_STATE_TRANSITION: 'ERR_INVALID_STATE_TRANSITION',
    ERR_DRAWER_BLOCKED: 'ERR_DRAWER_BLOCKED',
    ERR_INVALID_PALETTE: 'ERR_INVALID_PALETTE',
    ERR_INVALID_ELEMENT: 'ERR_INVALID_ELEMENT'
  });

  /**
   * Generador Estandarizado de Respuestas de Transporte/IPC (Global Law 5).
   * @template T
   * @param {boolean} success - Éxito o fallo de la operación.
   * @param {T} [data=null] - Datos resultantes.
   * @param {string|null} [errorCode=null] - Código de AetheriaErrorCatalog.
   * @param {string} [message=''] - Mensaje descriptivo para UI o logs.
   * @returns {ApiResponse}
   */
  function createApiResponse(success, data = null, errorCode = null, message = '') {
    return {
      success: !!success,
      data: data !== undefined ? data : null,
      error_code: errorCode || null,
      message: message || (success ? 'Operación completada exitosamente.' : 'Error no especificado.')
    };
  }

  /**
   * @typedef {Object} FluidConfig
   * @property {number} SIM_RESOLUTION
   * @property {number} DYE_RESOLUTION
   * @property {number} DENSITY_DISSIPATION
   * @property {number} VELOCITY_DISSIPATION
   * @property {number} PRESSURE
   * @property {number} PRESSURE_ITERATIONS
   * @property {number} CURL
   * @property {number} SPLAT_RADIUS
   * @property {number} SPLAT_FORCE
   * @property {boolean} SHADING
   * @property {boolean} COLORFUL
   * @property {boolean} PAUSED
   * @property {{r: number, g: number, b: number}} BACK_COLOR
   * @property {boolean} TRANSPARENT
   * @property {boolean} BLOOM
   * @property {boolean} SUNRAYS
   * @property {{x: number, y: number}} GRAVITY
   */

  /**
   * @typedef {Object} BoidState
   * @property {number} id
   * @property {number} x
   * @property {number} y
   * @property {number} vx
   * @property {number} vy
   * @property {number} colorIndex
   * @property {number} phase
   * @property {number} angle
   */

  /**
   * @typedef {Object} BackgroundDefinition
   * @property {string} name
   * @property {string} icon
   * @property {string} category
   * @property {{'16_9': string, '9_16': string}|null} files
   */

  /**
   * @typedef {Object} AvatarDefinition
   * @property {number} radiusScale
   * @property {string} sparkType
   * @property {number} impulse
   * @property {number} offset
   * @property {number} angleCorrection
   */

  /**
   * Validador de Tipos y Esquemas en tiempo de ejecución.
   */
  const SchemaValidator = {
    validateColorRgb(color) {
      if (!Array.isArray(color) || color.length < 3) return false;
      return color.every((c) => typeof c === 'number' && !isNaN(c) && c >= 0.0 && c <= 1.0);
    },

    validateSymmetryMode(mode) {
      return [1, 2, 3, 4, 5, 6, 7, 8].includes(parseInt(mode, 10));
    },

    validateElementMode(elem) {
      return ['fluid', 'sand', 'gas', 'lava'].includes(elem);
    },

    validateAvatarType(avatar) {
      return ['none', 'nyan', 'rocket', 'comet', 'clownfish', 'fish', 'miku', 'custom'].includes(avatar);
    }
  };

  // Exponer en el scope global
  root.AetheriaContracts = {
    ErrorCatalog: AetheriaErrorCatalog,
    createApiResponse: createApiResponse,
    Validator: SchemaValidator
  };

  // Exportar helper directo
  root.createApiResponse = createApiResponse;
  root.AetheriaErrorCatalog = AetheriaErrorCatalog;

})(typeof window !== 'undefined' ? window : this);
