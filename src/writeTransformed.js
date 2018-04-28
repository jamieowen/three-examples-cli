const path = require( 'path' );
const fs = require( 'fs-extra' );
const babel = require( '@babel/core' );
const ora = require( 'ora' );

const transformPlugin = require( './transformPlugin' );

module.exports = ( threePath, writePath, manager )=>{

    console.log( 'Write Files' );

    let queue = Promise.resolve();  

    manager.examples.forEach( ( info )=>{

        queue = queue.then( ()=>{

            return new Promise( (resolve,reject )=>{

                // Transform File.
                babel.transformFile( path.join( threePath, info.path ), {
                    plugins: [ 
                        transformPlugin( 'transform', info )
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

                    const newPath = info.path
                        .split( path.sep )
                        .slice( 2 ).join( path.sep );

                    const dirs = newPath
                        .split( path.sep )
                        .slice( 0,-1 ).join( path.sep );    

                    fs.ensureDirSync( path.join( writePath, dirs ) );                   
                    fs.writeFile( path.join( writePath, newPath ), ast.code, {
                        encoding: 'utf8' 
                    }, ( err,res )=>{
        
                        if( err ){
                            reject(err);
                        }else{                                            
                            console.log( 'Written :',path.join( writePath, newPath ) );
                            resolve();
                        }
        
                    });

                });
            });

        })

    });

    return queue.then( ( result )=>{

        console.log( 'Complete' );
        return manager;

    })

}