
module.exports = function filterInfo( state ){

    const argv = state.argv;
    const manager = state.manager;

    return Promise.resolve().then( ()=>{

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

        const modifyOutputPath = ( path )=>{
            return path.split( '/' ).slice( 2 ).join( '/' );
        }

        /**
         * Build the expected write paths
         */
        manager.examples.forEach( (info)=>{

            if( info.include ){

                let willExtract = info.exports.length > 0 ? true : false;

                info.exports.forEach( (exp)=>{
                    willExtract = willExtract && circRes.extract[ exp ] !== undefined;
                }); 

                if( !willExtract ){

                    outputFiles.push( {
                        info: info,
                        input: info.path,
                        output: modifyOutputPath( info.path )
                    })

                }

            }
        })

        /**
         * Add extracted classes, those that need to be split
         * due to a circular ref problem.
         */

         for( let key in circRes.extract ){
            let ex = circRes.extract[ key ];
            ex.output = modifyOutputPath( ex.output );
            outputFiles.push( ex );
         }
        
        outputFiles.forEach( ( f )=>{

            console.log( f.input );
            console.log( '      ', f.output );

        })

        state.output = outputFiles;
        return state;       

    })

}