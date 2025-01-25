class Shadow {
  value;
  colorProgramInfo;
  textureProgramInfo;
  depthTexture;
  depthTextureSize;
  depthFrameBuffer;
  enabled;
  fieldOfView;
  projectionWidth;
  projectionHeight;
  zFarProjection;
  bias;
  showFrustum;

  /**
   *
   * @param {WebGLRenderingContext} gl
   * @param {number} fieldOfView
   * @param {number} projectionWidth
   * @param {number} projectionHeight
   * @param {number} zFarProjection
   * @param {number} bias
   * @param {boolean} showFrustum
   */
  constructor(gl, fieldOfView = 90, projectionWidth = 3, projectionHeight = 1, zFarProjection = 25, bias = -0.0001, showFrustum = false) {
    this.value = [];

    this.colorProgramInfo = webglUtils.createProgramInfo(gl, ['color-vertex-shader', 'color-fragment-shader']);
    this.textureProgramInfo = webglUtils.createProgramInfo(gl, ['vertex-shader-3d', 'fragment-shader-3d']);

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
    this.fieldOfView = fieldOfView;
    this.projectionWidth = projectionWidth;
    this.projectionHeight = projectionHeight;
    this.zFarProjection = zFarProjection;
    this.bias = bias;
    this.showFrustum = showFrustum;
  }

  toggle() {
    this.enable = !this.enable;
  }
}
