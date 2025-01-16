const canvas = initCanvas('#gl-canvas');
const gl = initWebGLContext(canvas);

const arm = document.getElementById('arm');
const hand = document.getElementById('hand');

const vertexShaderSource = `
    attribute vec4 position;
attribute vec4 color;
attribute vec4 normal;
uniform mat4 mvp;
uniform mat4 model;            // model matrix
uniform mat4 inverseTranspose; // inversed transposed model matrix
varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
void main() {

  // Apply the model matrix and the camera matrix to the vertex position
  gl_Position = mvp * position;

  // Set varying position for the fragment shader
  v_position = vec3(model * position);

  // Recompute the face normal
  v_normal = normalize(vec3(inverseTranspose * normal));

  // Set the color
  v_color = color;
}`;

const fragmentShaderSource = `
    precision mediump float;
uniform vec3 lightColor;
uniform vec3 lightPosition;
uniform vec3 ambientLight;
varying vec3 v_normal;
varying vec3 v_position;
varying vec4 v_color;
void main() {

  // Compute direction between the light and the current point
  vec3 lightDirection = normalize(lightPosition - v_position);

  // Compute angle between the normal and that direction
  float nDotL = max(dot(lightDirection, v_normal), 0.0);

  // Compute diffuse light proportional to this angle
  vec3 diffuse = lightColor * v_color.rgb * nDotL;

  // Compute ambient light
  vec3 ambient = ambientLight * v_color.rgb;

  // Compute total light (diffuse + ambient)
  gl_FragColor = vec4(diffuse + ambient, 1.0);
}
  `;

// Compile program
const program = compileProgram(gl, vertexShaderSource, fragmentShaderSource);

// Initialize a cube
const cube = new Cube();
// Count vertices
var n = cube.indices.length;

// Set position, normal buffers
compileBuffer(gl, cube.vertices, program, 'position', 3, gl.FLOAT);
compileBuffer(gl, cube.normals, program, 'normal', 3, gl.FLOAT);

// Set indices
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.indices, gl.STATIC_DRAW);

// Set cube color
const color = gl.getAttribLocation(program, 'color');
gl.vertexAttrib3f(color, 1, 0, 0);

// Set the clear color and enable the depth test
gl.clearColor(0, 0, 0, 1);
gl.enable(gl.DEPTH_TEST);

// Set the camera
const cameraMatrix = perspective({fov: 30, aspect: 1, near: 1, far: 100});
cameraMatrix.translateSelf(0, 0, -15);

// Set the point light color and position
const lightColor = gl.getUniformLocation(program, 'lightColor');
gl.uniform3f(lightColor, 1, 0, 1);

const lightPosition = gl.getUniformLocation(program, 'lightPosition');
gl.uniform3fv(lightPosition, new Float32Array([0, 0, 2]));

// Set the ambient light color
const ambientLight = gl.getUniformLocation(program, 'ambientLight');
gl.uniform3f(ambientLight, .35, .1, .1);

// Click the buttons to update the arm/hand angles
const ANGLE_STEP = 3;
let armAngle = 180;
let handAngle = 45;

let armClicked = 0;

arm.onmousedown = () => {
    armClicked = 1;
}

arm.onmouseup = () => {
    armClicked = 0;
}

let handClicked = 0;

hand.onmousedown = () => {
    handClicked = 1;
}

hand.onmouseup = () => {
    handClicked = 0;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} n
 * @param {DOMMatrix} cameraMatrix
 */
// Draw the complete arm
function drawArm (gl, n, cameraMatrix) {

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Shoulder
    const shoulderModelMatrix = new DOMMatrix();
    shoulderModelMatrix.rotateSelf(90, 0, 0).translateSelf(-3, 0, 0).scaleSelf(2, 1, 1);
    drawModel(gl, program, cameraMatrix, shoulderModelMatrix, n);

    // Arm
    const modelMatrix = new DOMMatrix();
    modelMatrix.rotateSelf(armAngle, 0, 0).translateSelf(0, -2, 0).scaleSelf(1, 3, 1);
    drawModel(gl, program, cameraMatrix, modelMatrix, n);

    // Hand (reuse the same matrix!)
    modelMatrix.rotateSelf(0, handAngle, 0).translateSelf(0, -1, 0).scaleSelf(2, .1, 2);
    drawModel(gl, program, cameraMatrix, modelMatrix, n);
}

// Update the angles and redraw the arm at each frame
setInterval(() => {
    if(armClicked){ armAngle = (armAngle + ANGLE_STEP) % 360; }
    if(handClicked){ handAngle = (handAngle + ANGLE_STEP) % 360; }
    drawArm(gl, n, cameraMatrix);
}, 100);


/*
/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} n
 * @param {DOMMatrix} cameraMatrix

function drawArm(gl, n, cameraMatrix) {
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Shoulder
  const shoulderModelMatrix = new DOMMatrix();
  shoulderModelMatrix.rotateSelf(45, 0, 0).translateSelf(-3,0,0).scaleSelf(2,1,1);
  drawModel(gl, program, cameraMatrix, shoulderModelMatrix, n);

  // Arm
  const armModelMatrix =  new DOMMatrix();
  armModelMatrix.rotateSelf(armAngle, 0, 0).translateSelf(0,-2,0).scaleSelf(1,3,1);
  drawModel(gl, program, cameraMatrix, armModelMatrix, n);

  // Hand - reuse the same matrix
  armModelMatrix.rotateSelf(0, handAngle, 0).translateSelf(0,-1,0).scaleSelf(2,.1,2);
  drawModel(gl, program, cameraMatrix, armModelMatrix, n);
}
 */
