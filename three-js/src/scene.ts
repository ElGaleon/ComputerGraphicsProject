import GUI from 'lil-gui'
import {
  Clock,
  LoadingManager,
  PCFSoftShadowMap,
  Scene,
  WebGLRenderer,
} from 'three'
import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import Stats from 'three/addons/libs/stats.module.js'
import '../style/style.css'
import { initLights } from './lights';
import { ambientLight, pointLight } from './lights';
import { initHelpers, axesHelper, pointLightHelper, gridHelper } from './helpers/helpers';
import { initCameraAndControls, camera, cameraControls } from './controls';
import { loadRoom, loadMirrors, loadMario, room, mario, mirrors, characterControls } from './objects';

const CANVAS_ID = 'scene'

let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let loadingManager: LoadingManager
let clock: Clock
let stats: Stats
let gui: GUI

const myScene = {
    showBumpMap: true, 
    showRoom: true, 
    showMario: true, 
    showMirrors: true
}

init()
animate()

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    scene = new Scene()
  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = new LoadingManager()

    loadingManager.onStart = () => {
      console.log('loading started')
    }
    loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:')
      console.log(`${url} -> ${loaded} / ${total}`)
    }
    loadingManager.onLoad = () => {
      console.log('loaded!')
    }
    loadingManager.onError = () => {
      console.log('❌ error while loading')
    }
  }

  // ===== 💡 LIGHTS =====
  initLights(scene)

  // ===== 📦 OBJECTS =====
  {
        loadRoom(scene, myScene.showBumpMap);
        loadMirrors(scene);
        loadMario(scene, camera, cameraControls);
  }

  // spotLight.target = mario;

  // ===== 🎥 CAMERA =====
  // ===== 🕹️ CONTROLS =====
  {
    initCameraAndControls(scene, canvas);

    // Full screen
    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas)
      }
    });
  }

  // ===== 🪄 HELPERS =====
  initHelpers(scene);

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock()
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }

  // ==== 🐞 DEBUG GUI ====
  {
    gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

    const objectsFolder = gui.addFolder('Bump Map')
    objectsFolder.add(myScene, 'showBumpMap').name('Show Bump Map').onChange((value: boolean) => loadRoom(scene, value));

    const lightsFolder = gui.addFolder('Lights')
    console.log(pointLight);
    lightsFolder.add(pointLight, 'visible').name('point light')
    lightsFolder.add(ambientLight, 'visible').name('ambient light')

    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(axesHelper, 'visible').name('axes')
    helpersFolder.add(pointLightHelper, 'visible').name('pointLight')
    helpersFolder.add(gridHelper, 'visible').name('grid helper')

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(cameraControls, 'autoRotate')

    // persist GUI state in local storage on changes
    gui.onFinishChange(() => {
      const guiState = gui.save()
      localStorage.setItem('guiState', JSON.stringify(guiState))
    })

    // load GUI state if available in local storage
    const guiState = localStorage.getItem('guiState')
    if (guiState) gui.load(JSON.parse(guiState))

    // reset GUI state button
    const resetGui = () => {
      localStorage.removeItem('guiState')
      gui.reset()
    }
    gui.add({ resetGui }, 'resetGui').name('RESET')

    gui.close()
  }
}

function animate() {
    let mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }
    
  requestAnimationFrame(animate)

  stats.update()
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  renderer.render(scene, camera)
}


// Control Keys
const keysPressed = {}
document.addEventListener("keydown", function(event) {
    if (event.shiftKey && characterControls) {
        characterControls.swithRunToToggle()
    } else {
        (keysPressed as any)[event.key.toLowerCase()] = true
    }
}, false)

document.addEventListener("keyup", function(event){
    if (!event.shiftKey) {
    (keysPressed as any)[event.key.toLowerCase()] = false
    }
});

export {mario}
