const path = require( 'path' );
const fs = require( 'fs-extra' );
const gatherExampleInfo = require( './gatherExampleInfo' );
const writeTransformed = require( './writeTransformed' );

// var argv = require('yargs')
//   .option('size', {
//     alias: 's',
//     describe: 'choose a size',
//     choices: ['xs', 's', 'm', 'l', 'xl']
//   })
//   .help()
//   .argv



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
        throw new Error( `Couldn't resolve three.js package. Make sure it is installed in your project.` );
    }
}

/**
 * Traverse three.js examples and build import/export & folder info.
 */

gatherExampleInfo( threePath, {} )
    .then( ( info )=>{

        // console.log( 'MAP' , info );

        return 

    })
