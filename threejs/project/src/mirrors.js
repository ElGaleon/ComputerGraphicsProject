
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

export function createMirrors(scene) {
    const mirrorConfigs = [
        { x: 0, y: 1, z: -1.99 },
        { x: -2, y: 1, z: -1.99 },
        { x: 2, y: 1, z: -1.99 }
    ];
    
    mirrorConfigs.forEach(config => {
        const mirror = new Reflector(new THREE.PlaneGeometry(1.6, 2), {
            color: new THREE.Color(0xECECEC),
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
        });
        mirror.position.set(config.x, config.y, config.z);
        scene.add(mirror);
    });
}