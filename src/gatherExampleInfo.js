const path = require( 'path' );
const glob = require( 'glob' );
const babel = require( '@babel/core' );
const transformPlugin = require( './transformPlugin' );


class ExampleInfo{

    constructor( path, isGlobal ){

        this.path = path;
        this.isGlobal = isGlobal;

        this.imports = [];
        this.exports = [];
        this.globals = [];

        this.exportDefault = null;

    }

    addImport( memberName ){
        
        if( this.isGlobal( memberName ) ){
            if( this.globals.indexOf( memberName ) === -1 ){
                this.globals.push( memberName );
            }
        }else
        if( this.imports.indexOf( memberName ) === -1 ){
            this.imports.push( memberName );
        }

    }

    addExport( memberName ){

        if( this.exportDefault === null && this.path.indexOf( memberName ) > -1 ){
            this.exportDefault = memberName;
        }

        this.exports.push( memberName );

    }

}


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

    let examples = glob.sync( 'examples/js/**/*.js', {
        cwd: threePath,
        ignore: [

            'examples/js/*.*',

            'examples/js/libs/**/*.*',
            'examples/js/crossfade/**/*.*',
            'examples/js/workers/**/*.*',

            'examples/js/loaders/sea3d/**/*.*',
            'examples/js/loaders/ctm/**/*.*',

            'examples/js/loaders/NodeMaterialLoader.js',
            'examples/js/loaders/PRWMLoader.js',
            'examples/js/loaders/XLoader.js',
            'examples/js/Octree.js',
            'examples/js/Volume.js'

        ]
    } );

    // examples = examples.filter( (path)=>{
    //     return path.indexOf( 'postprocessing' ) > -1 || path.indexOf( 'shaders' ) > -1;
    // });

    const isGlobal = ( memberName )=>{

        return three[ memberName ] !== undefined;

    }

    let stats = {};
    let queue = Promise.resolve();

    examples.forEach( ( examplePath )=>{

        const exampleInfo = new ExampleInfo( examplePath, isGlobal );
        info.examples.byPath[ examplePath ] = exampleInfo;

        queue = queue.then( ()=>{

            return new Promise( (resolve,reject )=>{

                // console.log( 'path', examplePath );
                
                babel.transformFile( path.join( threePath, examplePath ), {
                    plugins: [ 
                        transformPlugin( 'gather', exampleInfo, stats )
                    ]
                }, ( err, result )=>{
        
                    if( err ){
                        reject(err);
                    }else{

                        if( exampleInfo.exports.length ){

                            // console.log( '' );
                            // console.log( '/', exampleInfo.path );
                            // console.log( 'globals:', exampleInfo.globals );
                            // console.log( 'imports:', exampleInfo.imports );
                            // console.log( 'exports:', exampleInfo.exports );
                            // console.log( 'default:', exampleInfo.exportDefault );

                        }

                        resolve( result );
                    }                        
        
                } )

            })

        })

    });

    return queue.then( ()=>{

        console.log( stats );
        return info;

    })
    
}