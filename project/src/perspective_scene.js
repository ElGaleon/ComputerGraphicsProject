class PerspectiveScene extends Scene{

  constructor(canvasId, sceneId, json) {
    super(canvasId, sceneId, json);
    this.program = webglUtils.createProgramInfo(this.gl, ['solid-color-vertex-shader', 'solid-color-fragment-shader']);

  }


  render() {
    resizeCanvasToDisplaySize(scene.gl.canvas);
    this.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);

    this.gl.useProgram(scene.shadow.colorProgramInfo.program);

    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(this.gl, {
      position: [
        -1, -1, -1,
        1, -1, -1,
        -1, 1, -1,
        1, 1, -1,
        -1, -1, 1,
        1, -1, 1,
        -1, 1, 1,
        1, 1, 1,
      ],
      indices: [
        0, 1,
        1, 3,
        3, 2,
        2, 0,

        4, 5,
        5, 7,
        7, 6,
        6, 4,

        0, 4,
        1, 5,
        3, 7,
        2, 6,
      ],
    });
    console.log(cubeLinesBufferInfo);

    webglUtils.setBuffersAndAttributes(this.gl, scene.shadow.colorProgramInfo, cubeLinesBufferInfo);

    const lightWorldMatrix = m4.lookAt(
      this.light.position,       // position
      this.light.direction,      // target
      [0, 1, 0],                  // up
    );

    const lightProjectionMatrix = m4.perspective(
      degToRad(this.perspective.fieldOfView),
      this.perspective.aspectRatio,
      0.5,                        // near
      this.perspective.zFar);     // far

    const mat = m4.multiply(
      lightWorldMatrix, m4.inverse(lightProjectionMatrix));

    webglUtils.setUniforms(scene.shadow.colorProgramInfo, {
      u_color: [1, 1, 1, 1],
      u_view: this.camera.viewMatrix,
      u_projection: this.projectionMatrix,
      u_world: mat,
    });
    this.renderWithoutShadows();
    webglUtils.drawBufferInfo(this.gl, cubeLinesBufferInfo, this.gl.LINES);
    requestAnimationFrame(() => this.render());
  }
}
