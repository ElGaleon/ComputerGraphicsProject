/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Scene} scene
 */
function render(gl, scene) {
  if (resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  // Enable transparency
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

}
