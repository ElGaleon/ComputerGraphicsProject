attribute vec4 position;
attribute vec4 color;
attribute vec4 normal;
uniform mat4 mvp;
uniform mat4 model;            // model matrix
uniform mat4 inverseTranspose; // inversed transposed model matrix
varying vec4 v_color;
varying vec3 v_normal;
varying vec3 v_position;
void main() {

  // Apply the model matrix and the camera matrix to the vertex position
  gl_Position = mvp * position;

  // Set varying position for the fragment shader
  v_position = vec3(model * position);

  // Recompute the face normal
  v_normal = normalize(vec3(inverseTranspose * normal));

  // Set the color
  v_color = color;
}
