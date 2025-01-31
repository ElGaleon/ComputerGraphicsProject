class Perspective{
  fieldOfView;
  projectionWidth;
  projectionHeight;
  zNear;
  zFar;

  constructor(gl, fieldOfView = 60, projectionWidth = 3, projectionHeight = 1, zNear = 1, zFar = 25) {
    this.fieldOfView = fieldOfView;
    this.projectionWidth = projectionWidth;
    this.projectionHeight = projectionHeight;
    this.zNear = zNear;
    this.zFar = zFar;
  }

  get aspectRatio () {
    return this.projectionWidth / this.projectionHeight;
  }

}
