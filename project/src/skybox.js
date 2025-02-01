class SkyBox {
  programInfo;
  quadBufferInfo;
  texture;
  enabled;

  /**
   *
   * @param {WebGLRenderingContext} gl
   * @param {Scene} scene
   * @param skybox
   */
  constructor(gl, scene, skybox = null) {
    this.programInfo = webglUtils.createProgramInfo(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);
    const arrays = this.#createXYQuadVertices(null, Array.prototype.slice.call(arguments, 1));
    this.quadBufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays);
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

    const faceInfos = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: skybox.px,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: skybox.px,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: skybox.px,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: skybox.px,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: skybox.px,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: skybox.px,
      },

    ];

    faceInfos.forEach((faceInfo) => {
      const {target, url} = faceInfo;

      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1024;
      const height = 1024;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

      const image = new Image();
      image.src = url;

      image.addEventListener('load', function () {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, scene.skybox.texture);
        gl.texImage2D(target, level, internalFormat, format, type, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    this.enabled = !!skybox;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  #createXYQuadVertices() {
    let xOffset = 0;
    let yOffset = 0;
    let size = 1;
    return {
      position: {
        numComponents: 2,
        data: [
          xOffset + -1 * size, yOffset + -1 * size,
          xOffset + size, yOffset + -1 * size,
          xOffset + -1 * size, yOffset + size,
          xOffset + size, yOffset + size,
        ],
      },
      normal: [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
      ],
      texcoord: [
        0, 0,
        1, 0,
        0, 1,
        1, 1,
      ],
      indices: [0, 1, 2, 2, 1, 3],
    };
  }

  /**
   * Render SkyBox from a given scene
   * @param {Scene} scene
   */
  render(scene) {
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
}
