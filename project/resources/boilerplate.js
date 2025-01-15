/**
 * Return the canvas by the name
 * @param {string} canvasName
 * @returns {HTMLCanvasElement}
 */
function initCanvas(canvasName) {
  const canvas = document.querySelector(canvasName);

  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
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
  let gl = canvas.getContext('webgl');

  if (!gl) {
    throw new Error('WebGL is not supported on this device - try using a different device or browser');
  }
  gl.viewport(0,0, canvas.width, canvas.height);
  return gl;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} vertexShaderSource
 * @param {string} fragmentShaderSource
 * @return {WebGLProgram}
 */
function compileProgram(gl, vertexShaderSource, fragmentShaderSource) {
  // Vertex Shader
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const errorMessage = gl.getShaderInfoLog(vertexShader);
    throw new Error(`Failed to compile vertex shader: ${errorMessage}`);
  }

  // Fragment Shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    const errorMessage = gl.getShaderInfoLog(fragmentShader);
    throw new Error(`Failed to compile fragment shader: ${errorMessage}`);
  }

  // Create program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const errorMessage = gl.getProgramInfoLog(program);
    throw new Error(`Failed to link GPU program: ${errorMessage}`);
  }

  return program;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param data
 * @param {WebGLProgram} program
 * @param {string} attribute
 * @param {number} size
 * @param {GLenum} type
 * @return void
 */
function compileBuffer(gl, data, program, attribute, size, type) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const attributeLocation = gl.getAttribLocation(program, attribute);
  gl.vertexAttribPointer(attributeLocation, size, type, false, 0, 0);
  gl.enableVertexAttribArray(attributeLocation);
}
