/**
 * Convert radians to degrees
 * @param {number} rad
 * @returns {number}
 */
function radToDeg(rad) {
  return rad * Math.PI / 180;
}

/**
 * Convert degrees to radians
 * @param {number} deg
 * @returns {number}
 */
function degToRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * Return if a value is power of 2 (bit comparison)
 * @param {number} value
 * @returns {boolean}
 */
function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}
