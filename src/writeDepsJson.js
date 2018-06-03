const fs = require( 'fs' );
const path = require( 'path' );

module.exports = ( state )=>{

    if( state.argv[ 'write-deps' ] ){

        return new Promise( (resolve,reject)=>{

            const jsonByClass = {};
            const extractedMap = {};
            
            state.output.forEach( ( output )=>{

                if( output.extractClass ){
                    extractedMap[ output.extractClass ] = output;
                }

            })

            Object.keys( state.manager.byClass ).forEach( (key)=>{

                const info = state.manager.byClass[ key ];
                const extracted = extractedMap[ info.exportDefault ];

                jsonByClass[ key ] = {
                    inputPath: info.path,
                    outputPath: extracted ? extracted.output : info.path.replace( 'examples/js/', '' ),
                    wasExtracted: extracted !== undefined,
                    imports: info.imports,
                    exports: info.exports,
                    globals: info.globals,
                    exportDefault: info.exportDefault,
                    group: info.group
                }

            });

            const writePath = path.join( process.cwd(), state.argv[ 'write-deps' ] );
            fs.writeFileSync( writePath, JSON.stringify(jsonByClass,null,4), { encoding: 'utf8' } );

        } );

    }else{

        return Promise.resolve( state );

    }


}