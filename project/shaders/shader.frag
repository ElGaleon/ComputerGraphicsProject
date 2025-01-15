precision mediump float;
uniform vec3 lightColor;
uniform vec3 lightPosition;
uniform vec3 ambientLight;
varying vec3 v_normal;
varying vec3 v_position;
varying vec4 v_color;
void main() {

  // Compute direction between the light and the current point
  vec3 lightDirection = normalize(lightPosition - v_position);

  // Compute angle between the normal and that direction
  float nDotL = max(dot(lightDirection, v_normal), 0.0);

  // Compute diffuse light proportional to this angle
  vec3 diffuse = lightColor * v_color.rgb * nDotL;

  // Compute ambient light
  vec3 ambient = ambientLight * v_color.rgb;

  // Compute total light (diffuse + ambient)
  gl_FragColor = vec4(diffuse + ambient, 1.0);
}

