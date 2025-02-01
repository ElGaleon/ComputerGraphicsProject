class MouseController {
  /**
   * @type boolean
   */
  drag;
  /**
   * @type number
   */
  oldX;
  /**
   * @type number
   */
  oldY;

  /**
   *
   * @param {Camera} camera
   */
  constructor(camera) {
    this.camera = camera;
    // Aggiungi gli event listener per i tasti
    canvas.addEventListener("mousedown", (event) => this.mouseDown(event));
    canvas.addEventListener("mouseup", () => this.mouseUp());
    canvas.addEventListener("mousemove", (event) => this.mouseMove(event));
  }

  /**
   * Init and assign every key to a camera action
   * @param {any} event
   * @return void
   */
  mouseDown(event) {
    this.drag = true;
    this.oldX = event.pageX;
    this.oldY = event.pageY;
    event.preventDefault();
  }

  /**
   * @return void
   */
  mouseUp() {
    this.drag = false;
  }

  /**
   *
   * @param {any} event
   * @return void
   */
  mouseMove(event) {
    if (!this.drag) {
      return;
    }
    const deltaX = -(event.pageX - this.oldX) * 2 * Math.PI / scene.canvas.width;
    this.camera.pan(-deltaX * 0.2);
    const deltaY = -(event.pageY - this.oldY) * 2 * Math.PI / scene.canvas.height;
    scene.camera.tilt(-deltaY * 0.2);

    this.oldX = event.pageX;
    this.oldY = event.pageY;
    event.preventDefault();
  }
}
