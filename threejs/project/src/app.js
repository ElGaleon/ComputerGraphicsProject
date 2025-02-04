"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OBJLoader_1 = require("three/examples/jsm/loaders/OBJLoader");
var MTLLoader_1 = require("three/examples/jsm/loaders/MTLLoader");
var THREE = require("three");
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
var objLoader = new OBJLoader_1.OBJLoader();
var mtlLoader = new MTLLoader_1.MTLLoader();
camera.position.z = 0;
function animate() {
    renderer.render(scene, camera);
}
animate();
