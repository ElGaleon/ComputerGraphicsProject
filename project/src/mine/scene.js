class NoScene {
  /**
   * @type { Mesh[]}
   */
  meshes;
  /**
   * @type {Shadows}
   */
  shadows;
  /**
   * @type {Camera}
   */
  camera;
  keys;
  //
  /**
   * @type {HTMLCanvasElement}
   */
  canvas;
  /**
   * @type {WebGLRenderingContext}
   */
  gl;
  /**
   * @type {string}
   */
  objectSrcPath;
  /**
   * @type {WebGLProgram}
   */
  program;
  lights;
  colorProgramInfo;
  textureProgramInfo;

  /**
   *
   * @param {string} canvasName
   * @param {string} objectSrcPath
   */
  constructor(canvasName, objectSrcPath) {
    this.canvas = initCanvas(canvasName);
    this.gl = initWebGLContext(this.canvas);
    this.objectSrcPath = objectSrcPath;

    // Load shaders and init program
    this.gl.enable(this.gl.DEPTH_TEST);
    this.program = webglUtils.createProgramInfo(this.gl, ["base-vertex-shader", "base-fragment-shader"]);

    /**
     *
     * @type {Shadows}
     */
    this.shadows = new Shadows(this.gl);

    /**
     *
     * @type {Mesh[]}
     */
    this.meshes = [];
    this.#loadMeshes().then(() => {});

    this.#initCamera();
    this.#initKeysController();
    this.#initLights();
  }

  get projectionMatrix() {
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    return m4.perspective(degToRad(60), aspect, 0.1, 200);
  }

  /**
   *
   * @param {number} movementStep
   * @return void
   */
  #initKeysController(movementStep= 0.05) {
    this.keys = {};
    // Dolly keys
    if (this.keys["w"]) {
      this.camera.dolly(movementStep);
    }
    if (this.keys["s"]) {
      this.camera.dolly(-movementStep);
    }
    // Truck keys
    if (this.keys["a"]) {
      this.camera.truck(-movementStep);
    }
    if (this.keys["d"]) {
      this.camera.truck(movementStep);
    }
    // Pedestal keys
    if (this.keys["e"]) {
      this.camera.pedestal(-movementStep);
    }
    if (this.keys["q"]) {
      this.camera.pedestal(movementStep);
    }
    // Cant keys
    if (this.keys["h"]) {
      this.camera.cant(-movementStep);
    }
    if (this.keys["k"]) {
      this.camera.cant(movementStep);
    }
    // Tilt keys
    if (this.keys["ArrowUp"]){
      this.camera.tilt(movementStep)
    }
    if (this.keys["ArrowDown"]){
      this.camera.tilt(-movementStep)
    }
    // Pan keys
    if (this.keys["ArrowLeft"]){
      this.camera.pan(movementStep)
    }
    if (this.keys["ArrowRight"]){
      this.camera.pan(-movementStep)
    }
    // Reset
    if (this.keys["r"]){
      this.camera.reset()
    }
  }

  async #loadMeshes(){
    const json = await loadJsonFile(this.objectSrcPath);
    console.log(json);
    for (let i = 0; i < json.meshes.length; i++) {
      const mesh = json.meshes[i];
      this.meshes.push(new Mesh(this.gl, mesh));
    }
  }

  /**
   *
   * @param {Vector3} position
   * @param {Vector3} target
   * @param {Vector3} up
   * @return void
   */
  #initCamera(position = [10, 2, 10], target = [0, 2, 0], up = [0, 1, 0]) {
    this.camera = new Camera(position, target, up);
  }

  /**
   *
   * @param {Vector3} position
   * @param {Vector3} direction
   * @param {Vector3} color
   * @param {Vector3} ambient
   */
  #initLights(position = [10, 5, 2], direction = [1, 1, 1], color = [1.0, 1.0, 1.0], ambient = [0.1, 0.1, 0.1]) {
    this.lights = {
      position: position,
      direction: direction,
      color: color,
      ambient: ambient,
    }
  }

  // Render the scene on the canvas.
  draw() {
    resizeCanvasToDisplaySize(this.gl.canvas);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    function bindFrameBufferNull() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    if(this.shadows.enabled){
      const lightWorldMatrix = m4.lookAt(
        this.lights.position,       // position
        this.lights.direction,      // target
        [0, 1, 0],                  // up
      );

      const lightProjectionMatrix = m4.perspective(
        degToRad(this.shadows.fieldOfView),
        this.shadows.projectionWidth / this.shadows.projectionHeight,
        0.5,                        // near
        this.shadows.zFarProjection);     // far

      let sharedUniforms = {
        u_view: m4.inverse(lightWorldMatrix),                  // View Matrix
        u_projection: lightProjectionMatrix,                   // Projection Matrix
        u_bias: this.shadows.bias,
        u_textureMatrix: m4.identity(),
        u_projectedTexture: this.shadows.depthTexture,
        u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
      };

      // draw to the depth texture
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.shadows.depthFrameBuffer);
      this.gl.viewport(0, 0, this.shadows.depthTextureSize, this.shadows.depthTextureSize);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      this.meshes.forEach(m => {
        m.render(this.gl, this.colorProgramInfo, sharedUniforms);
      });

      bindFrameBufferNull()

      let textureMatrix = m4.identity();
      textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
      textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
      textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
      // use the inverse of this world matrix to make
      // a matrix that will transform other positions
      // to be relative this world space.
      textureMatrix = m4.multiply(
        textureMatrix,
        m4.inverse(lightWorldMatrix));


      sharedUniforms = {
        u_view: this.camera.viewMatrix,
        u_projection: this.projectionMatrix,
        u_bias: this.shadows.bias,
        u_textureMatrix: textureMatrix,
        u_projectedTexture: this.shadows.depthTexture,
        u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
        u_worldCameraPosition: this.camera.position,
      };

      this.meshes.forEach(m => {
        m.render(this.gl, this.textureProgramInfo, sharedUniforms);
      });

      if (this.shadows.showFrustum){
        this.gl.useProgram(this.colorProgramInfo.program);
        const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(this.gl, {
          position: [
            -1, -1, -1,
            1, -1, -1,
            -1,  1, -1,
            1,  1, -1,
            -1, -1,  1,
            1, -1,  1,
            -1,  1,  1,
            1,  1,  1,
          ],
          indices: [
            0, 1,
            1, 3,
            3, 2,
            2, 0,

            4, 5,
            5, 7,
            7, 6,
            6, 4,

            0, 4,
            1, 5,
            3, 7,
            2, 6,
          ],
        });

        webglUtils.setBuffersAndAttributes(this.gl, this.colorProgramInfo, cubeLinesBufferInfo);

        const mat = m4.multiply(
          lightWorldMatrix, m4.inverse(lightProjectionMatrix));

        webglUtils.setUniforms(this.colorProgramInfo, {
          u_color: [1, 1, 1, 1],
          u_view: this.camera.viewMatrix,
          u_projection: this.projectionMatrix,
          u_world: mat,
        });

        webglUtils.drawBufferInfo(this.gl, cubeLinesBufferInfo, this.gl.LINES);
      } else {
        bindFrameBufferNull()

        const sharedUniforms = {
          u_ambientLight: this.lights.ambient,                      // Ambient
          u_lightDirection: m4.normalize(this.lights.direction),    // Light Direction
          u_lightColor: this.lights.color,                          // Light Color
          u_view: this.camera.viewMatrix,                     // View Matrix
          u_projection: this.projectionMatrix,                   // Projection Matrix
          u_viewWorldPosition: this.camera.position,          // Camera position
          u_lightPosition: (this.lights.position),
        };

        this.meshes.forEach(m => {
          m.render(this.gl, this.program, sharedUniforms);
        });

        console.log('SUCCESS');
      }

    }
  }
}
