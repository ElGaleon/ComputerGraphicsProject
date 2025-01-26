function add_dat_gui(scene){
  let gui = new dat.gui.GUI({autoPlace: false});

  scene['Switch camera'] = function () {
    scene.switchCamera();
  };
  gui.add(scene, 'Switch camera');

  scene['Toggle skybox'] = function () {
    scene.skybox.toggle();
  };
  gui.add(scene, 'Toggle skybox');

  scene['Toggle shadows'] = function () {
    scene.shadow.toggle();
  };
  gui.add(scene, 'Toggle shadows');

  let lightFolder = gui.addFolder('Light');

  let lightPosition =  lightFolder.addFolder('Position');
  lightPosition.add(scene.light.position, 0).min(-10).max(10).step(0.25);
  lightPosition.add(scene.light.position, 1).min(0).max(10).step(0.25);
  lightPosition.add(scene.light.position, 2).min(-10).max(10).step(0.25);

  let lightDirection =  lightFolder.addFolder('Direction');
  lightDirection.add(scene.light.direction, 0).min(-10).max(10).step(0.25);
  lightDirection.add(scene.light.direction, 1).min(-10).max(10).step(0.25);
  lightDirection.add(scene.light.direction, 2).min(-10).max(10).step(0.25);

  let lightColor =  lightFolder.addFolder('Color');
  lightColor.add(scene.light.color, 0).min(0.1).max(1).step(0.05);
  lightColor.add(scene.light.color, 1).min(0.1).max(1).step(0.05);
  lightColor.add(scene.light.color, 2).min(0.1).max(1).step(0.05);

  let shadowFolder = gui.addFolder('Shadow frustum');
  shadowFolder.add(scene.shadow, "fieldOfView").min(30).max(180).step(15);
  shadowFolder.add(scene.shadow, "projectionWidth").min(1).max(10).step(1);
  shadowFolder.add(scene.shadow, "projectionHeight").min(1).max(10).step(1);
  shadowFolder.add(scene.shadow, "zFarProjection").min(1).max(30).step(1);
  shadowFolder.add(scene.shadow, "bias").min(-0.001).max(0).step(0.0001);

  scene['Toggle frustum'] = function () {
    scene.shadow.showFrustum = !scene.shadow.showFrustum;
  };
  shadowFolder.add(scene, 'Toggle frustum');

  document.getElementById("gui").append(gui.domElement);
}

function add_touch_canvas(scene){
  scene.mouse = [];

  function mouseDown(e) {
    scene.mouse.drag = true;
    scene.mouse.old_x = e.pageX;
    scene.mouse.old_y = e.pageY;
    e.preventDefault();
  }
  function mouseUp(){
    scene.mouse.drag=false;
  }
  function mouseMove(e) {
    if (!scene.mouse.drag){
      return false;
    }
    let dX=-(e.pageX-scene.mouse.old_x)*2*Math.PI/scene.canvas.width;
    scene.camera.pan(-dX * 0.2);
    let dY=-(e.pageY-scene.mouse.old_y)*2*Math.PI/scene.canvas.height;
    scene.camera.tilt(-dY * 0.2);

    scene.mouse.old_x=e.pageX;
    scene.mouse.old_y=e.pageY;
    e.preventDefault();
  }

  scene.canvas.addEventListener('touchstart',mouseDown,false);
  scene.canvas.addEventListener('touchmove',mouseMove,false);
  scene.canvas.addEventListener('touchend',mouseUp,false);
  scene.canvas.addEventListener('touchend',mouseUp,false);
  scene.canvas.addEventListener('mouseout',mouseUp,false);
  scene.canvas.onmousedown=mouseDown;
  scene.canvas.onmouseup=mouseUp;
  scene.canvas.mouseout=mouseUp;
  scene.canvas.onmousemove=mouseMove;
}

function canvas2DController(){
  let canvas = document.getElementById("canvas2d");
  let context = canvas.getContext("2d");

  const forward = new Path2D()
  forward.rect(25,0,39,39)
  forward.closePath()

  const backward = new Path2D()
  backward.rect(25,60,39,39)
  backward.closePath()

  const left = new Path2D()
  left.rect(0,30,39,39)
  left.closePath()

  const right = new Path2D()
  right.rect(64,30,39,39)
  right.closePath()

  const up = new Path2D()
  up.rect(110,10,45,25)
  up.closePath()

  const down = new Path2D()
  down.rect(110,65,45,25)
  down.closePath()

  context.font = '35px serif';
  context.fillText('UP', 180, 60);
  context.fillText('Down', 180, 120);

  const image = new Image(150, 150);
  image.onload=function (){
    context.drawImage(this,  0, 0, image.width, image.height);
  }
  image.src = './data/controllerImg.jpg';

  function getXY(canvas, event){ //adjust mouse click to canvas coordinates
    const rect = canvas.getBoundingClientRect()
    const y = event.pageY - rect.top
    const x = event.pageX - rect.left

    return {x:x, y:y}
  }

  function touchDown(e){
    const XY = getXY(canvas, e)
    //use the shape data to determine if there is a collision
    if(context.isPointInPath(forward, XY.x, XY.y)) {
      scene.keys["w"]=true;
    }
    if(context.isPointInPath(backward, XY.x, XY.y)) {
      scene.keys["s"]=true;
    }
    if(context.isPointInPath(left, XY.x, XY.y)) {
      scene.keys["a"]=true;
    }
    if(context.isPointInPath(right, XY.x, XY.y)) {
      scene.keys["d"]=true;
    }
    if(context.isPointInPath(up, XY.x, XY.y)) {
      scene.keys["q"]=true;
    }
    if(context.isPointInPath(down, XY.x, XY.y)) {
      scene.keys["e"]=true;
    }
  }

  function touchUp(){
    scene.keys["w"]=false;
    scene.keys["a"]=false;
    scene.keys["s"]=false;
    scene.keys["d"]=false;
    scene.keys["q"]=false;
    scene.keys["e"]=false;
  }

  canvas.addEventListener('touchstart',touchDown,false);
  canvas.addEventListener('touchend',touchUp,false);
  canvas.onmousedown=touchDown;
  canvas.onmouseup=touchUp;
}




