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
   * @type {{}}
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
   *
   * @param {string} canvasId
   * @param {string} sceneId
   * @param {JSON} json
   */
  // Scene constructor
  constructor(canvasId, sceneId, json) {
    // Getting WebGL context from canvas
    this.canvas = initCanvas(canvasId);
    this.gl = initWebGLContext(canvas);
    this.sceneId = sceneId;

    this.gl.enable(this.gl.DEPTH_TEST);

    this.program = webglUtils.createProgramInfo(this.gl, ["base-vertex-shader", "base-fragment-shader"]);

    this.skybox = new SkyBox(this.gl, this);
    this.shadow = new Shadow(this.gl);

    this.meshes = []; // Array used to store all the mesh used in the scene
    json?.meshes.forEach(obj => this.meshes.push(new MeshObj(obj, this.gl)));

    // Creating a camera for this scene
    this.camera = new Camera(json?.camera?.position, json?.camera?.target, json?.camera?.up);
    this.keys = {};

    // Light used in the scene
    this.light = new Light(json?.light?.position,json?.light?.direction,json?.light?.color,json?.light?.ambient);
    this.keyController = new KeyController(this.camera, 0.5);

    this.mouseController = new MouseController(this.camera);
    this.touchController = new TouchController(this.camera);
  }

  // Compute the projection matrix
  get projectionMatrix() {
    let fieldOfViewRadians = degToRad(60);
    let aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
    let zMin = 0.1;
    return m4.perspective(fieldOfViewRadians, aspect, zMin, 200);
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
    // scene.key_controller();

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.shadow.enable ? this.#renderWithShadows() : this.#renderWithoutShadows();

    if (this.skybox.enable) {
      this.skybox.render(this);
    }

    requestAnimationFrame(draw);
  }

  #renderWithShadows() {
    const lightWorldMatrix = m4.lookAt(
      this.light.position,       // position
      this.light.direction,      // target
      [0, 1, 0],                  // up
    );

    const lightProjectionMatrix = m4.perspective(
      degToRad(this.shadow.fieldOfView),
      this.shadow.projectionWidth / this.shadow.projectionHeight,
      0.5,                        // near
      this.shadow.zFarProjection);     // far

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

    if (this.shadow.showFrustum) {
      this.gl.useProgram(scene.shadow.colorProgramInfo.program);
      const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(this.gl, {
        position: [
          -1, -1, -1,
          1, -1, -1,
          -1, 1, -1,
          1, 1, -1,
          -1, -1, 1,
          1, -1, 1,
          -1, 1, 1,
          1, 1, 1,
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

      webglUtils.setBuffersAndAttributes(this.gl, scene.shadow.colorProgramInfo, cubeLinesBufferInfo);

      const mat = m4.multiply(
        lightWorldMatrix, m4.inverse(lightProjectionMatrix));

      webglUtils.setUniforms(scene.shadow.colorProgramInfo, {
        u_color: [1, 1, 1, 1],
        u_view: this.camera.viewMatrix,
        u_projection: this.projectionMatrix,
        u_world: mat,
      });

      webglUtils.drawBufferInfo(this.gl, cubeLinesBufferInfo, this.gl.LINES);
    }

  }

  #renderWithoutShadows() {
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

// Draw everything in the scene on the canvas.
function draw() {
  // Resizing the canvas to the window size
  resizeCanvasToDisplaySize(scene.gl.canvas);
  scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);
  // scene.key_controller();

  scene.gl.enable(scene.gl.CULL_FACE);
  scene.gl.enable(scene.gl.DEPTH_TEST);
  scene.gl.enable(scene.gl.BLEND);
  scene.gl.blendFunc(scene.gl.SRC_ALPHA, scene.gl.ONE_MINUS_SRC_ALPHA);

  let proj = scene.projectionMatrix;
  let view = scene.camera.viewMatrix

  function bindFrameBufferNull() {
    // draw scene to the canvas projecting the depth texture into the scene
    scene.gl.bindFramebuffer(scene.gl.FRAMEBUFFER, null);
    scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);
    scene.gl.clearColor(0, 0, 0, 1);
    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);
  }

  if (scene.shadow.enable) {
    const lightWorldMatrix = m4.lookAt(
      scene.light.position,       // position
      scene.light.direction,      // target
      [0, 1, 0],                  // up
    );

    const lightProjectionMatrix = m4.perspective(
      degToRad(scene.shadow.fieldOfView),
      scene.shadow.projectionWidth / scene.shadow.projectionHeight,
      0.5,                        // near
      scene.shadow.zFarProjection);     // far

    let sharedUniforms = {
      u_view: m4.inverse(lightWorldMatrix),                  // View Matrix
      u_projection: lightProjectionMatrix,                   // Projection Matrix
      u_bias: scene.shadow.bias,
      u_textureMatrix: m4.identity(),
      u_projectedTexture: scene.shadow.depthTexture,
      u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
    };

    // draw to the depth texture
    scene.gl.bindFramebuffer(scene.gl.FRAMEBUFFER, scene.shadow.depthFrameBuffer);
    scene.gl.viewport(0, 0, scene.shadow.depthTextureSize, scene.shadow.depthTextureSize);
    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);

    scene.meshes.forEach(m => {
      m.render(scene.gl, scene.shadow.colorProgramInfo, sharedUniforms);
    });

    bindFrameBufferNull();

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
      u_view: scene.camera.viewMatrix,
      u_projection: proj,
      u_bias: scene.shadow.bias,
      u_textureMatrix: textureMatrix,
      u_projectedTexture: scene.shadow.depthTexture,
      u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
      u_worldCameraPosition: scene.camera.getPosition(),
    };

    scene.meshes.forEach(m => {
      m.render(scene.gl, scene.shadow.textureProgramInfo, sharedUniforms);
    });

    if (scene.shadow.showFrustum) {
      scene.gl.useProgram(scene.shadow.colorProgramInfo.program);
      const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(scene.gl, {
        position: [
          -1, -1, -1,
          1, -1, -1,
          -1, 1, -1,
          1, 1, -1,
          -1, -1, 1,
          1, -1, 1,
          -1, 1, 1,
          1, 1, 1,
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

      webglUtils.setBuffersAndAttributes(scene.gl, scene.shadow.colorProgramInfo, cubeLinesBufferInfo);

      const mat = m4.multiply(
        lightWorldMatrix, m4.inverse(lightProjectionMatrix));

      webglUtils.setUniforms(scene.shadow.colorProgramInfo, {
        u_color: [1, 1, 1, 1],
        u_view: view,
        u_projection: proj,
        u_world: mat,
      });

      webglUtils.drawBufferInfo(scene.gl, cubeLinesBufferInfo, scene.gl.LINES);
    }

  } else {
    bindFrameBufferNull()

    const sharedUniforms = {
      u_ambientLight: scene.light.ambient,                      // Ambient
      u_lightDirection: m4.normalize(scene.light.direction),    // Light Direction
      u_lightColor: scene.light.color,                          // Light Color
      u_view: scene.camera.viewMatrix,                     // View Matrix
      u_projection: scene.projectionMatrix,                   // Projection Matrix
      u_viewWorldPosition: scene.camera.getPosition(),          // Camera position
      u_lightPosition: (scene.light.position),
    };

    scene.meshes.forEach(m => {
      m.render(scene.gl, scene.program, sharedUniforms);
    });
  }

  if (scene.skybox.enable) {
    // Removing translation from view matrix
    view[12] = 0;
    view[13] = 0;
    view[14] = 0;
    scene.gl.depthFunc(scene.gl.LEQUAL);
    scene.gl.useProgram(scene.skybox.programInfo.program);

    webglUtils.setBuffersAndAttributes(scene.gl, scene.skybox.programInfo, scene.skybox.quadBufferInfo);
    webglUtils.setUniforms(scene.skybox.programInfo, {
      u_viewDirectionProjectionInverse: m4.inverse(m4.multiply(proj, view)),
      u_skybox: scene.skybox.texture,
      u_lightColor: scene.light.color,
    });
    webglUtils.drawBufferInfo(scene.gl, scene.skybox.quadBufferInfo);
    scene.gl.depthFunc(scene.gl.LESS);
  }

  requestAnimationFrame(draw);
}
