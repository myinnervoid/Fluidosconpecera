/**
 * AETHERIA | Vector Math Utilities
 * Centralized utility module for math operations such as clamp, magnitude, normalize, distance.
 */

(function (root) {
  'use strict';

  const MathUtils = {
    /**
     * Clamps a number between a minimum and maximum value.
     */
    clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    },

    /**
     * Calculates the Euclidean distance between two points.
     */
    distance(x1, y1, x2, y2) {
      return Math.hypot(x2 - x1, y2 - y1);
    },

    /**
     * Calculates the magnitude (length) of a vector.
     */
    magnitude(x, y) {
      return Math.hypot(x, y);
    },

    /**
     * Normalizes a 2D vector, returning {x, y}. If the vector is a zero vector, returns {x: 0, y: 0}.
     */
    normalize(x, y) {
      const mag = this.magnitude(x, y);
      if (mag < 0.0001) return { x: 0, y: 0 };
      return { x: x / mag, y: y / mag };
    }
  };

  root.MathUtils = MathUtils;
})(typeof window !== 'undefined' ? window : this);

