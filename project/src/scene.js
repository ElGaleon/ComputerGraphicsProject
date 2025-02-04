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
   * @type {CanvasRenderingContext2D}
   */
  canvas2D;
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
   * @type {Controller2D}
   */
  controller2D;
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

    // Enable depth test for shadowing
    this.gl.enable(this.gl.DEPTH_TEST);

    // Init WebGL Program
    this.program = webglUtils.createProgramInfo(this.gl, ["base-vertex-shader", "base-fragment-shader"]);

    // Init Skybox
    if (configJson?.skybox) {
      this.skybox = new SkyBox(this.gl, this, configJson.skybox);
    }

    // Init Shadow
    this.shadow = new Shadow(this.gl);

    // Loading all the meshes in the scene
    this.meshes = [];
    configJson?.meshes.forEach(obj => {
      this.meshes.push(new MeshObj(obj, this.gl))
    });

    // Creating a camera for this scene
    this.camera = new Camera(configJson?.camera?.position, configJson?.camera?.target, configJson?.camera?.up, configJson?.camera.perspective);

    // Light used in the scene
    this.light = new Light(configJson?.light?.position, configJson?.light?.direction, configJson?.light?.color, configJson?.light?.ambient);

    // Controller to handle keyboard, mouse and touch events
    this.keyController = new KeyController(this.camera, 0.5);
    this.mouseController = new MouseController(this.camera);
    this.touchController = new TouchController(this);
    // this.controller2D = new Controller2D(this);
  }

  // Get the projection matrix
  get projectionMatrix() {
    return m4.perspective(degToRad(scene.camera.fieldOfView), scene.camera.aspectRatio, scene.camera.zNear, scene.camera.zFar);
  }
}
