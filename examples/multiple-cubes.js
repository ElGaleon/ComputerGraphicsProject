const canvas = initCanvas('#gl-canvas');
const gl = initWebGLContext(canvas);

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
const cube = new Plane();

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
cameraMatrix.translateSelf(0, 0, -12);

// Set the point light color and position
const lightColor = gl.getUniformLocation(program, 'lightColor');
gl.uniform3f(lightColor, 1, 1, 1);

const lightPosition = gl.getUniformLocation(program, 'lightPosition');
gl.uniform3f(lightPosition, 0, 0, 2.5);

// Set the ambient light color
const ambientLight = gl.getUniformLocation(program, 'ambientLight');
gl.uniform3f(ambientLight, 0.3, 0.3, 0.3);

// Clear
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// Render a cube
const renderCube = (tx, ty, tz, sx, sy, sz) => {
    // Set the model matrix
    const modelMatrix = new DOMMatrix();
    modelMatrix.scaleSelf(3,3,0);
    // modelMatrix.translateSelf(tx, ty, tz).rotateSelf(0, 90, 90).rotateSelf(0, 30, 0).scaleSelf(sx, sy, sz)
    const model = gl.getUniformLocation(program, 'model');
    gl.uniformMatrix4fv(model, false, modelMatrix.toFloat32Array());

    // Set the cube's mvp matrix (camera x model)
    const mvpMatrix = (new DOMMatrix(modelMatrix)).preMultiplySelf(cameraMatrix);
    const mvp = gl.getUniformLocation(program, 'mvp');
    gl.uniformMatrix4fv(mvp, false, mvpMatrix.toFloat32Array());

    // Set the inverse transpose of the model matrix
    const inverseTransposeMatrix = transpose((new DOMMatrix(modelMatrix)).invertSelf());
    const inverseTranspose = gl.getUniformLocation(program, 'inverseTranspose');
    gl.uniformMatrix4fv(inverseTranspose, false, inverseTransposeMatrix.toFloat32Array());

    // Render
    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
}

// Cube 1
renderCube(-6, 0, -1, 1, 1, 3);

// Cube 2
renderCube(0, 0, 0, 1, 1, 1);

// Cube 3
renderCube(4, 0, 0, 1, 3, 1);

renderCube(0, 0, -3, 1, 1, 10);
