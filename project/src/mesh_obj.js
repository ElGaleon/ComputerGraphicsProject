const startTime = performance.now();

class MeshObj {
  /**
   * @type {string}
   */
  name;
  /**
   * @type {string} - identifies .obj file path
   */
  objSource;
  /**
   * @type {string} - identifies .mtl file path
   */
  mtlSource;
  /**
   * @type {Vector3}
   */
  position;
  /**
   * @type
   */
  mesh;
  /**
   * @type {Vector3}
   */
  initialRotation;
  /**
   * @type {number}
   */
  initialScale;
  /**
   * @type {Vector3}
   */
  rotate;
  /**
   * @type {number}
   */
  angle;
  /**
   * @type {Vector3}
   */
  isReady;

  constructor(obj, gl) {
    this.name = obj.name;               // Obj name, used only for debugging
    this.objSource = obj.objSource;   // Path to obj file
    this.mtlSource = obj.mtlSource;   // Path to mtl file
    this.position = obj.position;       // Where to move the mesh once loaded
    this.mesh = [];                         // This object stores all the mesh information
    this.mesh.sourceMesh = this.objSource; // .sourceMesh is used in load_mesh.js
    this.mesh.fileMTL = this.mtlSource;    // .fileMTL is used in load_mesh.js

    if (obj.initialRotation) {
      this.initialRotation = obj.initialRotation;
    }

    if (obj.initialScale) {
      this.initialScale = obj.initialScale;
    }

    if (obj.rotate) { // Used for world matrix transform
      this.rotate = obj.rotate;
      this.angle = 0;
    }

    this.isReady = false;

    LoadMesh(gl, this.mesh).then(() => { // After loading the mesh...
      this.composeMesh(gl);
      this.isReady = true; // now the mesh is ready to be rendered
    });
  }

  /**
   *
   * @param {WebGLRenderingContext} gl
   * @returns {void}
   */
  composeMesh(gl) {
    const defaultMaterial = {
      // Setting default material properties
      diffuse: [1, 1, 1],
      diffuseMap: this.mesh.textures.defaultWhite,
      ambient: [0, 0, 0],
      specular: [1, 1, 1],
      shininess: 400,
      opacity: 1,
    };

    // Moving to the initial position
    let x = this.position?.x ?? this.position[0];
    let y = this.position?.y ?? this.position[1];
    let z = this.position?.z ?? this.position[2];

    this.mesh.data.geometries.forEach(geom => {
      // Moving the mesh to the initial position.
      for (let i = 0; i < geom.data.position.length; i = i + 3) {
        geom.data.position[i] += x;
        geom.data.position[i + 1] += y;
        geom.data.position[i + 2] += z;
      }
    });

    this.mesh.parts = this.mesh.data.geometries.map(({material, data}) => {
      if (data.color) {
        if (data.position.length === data.color.length) {
          data.color = {numComponents: 3, data: data.color};
        }
      } else {
        data.color = {value: [1, 1, 1, 1]};
      }

      const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
      return {
        material: {
          ...defaultMaterial,
          ...this.mesh.materials[material],
        },
        bufferInfo,
      };
    });

    this.ready = true; // now the mesh is ready to be rendered
  }

  /**
   * Render the mesh
   * @param {WebGLRenderingContext} gl
   * @param programInfo
   * @param uniforms
   * @return void
   */
  render(gl, programInfo, uniforms) {
    // If the mesh isn't ready, then return
    if (!this.isReady) {
      return;
    }
    let now = performance.now();
    let elapsedTime = (now - startTime) / 1000; // in seconds

    gl.useProgram(programInfo.program);
    webglUtils.setUniforms(programInfo, uniforms);

    const u_world = this.computeModelMatrix(elapsedTime);

    for (const {bufferInfo, material} of this.mesh.parts) {
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      // calls gl.uniform
      webglUtils.setUniforms(programInfo, {
        u_world,
      }, material);
      // calls gl.drawArrays or gl.drawElements
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }
  }


  computeModelMatrix(elapsedTime) {
    let modelMatrix = m4.identity();

    // 3️⃣ Applica lo scaling PRIMA della rotazione
    if (this.initialScale) {
      modelMatrix = m4.scale(modelMatrix, this.initialScale, this.initialScale, this.initialScale);
    }

    if (this.initialRotation) {
      if (this.initialRotation.x) modelMatrix = m4.xRotate(modelMatrix, degToRad(this.initialRotation.x));
      if (this.initialRotation.y) modelMatrix = m4.yRotate(modelMatrix, degToRad(this.initialRotation.y));
      if (this.initialRotation.z) modelMatrix = m4.zRotate(modelMatrix, degToRad(this.initialRotation.z));
    }

    if (this.rotate) {
      let rotationSpeed = 2 * Math.PI / 5;
      if (this.rotate.x) {
        modelMatrix = m4.xRotate(modelMatrix, elapsedTime * rotationSpeed);
      }
      if (this.rotate.y) {
        modelMatrix = m4.yRotate(modelMatrix, degToRad(this.angle));
        this.angle = this.angle === 360 ? 0 : this.angle + 5;
      }
      if (this.rotate.z) {
        modelMatrix = m4.zRotate(modelMatrix, elapsedTime * rotationSpeed);
      }
    }
    return modelMatrix;
  }


}
