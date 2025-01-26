class Shader {
  /**
   * @type {string}
   */
  vertex;
  /**
   * @type {string}
   */
  fragment;

  /**
   *
   * @param {string} vertex
   * @param {string} fragment
   */
  constructor(vertex, fragment) {
    this.vertex = vertex;
    this.fragment = fragment;
  }
}

class Shaders {
  /**
   * @type {Shader}
   */
  base;
  /**
   * @type {Shader}
   */
  threeDimensional;
  /**
   * @type {Shader}
   */
  skybox;
  /**
   * @type {Shader}
   */
  color;

  /**
   *
   * @param {Shader} base
   * @param {Shader} skybox
   * @param {Shader} threeDimensional
   * @param {Shader} color
   */
  constructor(base, skybox, threeDimensional, color) {
    this.base = base;
    this.color = color;
    this.skybox = skybox;
    this.threeDimensional = threeDimensional;
  }
}
