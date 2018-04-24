const path = require( 'path' );
const fs = require( 'fs-extra' );
const gatherExampleInfo = require( './gatherExampleInfo' );

/**
 * Resolve path to three.js.
 */

let threePath;
try{
    threePath = require.resolve( 'three' );
}catch( err ){

}

if( !threePath ){
    threePath = path.join( process.cwd(), '/node_modules/three' ); // workaround for linking locally.
    if( !fs.existsSync( threePath ) ){
        threePath = null;
        throw new Error()
    }
}

/**
 * Traverse three.js examples and build import/export & folder info.
 */

gatherExampleInfo( threePath, {} )
    .then( ( info )=>{

        console.log( 'MAP' , info );
        // import EffectComposer from 'three/ex/postprocessing'

    })
