// WebGL App

function main(){
  // Creating a new scene from a file
  window["scene"] = new Scene("canvas", "./src/objects.json");

  // Adding event listener for keyboard
  window.addEventListener('keydown', (e) => {scene.keys[e.key] = true;});
  window.addEventListener('keyup', (e) => {scene.keys[e.key] = false;});

  // canvas2DController()
  add_dat_gui(scene);
  add_touch_canvas(scene);
  scene.render();
}




main();





