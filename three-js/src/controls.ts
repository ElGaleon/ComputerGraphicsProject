import { Scene, PerspectiveCamera } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";


let camera: PerspectiveCamera
let cameraControls: OrbitControls

export function initCameraAndControls(scene: Scene, canvas: HTMLElement) {
    camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(1, 1, 1)

    cameraControls = new OrbitControls(camera, canvas);
    // cameraControls.target = mario.position.clone(); TODO: change
    cameraControls.enableDamping = true
    cameraControls.autoRotate = false
    cameraControls.update()
}

export {camera, cameraControls}