const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Exports a JSON file as a map of input example file paths
 * to an array of the number of output files and their internal dependencies.
 */
module.exports = ( state )=>{

    if( state.argv[ 'write-deps' ] ){

        return new Promise( (resolve,reject)=>{

            const jsonByInputPath = {};
            const extractedMap = {};

            /**
             * Could probably be done a bit better...
             */
            state.output.forEach( ( output )=>{

                if( output.extractClass ){

                    extractedMap[ output.extractClass ] = output;

                    if( jsonByInputPath[ output.input ] === undefined ){
                        jsonByInputPath[ output.input ] = [];                    
                    }

                    const info = state.manager.byClass[ output.extractClass ];
                     
                    jsonByInputPath[ output.input ].push( {
                        inputPath: output.input,
                        outputPath: output.output,
                        wasExtracted: true,
                        imports: info.imports,
                        exports: info.exports,
                        globals: info.globals,
                        exportDefault: info.exportDefault,
                        group: info.group                        
                    })
                }

            })

            Object.keys( state.manager.byPath ).forEach( (key)=>{

                const info = state.manager.byPath[ key ];

                if( extractedMap[ info.exportDefault ] ){
                    return; // Ignore if we have handled above.
                }
                
                if( jsonByInputPath[ key ] === undefined ){
                    jsonByInputPath[ key ] = [];                    
                }

                jsonByInputPath[ key ].push( {
                    inputPath: info.path,
                    outputPath: info.path,
                    wasExtracted: false,
                    imports: info.imports,
                    exports: info.exports,
                    globals: info.globals,
                    exportDefault: info.exportDefault,
                    group: info.group
                } );

            });

            const writePath = path.join( process.cwd(), state.argv[ 'write-deps' ] );
            fs.writeFileSync( writePath, JSON.stringify(jsonByInputPath,null,4), { encoding: 'utf8' } );

        } );

    }else{

        return Promise.resolve( state );

    }


}