
const extractClassPlugin = require( './extractClassPlugin' );

/**
 * Additional step to extract classes that have are causing
 * circular reference problems.
 * 
 * These classes are seperated into seperate files, and we must
 * re-evaluate their imports/exports after the class has been extracted.
 */
module.exports = function( state ){

    return new Promise( ( resolve,reject )=>{

        const extractOutputs = state.output.filter( ( item )=>{
            return item.extractClass !== undefined;
        });

        console.log( 'EXTRACT CLASSES: ', extractOutputs );

        let queue = Promise.resolve();

        extractOutputs.forEach( ( extractItem )=>{

            queue = queue.then( ()=>{

                return new Promise( (resolve,reject )=>{
    
                    babel.transformFile( path.join( state.threePath, extractItem.input ), {
                        plugins: [ 
                            extractClassPlugin( extractItem.extractClass, extractItem.info )
                        ]
                    }, ( err, result )=>{
            
                        if( err ){
                            reject(err);
                        }else{    
                            resolve( result );
                        }                        
            
                    } )
    
                })
                
            });

        });

        return queue.then( ()=>{

            console.log( 'REJECT' );
            reject();
            // resolve();

        })


    })

}