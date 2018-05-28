const path = require( 'path' );
const fs = require( 'fs-extra' );
const babel = require( '@babel/core' );
const ora = require( 'ora' );
const log = require( './utils/log' );

const transformPlugin = require( './transformPlugin' );

module.exports = ( state )=>{

    // return Promise.resolve();

    console.log( 'Write Files' );

    let queue = Promise.resolve();  

    state.output.forEach( ( outputItem )=>{

        const outputPath = path.join( process.cwd(), 'three-examples', outputItem.output );
        // console.log( 'Output:', outputPath );
        
        queue = queue.then( ()=>{

            return new Promise( (resolve,reject )=>{

                // Transform File.
                let codeOrPath, transformFunc
                if( outputItem.extractClass && outputItem.code ){
                    transformFunc = 'transform';
                    codeOrPath = outputItem.code;
                }else{
                    transformFunc = 'transformFile';
                    codeOrPath = path.join( state.threePath, outputItem.input );
                }

                log.file( outputItem.input, outputItem.output );

                babel[ transformFunc ]( codeOrPath, {
                    plugins: [ 
                        transformPlugin( 'transform', outputItem.info ) // pass arguments in here..
                    ]
                }, ( err, result )=>{
        
                    if( err ){
                        reject(err);
                    }else{    
                        resolve( result );    
                    }                        
        
                } )

            }).then( (ast)=>{

                // Write File.
                return new Promise( ( resolve,reject )=>{

                    fs.ensureDirSync( outputPath.split('/').slice(0,-1).join('/') );

                    fs.writeFile( outputPath, ast.code, {
                        encoding: 'utf8' 
                    }, ( err,res )=>{
        
                        if( err ){
                            reject(err);
                        }else{                                            
                            resolve();
                        }
        
                    });

                });
            });

        })

    });

    return queue.then( ( result )=>{

        console.log( 'Complete' );
        return state;

    })

}