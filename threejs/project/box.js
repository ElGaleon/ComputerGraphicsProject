/* this class represents a 3D mesh */

import * as THREE from 'three';

export class Box extends THREE.Mesh {
    // constructor
    constructor({
                    width,
                    height,
                    depth,
                    color = 0x00FF00, // default color
                    transparent = false,
                    opacity = 1,
                    velocity = { // default values
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    position = {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    zAcceleration = false
                }) {
        // calling constructor of extended class
        super(
            new THREE.BoxGeometry(width, height, depth),
            new THREE.MeshPhongMaterial({ color, transparent, opacity})
        );

        // setting properties
        this.width = width;
        this.height = height;
        this.depth = depth;

        this.position.set(position.x, position.y, position.z);

        // computing bottom and top positions
        this.bottom = this.position.y - this.height / 2;
        this.top = this.position.y + this.height / 2;
        // right and left positions
        this.right = this.position.x + this.width / 2;
        this.left = this.position.x - this.width / 2;
        // front and back positions
        this.front = this.position.z + this.depth / 2;
        this.back = this.position.z - this.depth / 2;

        // movement parameters
        this.velocity = velocity;
        this.gravity = -0.002; // to be tuned
        this.zAcceleration = zAcceleration;
    }
} // Box class