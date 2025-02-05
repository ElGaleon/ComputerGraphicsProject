import * as THREE from 'three';
import {camera} from './camera.js';

class World {
    renderer;
    scene;
    constructor() {
        const canvReference = document.getElementById("canvas");
        this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvReference});
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setAnimationLoop( this.animate );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild( this.renderer.domElement );   

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x112233);
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, camera);
    }
}

export {World};