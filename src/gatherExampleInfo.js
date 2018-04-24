const path = require( 'path' );
const glob = require( 'glob' );
const babel = require( '@babel/core' );
const transformPlugin = require( './transformPlugin' );

module.exports = ( threePath, opts )=>{

    const three = require( threePath );
    const info = {

        globals: Object.keys( ( key )=>{

        }),
        examples: {
            byPath: {},
            byFolder: {},
            byClass: {}
        }

    };

    const examples = glob.sync( 'examples/js/**/*.js', {
        cwd: threePath,
        ignore: [
            'examples/js/libs/**/*.*',
            'examples/js/crossfade/**/*.*',
            'examples/js/loaders/sea3d/**/*.*',
            'examples/js/loaders/ctm/**/*.*',


            'examples/js/loaders/NodeMaterialLoader.js',
            'examples/js/loaders/PRWMLoader.js',
            'examples/js/loaders/XLoader.js',
            'examples/js/Octree.js',
            'examples/js/Volume.js'
        ]
    } );

    let queue = Promise.resolve();
    examples.forEach( ( examplePath )=>{

        const exampleInfo = {
            path: examplePath,
            imports: [],
            exports: [],
            globals: [],
            exportDefault: null            
        }

        const createAdd  = ( member,info )=>{

            const array = info[ member ];
            return ( value )=>{
                if( array.indexOf(value) === -1 ){
                    array.push( value );
                }
            }
        }

        exampleInfo.addImport = createAdd( 'imports', exampleInfo );
        exampleInfo.addExport = createAdd( 'exports', exampleInfo );
        exampleInfo.addGlobal = createAdd( 'globals', exampleInfo );

        queue = queue.then( ()=>{

            return new Promise( (resolve,reject )=>{

                console.log( 'path', examplePath );

                babel.transformFile( path.join( threePath, examplePath ), {
                    plugins: [ 
                        transformPlugin( 'gather', info )
                    ]
                }, ( err, result )=>{
        
                    if( err ){
                        reject(err);
                    }else{
                        resolve( result );
                    }                        
        
                } )

            })

        })

    });

    return queue.then( ()=>{

        return info;

    })
    
}