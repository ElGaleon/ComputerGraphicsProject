class GUI {
  /**
   * @type {Scene}
   */
  scene;
  /**
   * @type
   */
  gui;
  /**
   * @type {any[]}
   */
  cameraFolder;
  lightPositionFolder;
  lightDirectionFolder;
  lightColorFolder;
  shadowFolder;
  lightFolder;
  skyboxFolder;


  /**
   *
   * @param {Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.gui = new dat.gui.GUI({autoPlace: false});
    // Projection
    this.cameraFolder = this.#initCameraFolder();
    // Shadow
    this.shadowFolder = this.#initShadowFolder();
    // Skybox
    this.skyboxFolder = (scene.json?.skybox) ? this.#initSkybox() : [];
    // Lights
    this.lightFolder = this.#initLightFolder();
    document.getElementById("gui").append(this.gui.domElement);
  }

  #initCameraFolder() {
    const cameraFolder = this.gui.addFolder('Camera');
    cameraFolder.add(scene.camera, "fieldOfView").min(30).max(180).step(15).name("Field of View (FOV)").listen();
    cameraFolder.add(scene.camera, "projectionWidth").min(1).max(10).step(1).name("Projection Width").listen();
    cameraFolder.add(scene.camera, "projectionHeight").min(1).max(10).step(1).name("Projection Height").listen();
    cameraFolder.add(scene.camera, "zNear").min(1).max(30).step(1).name("z Near Projection").listen();
    cameraFolder.add(scene.camera, "zFar").min(1).max(100).step(1).name("z Far Projection").listen();

    return cameraFolder;
  }

  #initLightFolder() {
    const lightFolder = this.gui.addFolder('Light');
    this.#initLightPositionFolder(lightFolder);
    this.#initLightDirectionFolder(lightFolder);
    this.#initLightColorFolder(lightFolder);
    this.#initLightProjectionFolder(lightFolder);
    return lightFolder;
  }

  #initLightPositionFolder(lightFolder) {
    const lightPosition = lightFolder.addFolder('Position');
    lightPosition.add(scene.light.position, 0).min(-10).max(10).step(1).name("X").listen();
    lightPosition.add(scene.light.position, 1).min(-10).max(10).step(1).name("Y").listen();
    lightPosition.add(scene.light.position, 2).min(-10).max(10).step(1).name("Z").listen();
  }

  #initLightDirectionFolder(lightFolder) {
    const lightDirection = lightFolder.addFolder('Direction');
    lightDirection.add(scene.light.direction, 0).min(-10).max(10).step(0.25).name("X").listen();
    lightDirection.add(scene.light.direction, 1).min(-10).max(10).step(0.25).name("Y").listen();
    lightDirection.add(scene.light.direction, 2).min(-10).max(10).step(0.25).name("Z").listen();
  }

  #initLightColorFolder(lightFolder) {
    const lightColor = lightFolder.addFolder('Color');
    lightColor.add(scene.light.color, 0).min(0.1).max(1).step(0.05).name("R").listen();
    lightColor.add(scene.light.color, 1).min(0.1).max(1).step(0.05).name("G").listen();
    lightColor.add(scene.light.color, 2).min(0.1).max(1).step(0.05).name("B").listen();
  }

  #initLightProjectionFolder(lightFolder) {
    const lightProjection = lightFolder.addFolder('Projection');
    lightProjection.add(scene.light, "fieldOfView").min(0).max(180).step(15).name("Field of View (FOV)").listen();
    lightProjection.add(scene.light, "projectionWidth").min(0).max(2).step(0.1).name("Projection Width").listen();
    lightProjection.add(scene.light, "projectionHeight").min(0).max(2).step(0.1).name("Projection Height").listen();
    lightProjection.add(scene.light, "zNear").min(1).max(30).step(1).name("z Near Projection").listen();
    lightProjection.add(scene.light, "zFar").min(1).max(30).step(1).name("z Far Projection").listen();
  }

  #initShadowFolder() {
    const shadowFolder = this.gui.addFolder('Shadow');
    shadowFolder.add(scene.shadow, "bias").min(0.005).max(0.1).step(0.001).name("Bias").listen();
    this.#initToggleShadow(shadowFolder);
    this.#initToggleShowFrustum(shadowFolder);
    return shadowFolder;
  }

  #initToggleShadow(shadowFolder) {
    this.scene['Toggle shadows'] = function () {
      scene.shadow.toggle();
    };
    shadowFolder.add(this.scene, 'Toggle shadows');
  }

  #initToggleShowFrustum(shadowFolder) {
    this.scene['Show Frustum'] = function () {
      scene.shadow.toggleShowFrustum();
    };
    shadowFolder.add(this.scene, 'Show Frustum');
  }

  #initSkybox() {
    const skyboxFolder = this.gui.addFolder('Skybox');
    this.scene['Toggle skybox'] = function () {
      scene.skybox.toggle();
    };
    skyboxFolder.add(scene, 'Toggle skybox');
    return skyboxFolder;
  }

  closeOldController() {
    const dg = $('.dg.main');
    dg.hide();
  }
}

