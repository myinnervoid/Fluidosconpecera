/**
 * AETHERIA | Vector Math Utilities
 * Centralized utility module for math operations such as clamp, magnitude, normalize, distance.
 */

(function (root) {
  'use strict';

  const MathUtils = {
    /**
     * Clamps a number between a minimum and maximum value.
     * @param {number} val - The value to clamp.
     * @param {number} min - The minimum allowed value.
     * @param {number} max - The maximum allowed value.
     * @type {Function}
     * @returns {number} The clamped value.
     */
    clamp(val, min, max) {
      if (!Number.isFinite(val)) val = 0;
      if (!Number.isFinite(min)) min = 0;
      if (!Number.isFinite(max)) max = 0;
      if (min > max) {
        const temp = min;
        min = max;
        max = temp;
      }
      return Math.max(min, Math.min(max, val));
    },

    /**
     * Calculates the Euclidean distance between two points.
     * @param {number} x1 - The x-coordinate of the first point.
     * @param {number} y1 - The y-coordinate of the first point.
     * @param {number} x2 - The x-coordinate of the second point.
     * @param {number} y2 - The y-coordinate of the second point.
     * @type {Function}
     * @returns {number} The distance between the points.
     */
    distance(x1, y1, x2, y2) {
      if (!Number.isFinite(x1)) x1 = 0;
      if (!Number.isFinite(y1)) y1 = 0;
      if (!Number.isFinite(x2)) x2 = 0;
      if (!Number.isFinite(y2)) y2 = 0;
      return Math.hypot(x2 - x1, y2 - y1);
    },

    /**
     * Calculates the magnitude (length) of a vector.
     * @param {number} x - The x-component of the vector.
     * @param {number} y - The y-component of the vector.
     * @type {Function}
     * @returns {number} The magnitude of the vector.
     */
    magnitude(x, y) {
      if (!Number.isFinite(x)) x = 0;
      if (!Number.isFinite(y)) y = 0;
      return Math.hypot(x, y);
    },

    /**
     * Normalizes a 2D vector, returning {x, y}. If the vector is a zero vector, returns {x: 0, y: 0}.
     * @param {number} x - The x-component of the vector.
     * @param {number} y - The y-component of the vector.
     * @type {Function}
     * @returns {{x: number, y: number}} The normalized vector.
     */
    normalize(x, y) {
      if (!Number.isFinite(x)) x = 0;
      if (!Number.isFinite(y)) y = 0;
      const mag = this.magnitude(x, y);
      if (mag < 0.0001 || !Number.isFinite(mag)) return { x: 0, y: 0 };
      return { x: x / mag, y: y / mag };
    }
  };

  root.MathUtils = MathUtils;
})(typeof window !== 'undefined' ? window : this);

