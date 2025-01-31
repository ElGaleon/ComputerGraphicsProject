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
  perspectiveFolder;
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
    this.perspectiveFolder = this.#initPerspectiveFolder();
    // Shadow
    this.shadowFolder = this.#initShadowFolder();
    // Skybox
    this.skyboxFolder = (scene.json?.skybox) ? this.#initSkybox() : [];
    // Lights
    this.lightFolder = this.#initLightFolder();
    document.getElementById("gui").append(this.gui.domElement);
  }

#initPerspectiveFolder() {
  const perspectiveFolder = this.gui.addFolder('Perspective');
  perspectiveFolder.add(scene.perspective, "fieldOfView").min(30).max(180).step(15).name("Field of View (FOV)").listen();
  perspectiveFolder.add(scene.perspective, "projectionWidth").min(1).max(10).step(1).name("Projection Width").listen();
  perspectiveFolder.add(scene.perspective, "projectionHeight").min(1).max(10).step(1).name("Projection Height").listen();
  perspectiveFolder.add(scene.perspective, "zNear").min(1).max(30).step(1).name("z Near Projection").listen();
  perspectiveFolder.add(scene.perspective, "zFar").min(1).max(30).step(1).name("z Far Projection").listen();

  return perspectiveFolder;
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
    const lightPosition =  lightFolder.addFolder('Position');
    lightPosition.add(scene.light.position, 0).min(-10).max(10).step(0.25).name("X").listen();
    lightPosition.add(scene.light.position, 1).min(0).max(10).step(0.25).name("Y").listen();
    lightPosition.add(scene.light.position, 2).min(-10).max(10).step(0.25).name("Z").listen();
  }

  #initLightDirectionFolder(lightFolder) {
    const lightDirection =  lightFolder.addFolder('Direction');
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

  #initShadowFolder(){
    const shadowFolder = this.gui.addFolder('Shadow');
    this.#initToggleShadow(shadowFolder);
    return shadowFolder;
  }

  #initToggleShadow(shadowFolder) {
    this.scene['Toggle shadows'] = function () {
      scene.shadows.toggle();
    };
    shadowFolder.add(this.scene, 'Toggle shadows');
  }

  #initSkybox() {
    const skyboxFolder = this.gui.addFolder('Skybox');
    this.scene['Toggle skybox'] = function () {
      scene.skybox.toggle();
    };
    skyboxFolder.add(scene, 'Toggle skybox');
    return skyboxFolder;
  }

  closeOldController(){
    const dg = $('.dg.main');
    dg.hide();
  }
}

