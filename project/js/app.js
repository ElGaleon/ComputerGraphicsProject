
function main() {
  window["scene"] = new Scene('#gl-canvas', "./js/objects.json");

  // Adding event listener for keyboard
  window.addEventListener('keydown', (e) => {scene.keys[e.key] = true;});
  window.addEventListener('keyup', (e) => {scene.keys[e.key] = false;});

  scene.draw();
}

main();
