class TouchController {
  /**
   * @type KeyController
   */
  keyController;
  /**
   * @type number
   */
  step;
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
   * @param {KeyController} keyController
   * @param {number} step
   */
  constructor(keyController, step = 0.05) {
    this.keyController = keyController;
    this.step = step;
    // Aggiungi gli event listener per i tasti
    canvas.addEventListener("touchstart", (event) => this.touchStart(event));
    canvas.addEventListener("touchend", () => this.touchEnd());
    canvas.addEventListener("touchmove", (event) => this.touchMove(event));
  }

  /**
   * Init and assign every key to a camera action
   * @param {any} event
   * @return void
   */
  touchStart(event) {
    this.drag = true;
    this.oldX = event.pageX;
    this.oldY = event.pageY;
    event.preventDefault();
  }

  /**
   * @return void
   */
  touchEnd() {
    this.drag = false;
  }

  /**
   *
   * @param {any} event
   * @return void
   */
  touchMove(event) {
    if (!this.drag){
      return;
    }

    const deltaX=-(event.pageX-this.oldX)*2*Math.PI/scene.canvas.width;
    this.camera.pan(-deltaX * 0.2);
    const deltaY=-(event.pageY-this.oldY)*2*Math.PI/scene.canvas.height;
    scene.camera.tilt(-deltaY * 0.2);

    this.oldX=event.pageX;
    this.oldY=event.pageY;
    event.preventDefault();
  }

  onKeyClick(id){
    this.keyController.keyDown({code: id}, false);
  }
}


