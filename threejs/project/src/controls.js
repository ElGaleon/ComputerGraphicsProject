import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function setupControls(camera, renderer) {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  return controls;
}

export function handleKeyboardInput(e, mario) {
  if (e.code === 'KeyW') {
    mario.position.z -= 0.05;
  }
  if (e.code === 'KeyS') {
    mario.position.z += 0.05;
  }
}
