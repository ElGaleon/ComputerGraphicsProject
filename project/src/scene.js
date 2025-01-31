class Scene {
  /**
   * @type {string}
   */
  sceneId;
  /**
   * @type {WebGLRenderingContext}
   */
  gl;
  /**
   * @type {HTMLCanvasElement}
   */
  canvas;
  /**
   * @type { ProgramInfo }
   */
  program;
  /**
   * @type { Perspective }
   */
  perspective;
  /**
   * @type {SkyBox}
   */
  skybox;
  /**
   * @type {Shadow}
   */
  shadow;
  /**
   * @type {MeshObj[]}
   */
  meshes;
  /**
   * @type {Camera}
   */
  camera;
  /**
   * @type {Light}
   */
  light;
  /**
   * @type {KeyController}
   */
  keyController;
  /**
   * @type {MouseController}
   */
  mouseController;
  /**
   * @type {TouchController}
   */
  touchController;
  /**
   * @type {JSON}
   */
  json;
  /**
   * @type {GUI}
   */
  gui;

  /**
   *
   * @param {string} canvasId - canvas id to render on
   * @param {string} sceneId - selected scene id
   * @param {JSON} configJson - config file
   */
  // Scene constructor
  constructor(canvasId, sceneId, configJson) {
    // Getting WebGL context from canvas
    this.canvas = initCanvas(canvasId);
    this.gl = initWebGLContext(this.canvas);
    this.sceneId = sceneId;

    this.gl.enable(this.gl.DEPTH_TEST);

    this.program = webglUtils.createProgramInfo(this.gl, ["base-vertex-shader", "base-fragment-shader"]);

    if (configJson?.skybox) {
      this.skybox = new SkyBox(this.gl, this, configJson.skybox);
    }
    this.shadow = new Shadow(this.gl);
    this.perspective = new Perspective(this.gl, configJson?.perspective?.fieldOfView, configJson?.perspective?.projectionWidth, configJson?.perspective?.projectionHeight, configJson?.perspective?.zNear, configJson?.perspective?.zFar);

    this.meshes = []; // Array used to store all the mesh used in the scene
    configJson?.meshes.forEach(obj => {
      this.meshes.push(new MeshObj(obj, this.gl))
    });

    // Creating a camera for this scene
    this.camera = new Camera(configJson?.camera?.position, configJson?.camera?.target, configJson?.camera?.up);
    this.keys = {};

    // Light used in the scene
    this.light = new Light(configJson?.light?.position,configJson?.light?.direction,configJson?.light?.color,configJson?.light?.ambient);
    this.keyController = new KeyController(this.camera, 0.5);

    this.mouseController = new MouseController(this.camera);
    this.touchController = new TouchController(this);
  }

  // Compute the projection matrix
  get projectionMatrix() {
    let fieldOfViewRadians = degToRad(scene.perspective.fieldOfView);
    return m4.perspective(fieldOfViewRadians, scene.perspective.aspectRatio, scene.perspective.zNear, scene.perspective.zFar);
  }

  // Change the type of camera, AnimatedCamera or Camera
  switchCamera() {
    if (this.camera instanceof AnimatedCamera) {
      const position = [10, 2, 10], target = [0, 2, 0], up = [0, 1, 0];
      this.camera = new Camera(position, target, up);
    } else {
      this.camera = new AnimatedCamera();
    }
  }

  #bindFrameBufferNull() {
    // draw scene to the canvas projecting the depth texture into the scene
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  render() {
    // Resizing the canvas to the window size
    resizeCanvasToDisplaySize(scene.gl.canvas);
    this.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.shadow.enable ? this.renderWithShadows() : this.renderWithoutShadows();

    if (this.skybox?.enabled) {
      this.skybox.render(this);
    }

    requestAnimationFrame(() => this.render());
  }

  renderWithShadows() {
    const lightWorldMatrix = m4.lookAt(
      this.light.position,       // position
      this.light.direction,      // target
      [0, 1, 0],                  // up
    );

    const lightProjectionMatrix = m4.perspective(
      degToRad(this.perspective.fieldOfView),
      this.perspective.aspectRatio,
      0.5,                        // near
      this.perspective.zFar);     // far

    let sharedUniforms = {
      u_view: m4.inverse(lightWorldMatrix),                  // View Matrix
      u_projection: lightProjectionMatrix,                   // Projection Matrix
      u_bias: this.shadow.bias,
      u_textureMatrix: m4.identity(),
      u_projectedTexture: this.shadow.depthTexture,
      u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
    };

    // draw to the depth texture
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.shadow.depthFrameBuffer);
    this.gl.viewport(0, 0, this.shadow.depthTextureSize, this.shadow.depthTextureSize);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.meshes.forEach(m => {
      m.render(this.gl, scene.shadow.colorProgramInfo, sharedUniforms);
    });

    this.#bindFrameBufferNull()

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
      u_bias: this.shadow.bias,
      u_textureMatrix: textureMatrix,
      u_projectedTexture: this.shadow.depthTexture,
      u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
      u_worldCameraPosition: this.camera.getPosition(),
    };

    this.meshes.forEach(m => {
      m.render(this.gl, scene.shadow.textureProgramInfo, sharedUniforms);
    });
  }

  renderWithoutShadows() {
    this.#bindFrameBufferNull()

    const sharedUniforms = {
      u_ambientLight: this.light.ambient,                      // Ambient
      u_lightDirection: m4.normalize(this.light.direction),    // Light Direction
      u_lightColor: this.light.color,                          // Light Color
      u_view: this.camera.viewMatrix,                          // View Matrix
      u_projection: this.projectionMatrix,                     // Projection Matrix
      u_viewWorldPosition: this.camera.getPosition(),          // Camera position
      u_lightPosition: (this.light.position),
    };

    this.meshes.forEach(m => {
      m.render(this.gl, this.program, sharedUniforms);
    });
  }

}
