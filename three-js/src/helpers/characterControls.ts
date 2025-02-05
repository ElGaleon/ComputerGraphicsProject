import {
    AnimationAction,
    AnimationMixer,
    Group,
    Camera,
    Quaternion,
    Vector3
} from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { camera, cameraControls } from '../controls';


const W = 'w'
const A = 'a'
const S = 's'
const D = 'd'
const DIRECTIONS = [W, A, S, D]

export class CharacterControls {

    model: Group
    mixer: AnimationMixer
    animationsMap: Map<string, AnimationAction> = new Map()
    orbitControl: OrbitControls
    camera: Camera

    // State
    toggleRun: boolean = true;
    currentAction: string

    // Temporary data
    walkDirection = new Vector3();
    rotateAngle = new Vector3(0,1,0);
    rotateQuarternion = new Quaternion();
    cameraTarget = new Vector3();

    // Constants 
    fadeDuration: number = 0.2
    runVelocity: number = 1;
    walkVelocity: number = 0.5;

    constructor(
        model: Group,
        mixer: AnimationMixer,
        animationsMap: Map<string, AnimationAction> = new Map(),
        currentAction: string) {
        
            this.model = model;
            this.mixer = mixer;
            this.animationsMap = animationsMap;
            this.currentAction = currentAction;
            this.animationsMap.forEach((value, key) => {
                if (key === currentAction) {
                    value.play();
                }
            })
            this.orbitControl = cameraControls;
            this.camera = camera;
        }

    public swithRunToToggle() {
        this.toggleRun = !this.toggleRun;
    }

    public update(delta: number, keysPressed: any) {
        const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true);
        let play: string = '';
        if (directionPressed && this.toggleRun) {
            play = 'Run';
        } else if (keysPressed["ArrowDown"]) {
            play = 'Slide'
        } else if (keysPressed["m"]) {
            play = 'Moonwalk.001'
        }
        else if (keysPressed["b"]) {
            play = 'Dance'
        }
         else if (directionPressed && !keysPressed["s"]) {
            play = 'Walking'
        }     
        else if (directionPressed && keysPressed["s"]) {
            play = 'Walk Backward'
        }         
        else if (keysPressed[" "]) {
            play = 'Jump';
        }else {
            play = 'Idle';
        }

if (this.currentAction != play) {
    const toPlay = this.animationsMap.get(play);
    const current = this.animationsMap.get(this.currentAction);
    current?.fadeOut(this.fadeDuration);
    toPlay?.reset().fadeIn(this.fadeDuration).play();
    this.currentAction = play;
}
    if (this.currentAction === 'Walk' || this.currentAction === 'Run' || this.currentAction === 'Moonwalk') {
        const angleYCameraDirection = Math.atan2(
            (this.camera.position.x + this.model.position.x),
            (this.camera.position.z + this.model.position.z)
        )
        let directionOffset = this.directionOffset(keysPressed);

        // Rotate model
        this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
        this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2);

        // Calculate firection
        this.camera.getWorldDirection(this.walkDirection);
        this.walkDirection.y = 0;
        this.walkDirection.normalize();
        this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

        const velocity = this.currentAction == 'Run' ? this.runVelocity : this.walkVelocity;

        // Move model & camera
        const moveX = this.walkDirection.x * velocity * delta;
        const moveZ = this.walkDirection.z * velocity * delta;

        if (moveZ != 0 && this.model.position.z + moveZ < roomBoundaries.maxZ && this.model.position.z + moveZ > roomBoundaries.minZ) {
            this.model.position.z+=moveZ;
        }
        if (moveX != 0 && this.model.position.x + moveX < roomBoundaries.maxX && this.model.position.x + moveX > roomBoundaries.minX) {
            this.model.position.x+=moveX;
        }
        this.updateCameraTarget(moveX, moveZ);
    }

        this.mixer.update(delta);
    }

    private updateCameraTarget(moveX: number, moveZ: number) {
        // move camera
        this.camera.position.x += moveX
        this.camera.position.z += moveZ

        // Update camera target
        this.cameraTarget.x = this.model.position.x
        this.cameraTarget.y = this.model.position.y
        this.cameraTarget.z = this.model.position.z
        this.orbitControl.target = this.cameraTarget

    }
    

    private directionOffset(keysPressed: any) {
        let directionOffset = 0 // corresponds to W
        if (keysPressed[W]) {
            if (keysPressed[A]) { // W + A
                directionOffset = Math.PI / 4
            } else if(keysPressed[D]) { // W + D
                directionOffset = -Math.PI / 4
            }
        } else if (keysPressed[S]) {
            if (keysPressed[A]) { // S + A
                directionOffset = Math.PI / 4 + Math.PI / 2
            } else if(keysPressed[D]) { // W + D
                directionOffset = -Math.PI / 4 -Math.PI / 2
            }
        } else if (keysPressed[A]) {
            directionOffset = Math.PI / 2 // A
        } else if (keysPressed[D]) {
            directionOffset = - Math.PI / 2 // D
        }
        return directionOffset;
    }
}

let roomBoundaries = {
    minX: -3.4, minZ: -1.9,
    maxX: 3.4, maxZ: 1.9,
}

