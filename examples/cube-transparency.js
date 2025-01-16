// WebGL canvas context
const canvas = initCanvas('#gl-canvas');
const gl = canvas.getContext('webgl');
let alpha = 0.5;

// Vertex shader
const vertexShaderSource = `
attribute vec4 position;
attribute vec4 color;
uniform mat4 camera;
varying vec4 v_color;
void main() {

  // Apply the camera matrix to the vertex position
  gl_Position = camera * position;

  // Set the varying color
  v_color = color;
}`;

// Fragment shader
const fragmentShaderSource = `
precision mediump float;
varying vec4 v_color;
void main() {
  gl_FragColor = v_color;
}`;

// Compile program
const program = compileProgram(gl, vertexShaderSource, fragmentShaderSource);

// Create a cube
const vertices = new Float32Array([  // Vertex coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // back
]);

// Set rgba colors for each face's vertices
const colors = new Float32Array([
    //r   g    b    a      r    g    b    a
    0.5, 0.5, 1.0, 1,   0.5, 0.5, 1.0, 1,
    0.5, 0.5, 1.0, 1,   0.5, 0.5, 1.0, 1, // front
    0.5, 1.0, 0.5, 1,   0.5, 1.0, 0.5, 1,
    0.5, 1.0, 0.5, 1,   0.5, 1.0, 0.5, 1, // right
    1.0, 0.5, 0.5, 1,   1.0, 0.5, 0.5, 1,
    1.0, 0.5, 0.5, 1,   1.0, 0.5, 0.5, 1, // up
    1.0, 1.0, 0.5, 1,   1.0, 1.0, 0.5, 1,
    1.0, 1.0, 0.5, 1,   1.0, 1.0, 0.5, 1, // left
    1.0, 1.0, 1.0, 1,   1.0, 1.0, 1.0, 1,
    1.0, 1.0, 1.0, 1,   1.0, 1.0, 1.0, 1, // down
    0.5, 1.0, 1.0, 1,   0.5, 1.0, 1.0, 1,
    0.5, 1.0, 1.0, 1,   0.5, 1.0, 1.0, 1  // back
]);

const indices = new Uint8Array([  // Indices
    0, 1, 2,   0, 2, 3,  // front
    4, 5, 6,   4, 6, 7,  // right
    8, 9, 10,  8, 10,11, // up
    12,13,14,  12,14,15, // left
    16,17,18,  16,18,19, // down
    20,21,22,  20,22,23  // back
]);

const n = 36;

// Set position and color
compileBuffer(gl, vertices, program, 'position', 3, gl.FLOAT);
compileBuffer(gl, colors, program, 'color', 4, gl.FLOAT);

// Set indices
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// Set the clear color
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// Enable alpha blending
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// Set the camera
const camera = gl.getUniformLocation(program, 'camera');
let cameraMatrix = m4.perspective( 30, 1, 1, 100);
cameraMatrix = m4.translate(cameraMatrix, 0,0, -5);
gl.uniformMatrix4fv(camera, false, cameraMatrix);

// Animate / draw
setInterval(() => {
    cameraMatrix = m4.xRotate(cameraMatrix, 0.025);
    cameraMatrix = m4.yRotate(cameraMatrix, .004);
    gl.uniformMatrix4fv(camera, false, cameraMatrix);

    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw opaque objects here (if any)
    // (...)

    // Disable depth test
    gl.disable(gl.DEPTH_TEST);

    // Draw semi-transparent objects here (if any)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

    // Re-enable depth test for next frame
    gl.enable(gl.DEPTH_TEST);
}, 16);

/**
 * Update Slider Value
 * @param value
 */
function updateTextInput(value) {
    const slider = document.getElementById('alphaValue');
    alpha = (value/10).toString();
    slider.innerText = alpha.toString();
}
