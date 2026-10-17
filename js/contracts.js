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
   * Configuration object for the Fluid Simulation parameters.
   * @typedef {Object} FluidConfig
   * @property {number} SIM_RESOLUTION - Simulation texture resolution factor. Higher means lower performance, more detail.
   * @property {number} DYE_RESOLUTION - Dye texture resolution factor. Higher means sharper colors.
   * @property {number} DENSITY_DISSIPATION - Rate at which color/dye fades over time.
   * @property {number} VELOCITY_DISSIPATION - Rate at which fluid momentum slows down.
   * @property {number} PRESSURE - Pressure coefficient affecting fluid expansion.
   * @property {number} PRESSURE_ITERATIONS - Number of solver iterations (Jacobi passes) for pressure calculation.
   * @property {number} CURL - Vorticity confinement strength, makes the fluid more turbulent.
   * @property {number} SPLAT_RADIUS - Base radius of pointer splats (interaction points).
   * @property {number} SPLAT_FORCE - Strength of momentum injected by pointer movement.
   * @property {boolean} SHADING - Enables fake 3D shading based on density gradient.
   * @property {boolean} COLORFUL - Toggles continuous color cycling during input.
   * @property {boolean} PAUSED - Determines if the simulation step is bypassed.
   * @property {{r: number, g: number, b: number}} BACK_COLOR - RGB background color components (normalized 0-1 or 0-255 depending on context).
   * @property {boolean} TRANSPARENT - Allows rendering over a transparent background.
   * @property {boolean} BLOOM - Enables post-processing bloom effect.
   * @property {boolean} SUNRAYS - Enables volumetric light scattering (sunrays) effect.
   * @property {{x: number, y: number}} GRAVITY - Gravity vector applied to density (mass) or dye over time.
   */

  /**
   * Represents the mutable runtime state of a single Boid entity.
   * @typedef {Object} BoidState
   * @property {number} id - Unique identifier for the boid.
   * @property {number} x - Current X position in world space.
   * @property {number} y - Current Y position in world space.
   * @property {number} vx - Current X velocity.
   * @property {number} vy - Current Y velocity.
   * @property {number} colorIndex - Index determining the boid's color from the active palette.
   * @property {number} phase - Oscillatory phase offset (e.g., for fin/tail animation).
   * @property {number} angle - Current heading angle in radians.
   */

  /**
   * Defines metadata and assets for a background theme.
   * @typedef {Object} BackgroundDefinition
   * @property {string} name - Human-readable name of the background.
   * @property {string} icon - URI or CSS class for the background selection icon.
   * @property {string} category - Classification grouping (e.g., 'abstract', 'nature').
   * @property {{'16_9': string, '9_16': string}|null} files - URIs mapping aspect ratios to asset files.
   */

  /**
   * Defines physical and visual properties for a user avatar.
   * @typedef {Object} AvatarDefinition
   * @property {number} radiusScale - Scale multiplier for the interaction splat radius.
   * @property {string} sparkType - Type identifier for emission particles or splat shapes.
   * @property {number} impulse - Baseline velocity impulse applied upon movement.
   * @property {number} offset - Positional offset applied from the cursor/touch point.
   * @property {number} angleCorrection - Fixed rotation applied to the sprite/graphic to align with velocity.
   */

  /**
   * Validador de Tipos y Esquemas en tiempo de ejecución.
   * Provides runtime validation for domain-specific schemas and constraints.
   */
  const SchemaValidator = {
    /**
     * Validates if the provided array represents a valid RGB color with components in [0, 1].
     * @param {number[]} color - Array of color components.
     * @returns {boolean} True if valid, false otherwise.
     */
    validateColorRgb(color) {
      if (!Array.isArray(color) || color.length < 3) return false;
      return color.every((c) => typeof c === 'number' && !isNaN(c) && c >= 0.0 && c <= 1.0);
    },

    /**
     * Validates if the given mode is a valid symmetry mode integer.
     * @param {number|string} mode - The symmetry mode to validate.
     * @returns {boolean} True if valid, false otherwise.
     */
    validateSymmetryMode(mode) {
      return [1, 2, 3, 4, 5, 6, 7, 8].includes(parseInt(mode, 10));
    },

    /**
     * Validates if the element mode string is recognized by the system.
     * @param {string} elem - The element mode string to validate.
     * @returns {boolean} True if valid, false otherwise.
     */
    validateElementMode(elem) {
      return ['fluid', 'sand', 'gas', 'lava'].includes(elem);
    },

    /**
     * Validates if the provided string is a known avatar type.
     * @param {string} avatar - The avatar type identifier.
     * @returns {boolean} True if valid, false otherwise.
     */
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
