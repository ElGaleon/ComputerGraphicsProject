/**
 * Return the canvas by the name
 * @param {string} canvasName
 * @returns {HTMLCanvasElement}
 */
function initCanvas(canvasName) {
  const canvas = document.querySelector(canvasName);

  if (!canvas || (!(canvas instanceof HTMLCanvasElement) && !(canvas instanceof CanvasRenderingContext2D))) {
    throw Error('Could not get Canvas reference');
  }
  return canvas;
}

/**
 * Return the WebGLContext by a canvas
 * @param {HTMLCanvasElement} canvas
 * @returns {WebGLRenderingContext}
 */
function initWebGLContext(canvas) {
  // Check context
  const gl = canvas.getContext('webgl');
  if (!gl) {
    throw new Error('WebGL is not supported on this device - try using a different device or browser');
  }

  // Check Depth Texture
  const ext = gl.getExtension('WEBGL_depth_texture');
  if (!ext) {
    throw new Error('Need WEBGL_depth_texture');  // eslint-disable-line
  }

  // Set viewport
  gl.viewport(0, 0, canvas.width, canvas.height);

  return gl;
}
