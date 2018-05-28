const fs = require( 'fs' );
const path = require( 'path' );

module.exports = ( state )=>{

    if( state.argv[ 'write-deps' ] ){

        return new Promise( (resolve,reject)=>{

            const json = {
                byPath: {},
                output: []
            }

            state.output.forEach( ( output )=>{

                json.output.push( {
                    input: output.input,
                    output: output.output,
                    extractClass: output.extractClass
                })

            })

            state.manager.examples.forEach( (info)=>{

                json.byPath[ info.path ] = {
                    path: info.path,
                    imports: info.imports,
                    exports: info.exports,
                    globals: info.globals,
                    exportDefault: info.exportDefault,
                    group: info.group
                }

            }); 

            const writePath = path.join( process.cwd(), state.argv[ 'write-deps' ] );
            fs.writeFileSync( writePath, JSON.stringify(json,null,4), { encoding: 'utf8' } );

            console.log( 'WRITE JSON' );

        } );

    }else{

        return Promise.resolve( state );

    }


}