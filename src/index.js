const path = require( 'path' );
const fs = require( 'fs-extra' );
const yargs = require('yargs');

const globAndGroup = require( './globAndGroup' );
const addGroupArgs = require( './addGroupArgs' );
const gatherExampleInfo = require( './gatherExampleInfo' );
const filterInfo = require( './filterInfo' );
const writeTransformed = require( './writeTransformed' );

/**
 * Add general arguments.
 */

yargs.option( 'output', {
    // alias: 's',
    describe: `Set the destination output folder.`,
});

yargs.option( 'three', {
    describe: `Provide a specific path to three.js`,
} )

yargs.option( 'cache', {
    // alias: 's',
    describe: `Cache the initial ast traversal.`,
});

yargs.option( 'dry-run', {
    // alias: 's',
    describe: `Output the paths to converted files.`,
});

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

const writePath = path.join( threePath, 'ex' );

 /**
  * Populated and passed through via various tasks below.
  */
const state = {
    yargs: yargs,
    argv: null,
    examples: null,    
    manager: null,
    output: null,
    threePath: threePath,
    writePath: writePath
}

Promise.resolve()
    .then( ()=>globAndGroup( state ) ) // Populate state.examples.
    .then( ()=>addGroupArgs( state ) ) // Populate state.argv with groups.
    .then( ()=>gatherExampleInfo( state ) ) // Populate state.manager.
    .then( ()=>filterInfo( state ) ) // Apply filters to state.manager and generate output list.
    .then( ()=>writeTransformed( state ) ) // Transform and write output list.
    .then( ()=>{

        console.log( 'Done..' );
        // console.log( 'MAP' , info );

        return 

    })
    .catch( (err)=>{

        console.log( 'Err ', err );

    })
