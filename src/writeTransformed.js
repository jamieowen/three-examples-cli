const path = require( 'path' );
const fs = require( 'fs-extra' );
const babel = require( '@babel/core' );
const ora = require( 'ora' );

const transformPlugin = require( './transformPlugin' );

module.exports = ( state )=>{

    console.log( 'Write Files' );

    let queue = Promise.resolve();  

    state.output.forEach( ( outputItem )=>{

        const outputPath = path.join( process.cwd(), 'three-examples', outputItem.output );
        console.log( 'Output:', outputPath );
        
        queue = queue.then( ()=>{

            return new Promise( (resolve,reject )=>{

                // Transform File.
                babel.transformFile( path.join( state.threePath, outputItem.input ), {
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

                    // const newPath = info.path
                    //     .split( path.sep )
                    //     .slice( 2 ).join( path.sep );

                    // const dirs = newPath
                    //     .split( path.sep )
                    //     .slice( 0,-1 ).join( path.sep );    

                    fs.ensureDirSync( outputPath.split('/').slice(0,-1).join('/') );                   
                    fs.writeFile( outputPath, ast.code, {
                        encoding: 'utf8' 
                    }, ( err,res )=>{
        
                        if( err ){
                            reject(err);
                        }else{                                            
                            console.log( 'Written :', outputPath );
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