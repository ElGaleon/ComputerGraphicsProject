import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";

class Mesh {
    object;
    objUrl;
    mtlUrl;

    /**
     *
     * @param object
     * @param {string} objUrl
     * @param {string} mtlUrl
     */
    constructor(object, objUrl, mtlUrl) {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        mtlLoader.load(mtlUrl, (materials) => {
            materials.preload();

            objLoader.setMaterials(materials);
            objLoader.load(objUrl, (objData) => {
                object.add(objData);
            })
        } );
    }

}