const startTime = performance.now();

class MeshObj {
  name;
  objSource;
  mtlSource;
  /**
   * @type {Vector3}
   */
  position;
  mesh;
  initialRotation;
  initialScale;
  rotate;
  angle;
  isReady;
  pivot;
    constructor(obj,gl) {
        this.name = obj.name;               // Obj name, used only for debugging
        this.objSource = obj.objSource;   // Path to obj file
        this.mtlSource = obj.mtlSource;   // Path to mtl file
        this.position = obj.position;       // Where to move the mesh once loaded
      this.pivot = obj.pivot;
        this.mesh = [];                         // This object stores all the mesh information
        this.mesh.sourceMesh = this.objSource; // .sourceMesh is used in load_mesh.js
        this.mesh.fileMTL = this.mtlSource;    // .fileMTL is used in load_mesh.js

      if (obj.initialRotation) {
        this.initialRotation = obj.initialRotation;
      }

      if (obj.initialScale) {
        this.initialScale = obj.initialScale;
      }

        if (obj.rotate){ // Used for world matrix transform
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
    composeMesh(gl){
      const defaultMaterial = {
        // Setting default material properties
        diffuse: [1, 1, 1],
        diffuseMap: this.mesh.textures.defaultWhite,
        ambient: [0, 0, 0],
        specular: [1, 1, 1],
        shininess: 400,
        opacity: 1,
      };


      /**
      // Moving to the initial position
      let x = this.position?.x ?? this.position[0];
      let y = this.position?.y ?? this.position[1];
      let z = this.position?.z ?? this.position[2];

      this.mesh.data.geometries.forEach(geom => {
        // Moving the mesh to the initial position.
        for (let i = 0; i < geom.data.position.length; i = i+3) {
          geom.data.position[i] += x;
          geom.data.position[i+1] += y;
          geom.data.position[i+2] += z;
        }
      });
        **/

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

      this.ready = true; // now the mesh is ready to be rendered
    }

    /**
   * Render the mesh
   * @param {WebGLRenderingContext} gl
   * @param programInfo
   * @param uniforms
   * @return void
   */
    render(gl, programInfo, uniforms){
        if (!this.isReady) {
          return;
        }
    let now = performance.now();
    let elapsedTime = (now - startTime) / 1000; // Converte in secondi


        gl.useProgram(programInfo.program);
        webglUtils.setUniforms(programInfo, uniforms);
/**
        // compute the world matrix
        let u_world = m4.identity()

    // u_world = m4.translate(u_world, [-this.position?.x, -this.position?.y, -this.position?.z]);


    u_world = m4.translate(u_world, [this.position?.x, this.position?.y, this.position?.z]);

        // Set initial rotation
        if (this.initialRotation?.x) {
          u_world = m4.xRotate(u_world, degToRad(this.initialRotation.x));
        }
        if (this.initialRotation?.y) {
          u_world = m4.yRotate(u_world, degToRad(this.initialRotation.y));
        }
        if (this.initialRotation?.z) {
          u_world = m4.zRotate(u_world, degToRad(this.initialRotation.z));
        }

        // Set initial scaling
        if (this.initialScale) {
          m4.scaling(this.initialScale, this.initialScale, this.initialScale, u_world);
        }


        if (this.rotate === true && uniforms.u_textureMatrix !== m4.identity() ){
          console.log(this.position?.x);
            u_world = m4.zRotate(u_world, degToRad(this.angle));
            this.angle = this.angle === 360? 0 : this.angle+5;
        }
          **/

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

    // Pivot per il cambio di origine della rotazione
    const pivot = this.pivot || [0, 0, 0];

    // 1️⃣ Sposta l'oggetto nella sua posizione iniziale
    modelMatrix = m4.translate(modelMatrix, ...this.position);

    // 2️⃣ Sposta l'oggetto all'origine locale (pivot) per ruotarlo su se stesso
    modelMatrix = m4.translate(modelMatrix, ...pivot.map(v => -v));

    // 3️⃣ Applica lo scaling PRIMA della rotazione
    if (this.initialScale) {
      modelMatrix = m4.scale(modelMatrix, this.initialScale, this.initialScale, this.initialScale);
    }

    // 4️⃣ Applica la rotazione iniziale se presente
    if (this.initialRotation) {
      if (this.initialRotation.x) modelMatrix = m4.xRotate(modelMatrix, degToRad(this.initialRotation.x));
      if (this.initialRotation.y) modelMatrix = m4.yRotate(modelMatrix, degToRad(this.initialRotation.y));
      if (this.initialRotation.z) modelMatrix = m4.zRotate(modelMatrix, degToRad(this.initialRotation.z));
    }

    // 5️⃣ Rotazione dinamica nel tempo (se abilitata)
    if (this.rotate) {
      let rotationSpeed = 2 * Math.PI / 5; // Un giro completo ogni 5 secondi
      if (this.rotate.x) {
        modelMatrix = m4.xRotate(modelMatrix, elapsedTime * rotationSpeed);
      }
      if (this.rotate.y) {
        modelMatrix = m4.yRotate(modelMatrix, elapsedTime * rotationSpeed);
      }
      if (this.rotate.z) {
        modelMatrix = m4.zRotate(modelMatrix, elapsedTime * rotationSpeed);
      }
    }

    // 6️⃣ Riporta l'oggetto nella sua posizione originale dopo il pivot
    modelMatrix = m4.translate(modelMatrix, ...pivot);

    return modelMatrix;
  }



}
