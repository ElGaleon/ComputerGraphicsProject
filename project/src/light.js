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

  constructor(position = [0, 0, 0], direction = [0, 1, 0], color = [1, 1, 1], ambient = [0,0,0]) {
    this.position = position;
    this.direction = direction;
    this.color = color;
    this.ambient = ambient;
  }

}
