class Shadow {
  colorProgramInfo;
  textureProgramInfo;
  depthTexture;
  depthTextureSize;
  depthFrameBuffer;
  enabled;
  bias;

  /**
   *
   * @param {WebGLRenderingContext} gl
   * @param {number} bias
   * @param {number} depthTextureSize
   */
  constructor(gl, bias = 0.005, depthTextureSize = 4096) {
    this.bias = bias;
    this.depthTextureSize = depthTextureSize;
    this.enabled = false;

    // Program info
    this.colorProgramInfo = webglUtils.createProgramInfo(gl, ['color-vertex-shader', 'color-fragment-shader']);
    this.textureProgramInfo = webglUtils.createProgramInfo(gl, ['vertex-shader-3d', 'fragment-shader-3d']);

    // Depth Texture
    this.depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT,
      this.depthTextureSize,
      this.depthTextureSize,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_INT,
      null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Depth Frame Buffer
    this.depthFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFrameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,             // target
      gl.DEPTH_ATTACHMENT,        // attachment point
      gl.TEXTURE_2D,              // texture target
      this.depthTexture,          // texture
      0);                   // mip level

    this.bias = -0.0001;
    this.showFrustum = false;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  toggleShowFrustum() {
    this.showFrustum = !this.showFrustum;
  }
}
