/**
 * @class
 * @classDesc Acts like an interface for every shape to represent
 */
class Shape{
  vertices;
  normals;
  indices;

  constructor(vertices, normals, indices) {
    this.vertices = vertices;
    this.normals = normals;
    this.indices = indices;
  }

  drawModel() {}
}

/**
 * Cube class
 *    v6----- v5
 *   /|      /|
 *  v1------v0|
 *  | |   x | |
 *  | |v7---|-|v4
 *  |/      |/
 *  v2------v3
 * @class
 * @type {Shape}
 */
class Cube extends Shape {
  constructor() {
    const vertices = new Float32Array([
      1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // front
      1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // right
      1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // up
      -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // left
      -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // down
      1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // back
    ]);

    const normals = new Float32Array([
      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // front
      1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // right
      0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // up
      -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // left
      0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // down
      0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // back
    ]);

    const indices = new Uint16Array([
      0, 1, 2,   0, 2, 3,  // front
      4, 5, 6,   4, 6, 7,  // right
      8, 9, 10,  8, 10,11, // up
      12,13,14,  12,14,15, // left
      16,17,18,  16,18,19, // down
      20,21,22,  20,22,23  // back
    ]);
    super(vertices, normals , indices);
  }
}

/**
 * Plane class
 *  v1------v0
 *   |       |
 *   |   x   |
 *   |       |
 *  v2------v3
 * @type {Shape}
 */
class Plane extends Shape {
  constructor() {

    const vertices = new Float32Array([
      1.0, 1.0, 0.0,  -1.0, 1.0, 0.0,  -1.0,-1.0, 0.0,   1.0,-1.0, 0.0
    ]);

    const normals = new Float32Array([
      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0
    ]);

    const indices = new Uint16Array([
      0, 1, 2,   0, 2, 3
    ]);

    super(vertices, normals, indices);
  }
}

/**
 * Sphere
 * @type {Shape}
 */
class Sphere extends Shape{
  constructor(precision = 25) {
    let i, ai, si, ci;
    let j, aj, sj, cj;
    let p1, p2;
    let positions = [];
    let indicesArray = [];

    // Coordinates
    for (j = 0; j <= precision; j++) {
      aj = j * Math.PI / precision;
      sj = Math.sin(aj);
      cj = Math.cos(aj);
      for (i = 0; i <= precision; i++) {
        ai = i * 2 * Math.PI / precision;
        si = Math.sin(ai);
        ci = Math.cos(ai);

        positions.push(si * sj);  // X
        positions.push(cj);       // Y
        positions.push(ci * sj);  // Z
      }
    }

    // Indices
    for (j = 0; j < precision; j++) {
      for (i = 0; i < precision; i++) {
        p1 = j * (precision+1) + i;
        p2 = p1 + (precision+1);

        indicesArray.push(p1);
        indicesArray.push(p2);
        indicesArray.push(p1 + 1);

        indicesArray.push(p1 + 1);
        indicesArray.push(p2);
        indicesArray.push(p2 + 1);
      }
    }

     const vertices = new Float32Array(positions);
      const normals = new Float32Array(positions);
     const indices = new Float32Array(indicesArray);

     super(vertices, normals, indices);
  }
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param cameraMatrix
 * @param modelMatrix
 * @param n
 * @param {DOMMatrixInit} transform
 */
function drawShapeModel(gl, program, cameraMatrix, modelMatrix, n, transform) {

  // Set the model matrix (add the custom scale if any)
  const model = gl.getUniformLocation(program, 'model');
  modelMatrix = (new DOMMatrix(modelMatrix)).preMultiplySelf(transform);

  // Set the model's MVP matrix (camera x model)
  const mvpMatrix = (new DOMMatrix(modelMatrix)).preMultiplySelf(cameraMatrix);
  const mvp = gl.getUniformLocation(program, 'mvp');
  gl.uniformMatrix4fv(mvp, false, mvpMatrix.toFloat32Array());

  // Set the inverse transpose of the model matrix
  const inverseTransposeMatrix = transpose((new DOMMatrix(modelMatrix))).invertSelf();
  const inverseTranspose = gl.getUniformLocation(program, 'inverseTranspose');
  gl.uniformMatrix4fv(inverseTranspose, false, inverseTransposeMatrix.toFloat32Array());

  // Render
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param cameraMatrix
 * @param modelMatrix
 * @param n
 */
function drawModel(gl, program, cameraMatrix, modelMatrix, n) {
  // Set the model matrix (add the custom scale if any)
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
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
}
