class Controller2D {
  /**
   * @type {HTMLCanvasElement}
   */
  canvas;
  /**
   * @type {CanvasRenderingContext2D}
   */
  context;
  /**
   * @type Scene
   */
  scene;
  /**
   * @type number
   */
  step;
  sButton;
  aButton;
  bButton;
  cUpButton;
  cDownButton;
  cLeftButton;
  cRightButton;
  upButton;
  downButton;
  leftButton;
  rightButton;


  /**
   * @param {Scene} scene
   */
  constructor(scene) {
    const canvas = document.getElementById("controller2D");
    if (!canvas) {
      console.error("No 2d canvas found!");
      throw Error("No 2D canvas found!");
    }
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    if (!this.context) {
      console.error("No 2d context found!");
      throw Error("No 2D context found!");
    }
    this.scene = scene;

    // Buttons init
    this.sButton = drawButton(this.context, 150, 60, 36, 36, "red","blue" , "S", null);

    // Bottoni azione (rotondi)
    this.aButton = drawButton(this.context, 220, 110, 36, 36, "blue", "blue" ,"A", null);
    this.bButton = drawButton(this.context, 190, 80, 36, 36, "green", "blue" ,"B", null);

    // C Buttons
    this.cUpButton = drawButton(this.context, 250, 20, 32, 32, "yellow", "blue" ,"C", "brown"); // C-Up
    this.cDownButton = drawButton(this.context, 250, 80, 32, 32, "yellow","blue" , "C", "brown"); // C-Down
    this.cLeftButton = drawButton(this.context, 220, 50, 32, 32, "yellow", "blue" ,"C", "brown"); // C-Left
    this.cRightButton =drawButton(this.context, 280, 50, 32, 32, "yellow", "blue" ,"C", "brown"); // C-Right

    // Bottoni di movimento (squadrati, 4 direzioni)
    this.upButton = drawButton(this.context, 60, 20, 32, 32, "gray", "black" ,"⬆", "darkgrey",false); // Su
    this.downButton = drawButton(this.context, 60, 80, 32, 32, "gray", "black" ,"⬇", "darkgrey",false); // Giù
    this.leftButton = drawButton(this.context, 20, 50, 32, 32, "gray", "black" ,"⬅", "darkgrey",false); // Sinistra
    this.rightButton = drawButton(this.context,  100, 50, 32, 32, "gray", "black" ,"➡", "darkgrey",false); // Destra


    // Aggiungi gli event listener per i tasti
    canvas.addEventListener("mousedown", (event) => this.onTouchStart(event), false);
    canvas.addEventListener("touchstart", (event) => this.onTouchStart(event), false);
  }

  /**
   * Return the canvas coordinates on touch event
   * @param {HTMLCanvasElement} canvas
   * @param {any} event
   * @returns {{x: number, y: number}}
   */
  #getXY(canvas, event) {
    let x,y;
    const rect = canvas.getBoundingClientRect();

    if (event.touches) {
      const touch = event.touches[0] || event.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    return {x: x, y: y}
  }

  /**
   * Handle touch start
   * @param {any} event
   * @return void
   */
  onTouchStart(event) {
    event.preventDefault();
    const coordinates = this.#getXY(this.canvas, event);
    console.log(coordinates);
    console.log(this.sButton);
    console.log(this.context.isPointInPath(this.cUpButton, coordinates.x, coordinates.y));
    if (this.context.isPointInPath(this.sButton, coordinates.x, coordinates.y)) {
      // Replicate Reset
      this.scene.keyController.keyDown({code: 'KeyR'}, false);
    }
    if (this.context.isPointInPath(this.aButton, coordinates.x, coordinates.y)) {
      // Replicate E
      this.scene.keyController.keyDown({code: 'KeyE'}, false);
    }
    if (this.context.isPointInPath(this.bButton, coordinates.x, coordinates.y)) {
      // Replicate Q
      this.scene.keyController.keyDown({code: 'KeyQ'}, false);
    }
    if (this.context.isPointInPath(this.cUpButton, coordinates.x, coordinates.y)) {
      // Replicate Arrow Up
      this.scene.keyController.keyDown({code: 'ArrowUp'}, false);
    }
    if (this.context.isPointInPath(this.cDownButton, coordinates.x, coordinates.y)) {
      // Replicate Arrow Down
      this.scene.keyController.keyDown({code: 'ArrowDown'}, false);
    }
    if (this.context.isPointInPath(this.cLeftButton, coordinates.x, coordinates.y)) {
      // Replicate Arrow Left
      this.scene.keyController.keyDown({code: 'ArrowLeft'}, false);
    }
    if (this.context.isPointInPath(this.cRightButton, coordinates.x, coordinates.y)) {
      // Replicate Arrow Right
      this.scene.keyController.keyDown({code: 'ArrowRight'}, false);
    }
    if (this.context.isPointInPath(this.upButton, coordinates.x, coordinates.y)) {
      // Replicate Arrow W
      this.scene.keyController.keyDown({code: 'KeyW'}, false);
    }
    if (this.context.isPointInPath(this.downButton, coordinates.x, coordinates.y)) {
      // Replicate S
      this.scene.keyController.keyDown({code: 'KeyS'}, false);
    }
    if (this.context.isPointInPath(this.leftButton, coordinates.x, coordinates.y)) {
      // Replicate A
      this.scene.keyController.keyDown({code: 'KeyA'}, false);
    }
    if (this.context.isPointInPath(this.rightButton, coordinates.x, coordinates.y)) {
      // Replicate D
      this.scene.keyController.keyDown({code: 'KeyD'}, false);
    }
  }

  /**
   * @return void
   */
  onTouchEnd() {
    this.scene.keyController.keyUp();
  }
}

/**
 *
 * @param {CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} fillColor
 * @param {string} strokeColor
 * @param {string} label
 * @param {string} labelColor
 * @param {boolean} isRound
 * @returns {Path2D}
 */
function drawButton(context,x, y, width, height, fillColor, strokeColor, label, labelColor, isRound = true) {
  context.fillStyle = fillColor;
  context.strokeStyle = strokeColor ?? 'white';
  let result = new Path2D();

  if (isRound) {
    result.arc(x, y, width / 2, 0, Math.PI * 2);
    context.fill(result);
  } else {
    result.rect(x - width / 2, y - height / 2, width, height);
    context.fill(result);
    context.stroke(result);
  }
  result.closePath();

  context.fillStyle = labelColor ?? 'white';
  context.font = "bold 14px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, x, y);
  return result;
}
