import * as THREE from 'three';
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {MTLLoader} from "three/addons/loaders/MTLLoader.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {Reflector} from "three/addons/objects/Reflector.js";

const renderer = new THREE.WebGLRenderer();


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


const geometry = new THREE.PlaneGeometry(5, 5);
const material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
const plane = new THREE.Mesh(geometry, material);
plane.rotateX(Math.PI/2);
scene.add(plane);


const color = new THREE.Color().setHex( 0x112233 );
scene.background = color;

const ambientLight = new THREE.AmbientLight( 0xffffff, 1 );
scene.add( ambientLight );

const pointLight = new THREE.PointLight( 0xffffff, 15 );
camera.add( pointLight );

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);

const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
const gltfLoader = new GLTFLoader();

let room, columns, stage, frame, entrance, door, mario;
/**
gltfLoader.load('../assets/gltf/mario/scene.gltf', function (gltf) {
    console.log(gltf);
    mario = gltf;
    scene.add(gltf.scene);
    gltf.scene; // THREE.Group
    gltf.scenes; // Array<THREE.Group>
    gltf.asset; // Object
},
    // called while loading is progressing
    function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

        console.log( 'An error happened: ' + error);

    });
**/


const mirrorFront1 = new Reflector(new THREE.PlaneGeometry(2, 2), {
    color: new THREE.Color(0x7f7f7f),
    //clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
})
mirrorFront1.position.y = 1
mirrorFront1.position.z = -2
//mirrorFront1.rotateY(Math.PI)
scene.add(mirrorFront1);

mtlLoader.load("../assets/obj/mirror/mirror_room.mtl", function (materials) {
    materials.preload();
    materials.transparent = false;
    materials.opacity = 1;
    console.log(materials);
    objLoader.setMaterials(materials);
    objLoader.load("../assets/obj/mirror/mirror_room.obj", function(object) {
        console.log(object);
            object.traverse(function (node) {
                if (node.material) {
                    node.material.side = THREE.DoubleSide;
                }
            });
       room = object;
       scene.add(room);
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


/**
mtlLoader.load("../assets/obj/bomb/stage.mtl", function (materials) {
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load("../assets/obj/bomb/stage.obj", function(object) {
        stage = object;
        scene.add(stage);
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

mtlLoader.load("../assets/obj/bomb/columns.mtl", function (materials) {
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load("../assets/obj/bomb/columns.obj", function(object) {
        object.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });
        columns = object;
        scene.add(columns);
    },
        // called when loading is in progress
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        });
});

mtlLoader.load("../assets/obj/bomb/frame.mtl", function (materials) {
    materials.preload();
    objLoader.setMaterials(materials);
    objLoader.load("../assets/obj/bomb/frame.obj", function(object) {
            object.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });
            frame = object;
            scene.add(frame);
        },
        // called when loading is in progress
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        });
});
**/
camera.position.x = 2;
camera.position.z = 2;
camera.position.y = 2;
controls.update();

function animate() {
    renderer.render( scene, camera );
}

animate();