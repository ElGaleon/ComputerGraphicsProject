import * as THREE from 'three';
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {MTLLoader} from "three/addons/loaders/MTLLoader.js";
import {FBXLoader} from "three/addons/loaders/FBXLoader.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {Reflector} from "three/addons/objects/Reflector.js";
import { loadMario } from './loaders.js';
import { createMirrors } from './mirrors.js';
import { initLighting } from './lighting.js';
import {camera} from './camera.js';
import {World} from './scene.js';


const world = new World();

// Orbit Controls
const controls = new OrbitControls(camera, world.renderer.domElement);
// controls.enableDamping = true;

// Loaders
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
mtlLoader.setMaterialOptions({side: THREE.DoubleSide});
const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader();

const carpetBumpTexture = new THREE.TextureLoader().load('./assets/images/carpet2.jpg');
carpetBumpTexture.wrapS = THREE.RepeatWrapping;
carpetBumpTexture.wrapT = THREE.RepeatWrapping;
/** 
const brickBumpTexture = new THREE.TextureLoader().load('./assets/images/brick.jpg');
brickBumpTexture.wrapS = THREE.RepeatWrapping;
brickBumpTexture.wrapT = THREE.RepeatWrapping;

const wallkBumpTexture = new THREE.TextureLoader().load('./assets/images/wall.jpg');
wallkBumpTexture.wrapS = THREE.RepeatWrapping;
wallkBumpTexture.wrapT = THREE.RepeatWrapping;
*/


let room, columns, stage, frame, entrance, door;

loadMario(world.scene);
createMirrors(world.scene);
initLighting(world.scene);

// Room
mtlLoader.load("./assets/obj/mirror/mirror_room.mtl", function (materials) {
    materials.preload();
    // Moquette 
    materials.materials["Moquette"].transparent = false;
    materials.materials["Moquette"].reflectivity = 0;
    materials.materials["Moquette"].shininess = 10;
    materials.materials["Moquette"].bumpMap = carpetBumpTexture;
    materials.materials["Moquette"].bumpScale = 0.7;
    // Brick
    materials.materials["Brick"].transparent = false;
    // materials.materials["Brick"].bumpMap = brickBumpTexture;
    // materials.materials["Brick"].bumpScale = 1;
    // Floor
    materials.materials["Floor"].transparent = false;
    // Wall
    materials.materials["Wall"].transparent = false;
    // materials.materials["Wall"].bumpMap = wallkBumpTexture;
    // materials.materials["Wall"].bumpScale = 1;


    objLoader.setMaterials(materials);
    objLoader.load("./assets/obj/mirror/mirror_room.obj", function(object) {
        console.log(object);
            object.traverse(function (node) {
                if (node.name === 'Entrance' || node.name === 'Room') {
                    node.receiveShadow = true;
                } else
                if (node.name === 'Marbles') {
                    node.castShadow = true;
                }
                if (node.isMesh) {
                    node.material.transparent = false;
                    node.material.opacity = 1;
                    node.receiveShadow = true;
                    node.castShadow = true;
                }
                if (node.material) {
                    node.material.side = THREE.DoubleSide;
                }
            });
       room = object;
       world.scene.add(room);
    },
        // called when loading is in progress
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        });
})

controls.update();

window.onkeydown = function(e) {
    console.log(e); 
    if (e.code === 'Space') {
        e.preventDefault();
        playRandomAnimation();
    }
    if (e.code === 'KeyW') {
        e.preventDefault();
        mario.position.z-= 0.05;
    }
    if (e.code === 'KeyS') {
        e.preventDefault();
        mario.position.z+= 0.05;
    }
}

let mixer = new THREE.AnimationMixer(mario);
let clock = new THREE.Clock();

const update = (t) => {
    mixer.update(0.02);
}

function playRandomAnimation() {
    const action =  mixer.clipAction( animations[1]);
    action.play();    
}


function animateLoop() {
    world.animate();
    requestAnimationFrame(animateLoop);
}

animateLoop();