 function addDatGui( canvas ) {
  let gui = new dat.gui.GUI( {autoPlace: false});

  gui.add(params, 'spotLightEnabled').name('Toggle spotlight').onChange((v) => {
      toggleSpotlight
  });
  gui.add(params, 'mirrorEnabled').name('Toggle mirror').onChange((v) => {
      toggleMirror
  });
  gui.add(params, 'mirrorFollow').name('Toggle follow').onChange((v) => {
      toggleMirrorFollow
  });

  // adding dat.GUI to the HTML
  document.getElementById("gui").append(gui.domElement);
}