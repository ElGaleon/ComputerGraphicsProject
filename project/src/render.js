function render() {
  // Resizing the canvas to the window size
  resizeCanvasToDisplaySize(scene.canvas);
  scene.gl.viewport(0, 0, scene.gl.canvas.width, scene.gl.canvas.height);

  scene.gl.enable(scene.gl.CULL_FACE);
  scene.gl.enable(scene.gl.DEPTH_TEST);
  scene.gl.enable(scene.gl.BLEND);
  scene.gl.blendFunc(scene.gl.SRC_ALPHA, scene.gl.ONE_MINUS_SRC_ALPHA);

  if (scene.shadow?.enabled) {
    renderWithShadows();
  } else {
    renderWithoutShadows();
  }
  if (scene.skybox?.enabled) {
    renderSkybox();
  }

  requestAnimationFrame(render);
}

/**
 * Initialize Frame Buffer
 * @param {WebGLRenderingContext} gl
 */
function bindFrameBufferNull(gl) {
  // draw scene to the canvas projecting the depth texture into the scene
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

/**
 * Render the scene with shadows (one directional light)
 */
function renderWithShadows() {
  scene.gl.enable(scene.gl.CULL_FACE);

  const lightWorldMatrix = m4.lookAt(
    scene.light.position,       // position
    scene.light.direction,      // target
    [0, 1, 0],                  // up
  );

  const lightProjectionMatrix = m4.perspective(
    degToRad(scene.light.fieldOfView),
    scene.light.aspectRatio,
    scene.light.zNear,                        // near
    scene.light.zFar);     // far

  let sharedUniforms = {
    u_view: m4.inverse(lightWorldMatrix),                  // View Matrix
    u_projection: lightProjectionMatrix,                   // Projection Matrix
    u_bias: scene.shadow.bias,
    u_textureMatrix: m4.identity(),
    u_projectedTexture: scene.shadow.depthTexture,
    u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
  };

  // draw to the depth texture
  scene.gl.bindFramebuffer(scene.gl.FRAMEBUFFER, scene.shadow.depthFrameBuffer);
  scene.gl.viewport(0, 0, scene.shadow.depthTextureSize, scene.shadow.depthTextureSize);
  scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);

  scene.meshes.forEach(m => {
    m.render(scene.gl, scene.shadow.colorProgramInfo, sharedUniforms);
  });

  bindFrameBufferNull(scene.gl);

  let textureMatrix = m4.identity();
  textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
  textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
  textureMatrix = m4.multiply(textureMatrix, lightProjectionMatrix);
  // use the inverse of this world matrix to make
  // a matrix that will transform other positions
  // to be relative this world space.
  textureMatrix = m4.multiply(
    textureMatrix,
    m4.inverse(lightWorldMatrix));

  sharedUniforms = {
    u_view: scene.camera.viewMatrix,
    u_projection: scene.projectionMatrix,
    u_bias: scene.shadow.bias,
    u_lightColor: scene.light.color,
    u_textureMatrix: textureMatrix,
    u_projectedTexture: scene.shadow.depthTexture,
    u_reverseLightDirection: lightWorldMatrix.slice(8, 11),
    u_worldCameraPosition: scene.camera.position,
  };

  scene.meshes.forEach(m => {
    m.render(scene.gl, scene.shadow.textureProgramInfo, sharedUniforms);
  });

  if (scene.shadow.showFrustum) {
    renderFrustum(lightWorldMatrix, lightProjectionMatrix);
  }
}

/**
 *  Render scene without shadows using ambient light
 */
function renderWithoutShadows() {
  scene.gl.disable(scene.gl.CULL_FACE);
  bindFrameBufferNull(scene.gl)

  const sharedUniforms = {
    u_ambientLight: scene.light.ambient,                      // Ambient
    u_lightDirection: m4.normalize(scene.light.direction),    // Light Direction
    u_lightColor: scene.light.color,                          // Light Color
    u_view: scene.camera.viewMatrix,                     // View Matrix
    u_projection: scene.projectionMatrix,                   // Projection Matrix
    u_viewWorldPosition: scene.camera.position,          // Camera position
    u_lightPosition: (scene.light.position),
  };

  scene.meshes.forEach(m => {
    m.render(scene.gl, scene.program, sharedUniforms);
  });
}

/**
 * Render the frustum by a given lightWorldMatrix and lightProjectionMatrix
 * @param {Matrix4} lightWorldMatrix
 * @param {Matrix4} lightProjectionMatrix
 */
function renderFrustum(lightWorldMatrix, lightProjectionMatrix) {
  scene.gl.useProgram(scene.shadow.colorProgramInfo.program);
  const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(scene.gl, {
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

  webglUtils.setBuffersAndAttributes(scene.gl, scene.shadow.colorProgramInfo, cubeLinesBufferInfo);

  const mat = m4.multiply(
    lightWorldMatrix, m4.inverse(lightProjectionMatrix));

  webglUtils.setUniforms(scene.shadow.colorProgramInfo, {
    u_color: [1, 1, 1, 1],
    u_view: scene.camera.viewMatrix,
    u_projection: scene.projectionMatrix,
    u_world: mat,
  });

  webglUtils.drawBufferInfo(scene.gl, cubeLinesBufferInfo, scene.gl.LINES);
}

/**
 *  Render the skybox
 */
function renderSkybox() {
  // Removing translation from view matrix
  scene.camera.viewMatrix[12] = 0;
  scene.camera.viewMatrix[13] = 0;
  scene.camera.viewMatrix[14] = 0;
  scene.gl.depthFunc(scene.gl.LEQUAL);
  scene.gl.useProgram(scene.skybox.programInfo.program);

  webglUtils.setBuffersAndAttributes(scene.gl, scene.skybox.programInfo, scene.skybox.quadBufferInfo);
  webglUtils.setUniforms(scene.skybox.programInfo, {
    u_viewDirectionProjectionInverse: m4.inverse(m4.multiply(scene.projectionMatrix, scene.camera.viewMatrix)),
    u_skybox: scene.skybox.texture,
    u_lightColor: scene.light.color,
  });
  webglUtils.drawBufferInfo(scene.gl, scene.skybox.quadBufferInfo);
  scene.gl.depthFunc(scene.gl.LESS);
}
