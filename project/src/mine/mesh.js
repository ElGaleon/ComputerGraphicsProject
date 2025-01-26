class NoMesh {
  name;
  objSource;
  mtlSource;
  position;
  mesh;
  rotate;
  angle;
  isReady;
  /**
   *
   * @param {WebGLRenderingContext} gl
   * @param {any} object
   */
  constructor(gl, object) {
    this.name = object.name;               // Obj name, used only for debugging
    this.obj_source = object.objSource;   // Path to obj file
    this.mtl_source = object.mtlSource;   // Path to mtl file
    this.position = object.position;       // Where to move the mesh once loaded

    this.mesh = {};                         // This object stores all the mesh information
    this.mesh.sourceMesh = this.obj_source; // .sourceMesh is used in load_mesh.js
    this.mesh.fileMTL = this.mtl_source;    // .fileMTL is used in load_mesh.js

    if (object.rotate){ // Used for world matrix transform
      this.rotate = object.rotate;
      this.angle = 0;
    }

    this.isReady = false;
    console.log("LOAD MESH CALLED FOR: " + this.mesh.sourceMesh);
    LoadMesh(gl, this.mesh).then(() => {
     this.composeMesh(gl).then(() => {});
      this.isReady = true;
    });
  }

  /**
   *
   * @param {WebGLRenderingContext} gl
   * @returns {Promise<void>}
   */
  async composeMesh(gl){
    console.log("MESH: " +  this.mesh);
    // Generic material
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
    let z = this.position[2]
    let y = this.position[1]
    let x = this.position[0]


    this.mesh.data.geometries.forEach(geom => {
      // Moving the mesh to the initial position.
      for (let i = 0; i < geom.data.position.length; i = i+3) {
        geom.data.position[i] += (y);
        geom.data.position[i+1] += (z);
        geom.data.position[i+2] += (x);
      }
    })

    this.mesh.parts = this.mesh.data.geometries.map(({material, data}) => {
      if (data.color) {
        if (data.position.length === data.color.length) {
          data.color = { numComponents: 3, data: data.color };
        }
      } else {
        data.color = { value: [1, 1, 1, 1] };
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
  }

  /**
   * Render the mesh
   * @param {WebGLRenderingContext} gl
   * @param programInfo
   * @param uniforms
   * @return void
   */
  render(gl, programInfo, uniforms) {
    if (!this.isReady) {
      return;
    }

    gl.useProgram(programInfo.program);
    webglUtils.setUniforms(programInfo, uniforms);

    // Compute the world matrix
    let uWorld = m4.identity();
    if (this.rotate === true && uniforms.u_textureMatrix !== m4.identity()) {
      uWorld = m4.zRotate(uWorld, degToRad(this.angle));
      uWorld = m4.yRotate(uWorld, degToRad(this.angle));
      this.angle = this.angle === 360 ? 0 : this.angle + 5;
    }

    for (const {bufferInfo, material} of this.mesh.parts) {
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      // calls gl.uniform
      webglUtils.setUniforms(programInfo, {
        uWorld,
      }, material);
      // calls gl.drawArrays or gl.drawElements
      webglUtils.drawBufferInfo(gl, bufferInfo);
    }
  }
}
