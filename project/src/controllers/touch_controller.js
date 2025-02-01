class TouchController {
  /**
   * @type Scene
   */
  scene;
  /**
   * @type number
   */
  step;
  /**
   * @type boolean
   */
  drag;
  /**
   * @type
   */
  touchStart;
  /**
   * @type boolean
   */
  isPinching;
  /**
   * @type boolean
   */
  isScaling;


  /**
   * @param {Scene} scene
   * @param {number} step
   */
  constructor(scene, step = 0.05) {
    this.scene = scene;
    this.touchStart = {x: 0, y: 0};
    this.isTouching = false;
    this.isPinching = false;
    this.pinchDistance = 0;
    this.step = step;
    // Aggiungi gli event listener per i tasti
    canvas.addEventListener("touchstart", (event) => this.onTouchStart(event), false);
    canvas.addEventListener("touchend", () => this.onTouchEnd(), false);
    canvas.addEventListener("touchmove", (event) => this.onTouchMove(event), false);
  }

  /**
   * Handle touch start
   * @param {TouchEvent} event
   * @return void
   */
  onTouchStart(event) {
    console.log(event.touches)
    if (event.touches.length === 1) {
      console.log("one");
      this.isTouching = true;
      this.touchStart.x = event.touches[0].clientX;
      this.touchStart.y = event.touches[0].clientY;
    }
    if (event.touches.length === 2) {
      console.log("two");
      this.isPinching = true;
      this.touchStart.x = event.touches[0].clientX - event.touches[1].clientX;
      this.touchStart.y = event.touches[0].clientY - event.touches[1].clientY;
      this.pinchDistance = Math.sqrt(this.touchStart.x * this.touchStart.x + this.touchStart.y * this.touchStart.y);
    }
  }

  /**
   * @return void
   */
  onTouchEnd() {
    this.isTouching = false;
    this.isScaling = false;
  }

  /**
   * Handles the touch movement
   * @param {TouchEvent} event
   * @return void
   */
  onTouchMove(event) {
    if (this.isTouching && event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;

      if (deltaX) {
        this.scene.camera.pan(deltaX * 0.005);
      }
      if (deltaY) {
        this.scene.camera.tilt(deltaY * 0.005);
      }
      // Aggiorna la posizione iniziale del tocco
      this.touchStart.x = touch.clientX;
      this.touchStart.y = touch.clientY;
    } else if (this.isPinching && event.touches.length === 2) {
      const zoomFactor = this.pinchDistance / this.lastDistance;

      this.zoom *= zoomFactor;
      this.zoom = Math.min(Math.max(this.zoom, 0.5), 3.0); // Limita lo zoom

      this.lastDistance = this.pinchDistance;
      this.applyZoom();
    }

    event.preventDefault(); // Previene il comportamento di default del touch
  }

  onKeyClick(id) {
    this.scene.keyController.keyDown({code: id}, false);
  }
}


