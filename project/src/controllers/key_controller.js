class KeyController {
  /**
   * @type Camera
   */
  camera;
  /**
   * @type number
   */
  step;

  /**
   *
   * @param {Camera} camera
   * @param {number} step
   */
  constructor(camera, step = 0.05) {
    this.keys = {}; // Oggetto per tracciare lo stato dei tasti
    this.camera = camera;
    this.step = step;
    // Aggiungi gli event listener per i tasti
    window.addEventListener("keydown", (event) => this.keyDown(event));
    window.addEventListener("keyup", (event) => this.keyUp(event));
  }

  /**
   * Init and assign every key to a camera action
   * @param {any} event
   * @return void
   */
  keyDown(event) {
    // Imposta il tasto come premuto
    this.keys[event.key] = true;
    switch (event.code) {
      case 'KeyW':
        this.camera.dolly(this.step);
        break;
      case 'KeyA':
        this.camera.truck(-this.step);
        break;
      case 'KeyS':
        this.camera.dolly(-this.step);
        break;
      case 'KeyD':
        this.camera.truck(this.step);
        break;
      case 'KeyE':
        this.camera.pedestal(-this.step);
        break;
      case 'KeyQ':
        this.camera.pedestal(this.step);
        break;
      case 'KeyR':
        this.camera.reset();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.camera.tilt(this.step);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.camera.pan(this.step);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.camera.pan(-this.step);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.camera.tilt(-this.step);
        break;
    }
  }

  /**
   * Set the released key as false
   * @param {any} event
   * @return void
   */
  keyUp(event) {
    // Imposta il tasto come rilasciato
    this.keys[event.key] = false;
  }
}
