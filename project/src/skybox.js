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
        url: skybox?.px,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: skybox?.nx,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: skybox?.py,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: skybox?.ny,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: skybox?.pz,
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: skybox?.nz,
      },

    ];

    faceInfos.forEach((faceInfo) => {
      const {target, url} = faceInfo;
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 514;
      const height = 514;
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
}
