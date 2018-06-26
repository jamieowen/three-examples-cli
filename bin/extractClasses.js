
const babel = require( '@babel/core' );
const path = require( 'path' );
const extractClassPlugin = require( './extractClassPlugin' );
const transformPlugin = require( './transformPlugin' );

/**
 * 
 * Additional step to extract classes that are causing
 * circular reference problems. e.g. : EffectComposer, Pass.
 * 
 * These classes are transformed into separate files, and we must
 * re-evaluate their imports/exports after the class has been extracted.
 * 
 * The process consists of 2 steps.
 * 1. ( extractClassPlugin ) generates code that contains the isolated extractClass.
 * 2. ( transformPlugin ) runs in the INFO mode and rebuilds imports for that class alone.
 * 
 * The final code is stored in the outputItem and used in the typical writeTransformed process.
 * 
 */
module.exports = function( state ){

    return new Promise( ( resolve,reject )=>{

        const extractOutputs = state.output.filter( ( item )=>{
            return item.extractClass !== undefined;
        });

        let queue = Promise.resolve();
        
        /**
         * Create extracted class versions.
         */
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
                            extractItem.code = result.code;  

                            resolve( extractItem );
                        }
            
                    } )
    
                })
                
            });

        });

        /**
         * Generate 
         */
        extractOutputs.forEach( ( extractItem )=>{

            queue = queue.then( ()=>{

                return new Promise( (resolve,reject )=>{
                    
                    // Clear the previous imports from the first INFO pass
                    extractItem.info.clearRefs();

                    babel.transform( extractItem.code, {
                        plugins: [ 
                            transformPlugin( 'gather', extractItem.info )
                        ]
                    }, ( err, result )=>{
            
                        if( err ){
                            reject(err);
                        }else{    
                            extractItem.code = result.code;                            
                            resolve( extractItem );
                        }                        
            
                    } )
    
                })
                
            });

        });



        return queue.then( ()=>{

            resolve();

        })


    })

}