import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function loadTextures() {
  const carpetBumpTexture = new THREE.TextureLoader().load('./assets/images/carpet2.jpg');
  carpetBumpTexture.wrapS = carpetBumpTexture.wrapT = THREE.RepeatWrapping;

  const brickBumpTexture = new THREE.TextureLoader().load('./assets/images/brick.jpg');
  brickBumpTexture.wrapS = brickBumpTexture.wrapT = THREE.RepeatWrapping;

  const wallBumpTexture = new THREE.TextureLoader().load('./assets/images/wall.jpg');
  wallBumpTexture.wrapS = wallBumpTexture.wrapT = THREE.RepeatWrapping;

  return { carpetBumpTexture, brickBumpTexture, wallBumpTexture };
}

export function createRoom(scene) {
    console.log(scene);
let textures = loadTextures();
console.log(textures);
  const objLoader = new OBJLoader();
  const mtlLoader = new MTLLoader();
  mtlLoader.setMaterialOptions({ side: THREE.DoubleSide });

  // Room
  mtlLoader.load("./assets/obj/mirror/mirror_room.mtl", function (materials) {
      materials.preload();
      // Moquette 
      materials.materials["Moquette"].transparent = false;
      materials.materials["Moquette"].reflectivity = 0;
      materials.materials["Moquette"].shininess = 10;
      materials.materials["Moquette"].bumpMap = textures.carpetBumpTexture;
      materials.materials["Moquette"].bumpScale = 0.7;
      // Brick
      materials.materials["Brick"].transparent = false;
      materials.materials["Brick"].bumpMap = textures.brickBumpTexture;
      materials.materials["Brick"].bumpScale = 1;
      // Floor
      materials.materials["Floor"].transparent = false;
      // Wall
      materials.materials["Wall"].transparent = false;
      materials.materials["Wall"].bumpMap = textures.wallBumpTexture;
      materials.materials["Wall"].bumpScale = 1;
  
  
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
  });
}

export function loadMario(scene) {
let mario = new THREE.Object3D();
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('./assets/glb/SM64/SM64.glb', function (glb) {
    console.log(glb);
    mario = glb.scene;
    mario.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    }) 
    mario.position.set(0,0.05,0);
    mario.rotation.set(0, Math.PI,0 );
    mario.scale.set(40,40,40);
    scene.add(mario);
},
    // called while loading is progressing
    function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

        console.log( 'An error happened: ' + error);

    });
}
