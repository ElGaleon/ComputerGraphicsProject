class Light {
  /**
   * @type {Vector3}
   */
 position;
  /**
   * @type {Vector3}
   */
 direction;
  /**
   * @type {Vector3}
   */
 color;
  /**
   * @type {Vector3}
   */
 ambient;
  /**
   *
   */
  fieldOfView;
  projectionWidth;
  projectionHeight;
  zNear;
  zFar;

  constructor(position = [0, 3, 0], direction = [0, 1, 0], color = [1, 1, 1], ambient = [0,0,0], fieldOfView = 60, projectionWidth = 1, projectionHeight = 1, zNear = 1, zFar = 25) {
    this.position = position;
    this.direction = direction;
    this.color = color;
    this.ambient = ambient;
    this.fieldOfView = fieldOfView;
    this.projectionWidth = projectionWidth;
    this.projectionHeight = projectionHeight;
    this.zNear = zNear;
    this.zFar = zFar;
  }

  get aspectRatio() {
    return this.projectionWidth / this.projectionHeight;
  }

}
