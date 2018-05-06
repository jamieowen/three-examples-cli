
module.exports = function filterInfo( state ){

    const argv = state.argv;
    const manager = state.manager;

    return new Promise( ( resolve, reject )=>{

        /**
         * All examples files are excluded by default.
         * Check the filter status and include each file and their imports.
         */
        manager.examples.forEach( (info)=>{

            const group = info.group;

            if( argv[ group ] ){
                
                if( !manager.isMissingImports( info ) ){

                    info.include = true;
                    const imports = manager.findAllImports( info );

                    imports.forEach( (imp)=>{
                        const info = manager.byClass[ imp ];
                        info.include = true;
                    })

                }else{
                    console.log( 'Warning missing imports.:', info.exportDefault ); // excluding root files?
                }
            }

        })

        const circRes = manager.resolveCircularRefs();
        const outputFiles = [];
        /**
         * Build the expected write paths
         */
        manager.examples.forEach( (info)=>{

            if(info.include){

                outputFiles.push( {
                    input: info.path,
                    output: info.path
                })

            }
        })
        
        outputFiles.forEach( ( f )=>{

            console.log( f.input );
            console.log( '      ', f.output );

        })

        console.log( circRes.extract );
        

        process.exit();
        // resolve( manager );        

    })

}