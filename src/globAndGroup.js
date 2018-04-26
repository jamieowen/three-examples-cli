const path = require( 'path' );
const glob = require( 'glob' );

module.exports = function globAndGroup( threePath ){

    return new Promise(( resolve,reject )=>{

        glob( 'examples/js/**/*.js', {
            cwd: threePath,
            ignore: [
    
                'examples/js/*.*',
    
                'examples/js/libs/**/*.*',
                'examples/js/crossfade/**/*.*',
                'examples/js/workers/**/*.*',
    
                'examples/js/loaders/sea3d/**/*.*',
                'examples/js/loaders/ctm/**/*.*',
    
                // 'examples/js/loaders/NodeMaterialLoader.js',
                'examples/js/loaders/PRWMLoader.js',
                'examples/js/loaders/XLoader.js',
                'examples/js/Octree.js',
                'examples/js/Volume.js'
    
            ]
        }, (err, examples )=>{
            
            if( err ){
                reject( err );
            }else{

                examples = examples.map( ( ex,i )=>{

                    const folders = ex.split( path.sep );
                    /**
                     * e.g : examples/js/group
                     */                    
                    const group = folders.length > 2 ? folders[2] : 'none';

                    return {
                        path: ex,
                        group: group
                    };
            
                })
                
                resolve( examples );

            }

        } );

    });

};