const path = require( 'path' );
const glob = require( 'glob' );

module.exports = function globAndGroup( state ){

    return new Promise(( resolve,reject )=>{

        const threePath = state.threePath;
        
        glob( 'examples/js/**/*.js', {
            cwd: threePath,
            ignore: [
    
                'examples/js/*.*',
    
                'examples/js/libs/**/*.*',
                'examples/js/crossfade/**/*.*',
                'examples/js/workers/**/*.*',
    
                'examples/js/loaders/sea3d/**/*.*',
                'examples/js/loaders/ctm/**/*.*',
                
                // 'examples/js/math/ColorConverter.js',
                // 'examples/js/loaders/NodeMaterialLoader.js',
                // 'examples/js/loaders/PRWMLoader.js',
                // 'examples/js/loaders/XLoader.js',
                // 'examples/js/Octree.js',
                // 'examples/js/Volume.js'
    
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
                
                state.examples = examples;
                resolve( state );

            }

        } );

    });

};