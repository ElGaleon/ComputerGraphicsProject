const Direction = {
  UP: 'up',
  RIGHT: 'right',
  FORWARD: 'forward',
}

class Camera {
  /**
   * @type {Vector3}
   */
  position;
  /**
   * @type {Vector3}
   */
  forward;
  /**
   * @type {Vector3}
   */
  right;
  /**
   * @type {Vector3}
   */
  up;

  /**
   *
   * @param {Vector3} position
   * @param {Vector3} lookAt
   * @param {Vector3} up
   * @param perspective
   */
  constructor(position = [0, 0, 0], lookAt = [0, 0, 0], up = [0, 0, 0], perspective) {
    this.position = position;
    this.forward = m4.normalize(m4.subtractVectors(lookAt, position));
    this.right = m4.normalize(m4.cross(this.forward, up));
    this.up = m4.normalize(m4.cross(this.right, this.forward));
    // Camera perspective
    this.fieldOfView = perspective?.fieldOfView ?? 60;
    this.projectionWidth = perspective?.projectionWidth ?? 1;
    this.projectionHeight = perspective?.projectionHeight ?? 1;
    this.zNear = perspective?.zNear ?? 1;
    this.zFar = perspective?.zFar ?? 100;
  }

  /**
   *
   * @param {Direction[]} movements
   * @param {Matrix4} rotation
   */
  #rotate(movements, rotation) {
    for (let index = 0; index < movements.length; index++) {
      switch (movements[index]) {
        case Direction.UP:
          this.up = m4.transformPoint(rotation, this.up);
          this.up = m4.normalize(this.up);
          break;
        case Direction.RIGHT:
          this.right = m4.transformPoint(rotation, this.right);
          this.right = m4.normalize(this.right);
          break;
        case Direction.FORWARD:
          this.forward = m4.transformPoint(rotation, this.forward);
          this.forward = m4.normalize(this.forward);
          break;
      }
    }
  }

  /**
   * Rotate the camera's view up or down
   * This rotates about a camera's u axis.
   * @param {number} step
   */
  tilt(step) {
    const rotation = m4.axisRotation(this.right, (step / 2));
    this.#rotate([Direction.FORWARD, Direction.UP], rotation);
  }

  /**
   *
   * @param {Direction[]} movements
   * @param {number} distance
   */
  #move(movements, distance) {
    for (let index = 0; index < movements.length; index++) {
      switch (movements[index]) {
        case Direction.UP:
          this.position[0] += (this.up[0] * distance);
          this.position[1] += (this.up[1] * distance);
          this.position[2] += (this.up[2] * distance);
          break;
        case Direction.RIGHT:
          this.position[0] += +(this.right[0] * distance);
          this.position[1] += +(this.right[1] * distance);
          this.position[2] += +(this.right[2] * distance);
          break;
        case Direction.FORWARD:
          this.position[0] += (this.forward[0] * distance);
          this.position[1] += (this.forward[1] * distance);
          this.position[2] += (this.forward[2] * distance);
          break;
      }
    }
  }

  /**
   * Rotate the camera horizontally
   * This rotates about a camera's v axis.
   * @param {number} step
   */
  pan(step) {
    const rotation = m4.axisRotation(this.up, (step));
    this.#rotate([Direction.FORWARD, Direction.RIGHT], rotation);
  }

  /**
   * Tilts a camera sideways while maintaining its location and viewing direction.
   * This is a rotation about a camera’s n axis.
   * @param {number} step
   */
  cant(step) {
    let rotation = m4.axisRotation(this.forward, (step / 2));
    this.#rotate([Direction.RIGHT, Direction.UP], rotation);
  }

  /**
   * Moves a camera’s location laterally(left or right) while the camera’s direction of view is unchanged.
   * This is a translation along a camera’s u axis.
   * @param {number} distance
   */
  truck(distance) {
    this.#move([Direction.RIGHT], distance);
  }

  /**
   * Elevates or lowers a camera on its stand.
   * This is a translation along a camera’s v axis.
   * @param {number} distance
   */
  pedestal(distance) {
    this.#move([Direction.UP], distance);
  }

  /**
   * Moves a camera closer to, or further from, the location it is looking at.
   * This is a translation along a camera’s n axis.
   * @param {number} distance
   */
  dolly(distance) {
    this.#move([Direction.FORWARD], distance);
  }

  get viewMatrix() {
    const look = m4.addVectors(this.position, this.forward);
    const cameraMatrix = m4.lookAt(this.position, look, this.up);
    return m4.inverse(cameraMatrix);
  }

  get lookAt() {
    const look = m4.addVectors(this.position, this.forward);
    return m4.lookAt(this.position, look, this.up);
  }

  /**
   * Reset camera to given values
   * @param {Vector3} up
   * @param {number} forwardY
   */
  reset(up = [0, 1, 0], forwardY = 0) {
    this.up = up;
    this.forward[1] = forwardY;
    this.right = m4.normalize(m4.cross(this.forward, this.up));
  }

  get aspectRatio() {
    return this.projectionWidth / this.projectionHeight;
  }
}
