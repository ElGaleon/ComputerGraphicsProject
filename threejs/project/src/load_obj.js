/**
 * 
 * @param {*} object 
 * @param {string} objPath 
 * @param {string} mtlPath 
 */
function loadObj(object, objPath, mtlPath) {
    // Load Materials
    mtlLoader.load(mtlPath, function (materials) {
        materials.preload();
        console.log(materials);
        objLoader.setMaterials(materials);
        objLoader.load(objPath, function(objData) {
            console.log(objData);
                object.traverse(function (node) {
                    if (node.material) {
                        node.material.side = THREE.DoubleSide;
                    }
                });
           object = objData;
           scene.add(object);
           return object;
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
}