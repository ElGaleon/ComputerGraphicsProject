import { SpotLight, AmbientLight, SpotLightHelper } from 'three';

export function initLighting(scene) {
    // Ambient Light
  const ambientLight = new AmbientLight(0xffffff, 0.1);
  scene.add(ambientLight);
    // Spotlight
  const spotlight = new SpotLight(0xffffff, 10);
  spotlight.position.set(0, 2, 0);
  spotlight.castShadow = true;
  spotlight.shadow.bias = -0.001;
  // spotlight.target = mario;
  spotlight.angle = Math.PI / 4;
  spotlight.penumbra = 0.5;   
  scene.add(spotlight);

  // Spotlight Helper
  const helper = new SpotLightHelper(spotlight);
  scene.add(helper);
}
