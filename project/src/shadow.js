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
   */
  constructor(gl, bias = -0.001) {
    this.colorProgramInfo = webglUtils.createProgramInfo(gl, ['color-vertex-shader', 'color-fragment-shader']);
    this.textureProgramInfo = webglUtils.createProgramInfo(gl, ['vertex-shader-3d', 'fragment-shader-3d']);
    this.bias = bias;
    this.depthTexture = gl.createTexture();
    this.depthTextureSize = 2048;
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,                  // target
      0,                        // mip level
      gl.DEPTH_COMPONENT,             // internal format
      this.depthTextureSize,          // width
      this.depthTextureSize,          // height
      0,                       // border
      gl.DEPTH_COMPONENT,             // format
      gl.UNSIGNED_INT,                // type
      null);                    // models

    this.depthFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFrameBuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.depthTexture,
      0
    );

    this.enabled = false;
  }

  toggle() {
    this.enable = !this.enable;
  }
}
