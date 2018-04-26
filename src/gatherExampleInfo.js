
const path = require( 'path' );
const babel = require( '@babel/core' );
const ora = require( 'ora' );

const transformPlugin = require( './transformPlugin' );

const ExampleInfo = require( './ExampleInfo' );
const ExamplesManager = require( './ExamplesManager' );


module.exports = ( threePath, examples )=>{
    
    const three = require( threePath );
    const manager = new ExamplesManager( three );

    const stats = {};      
    const spinner = ora('Parsing Examples\nHello').start();
    const updateStats = ( path, stats )=>{

        let text = 'Parsing Examples';
        text += `\n:${path}`;

        // let sorted = Object.keys( stats ).map( (k,i)=>{
        //     return { value: stats[k], key: k }
        // } ).sort((a,b)=>b.value-a.value);

        // sorted.forEach( (e)=>{
        //     text += `\n${e.key}:${e.value}`;
        // });

        spinner.text = text;

    }

    let queue = Promise.resolve();  

    examples.forEach( ( example )=>{

        const info = new ExampleInfo( example.path,example.group,manager );

        queue = queue.then( ()=>{

            return new Promise( (resolve,reject )=>{

                updateStats( example.path, stats );

                babel.transformFile( path.join( threePath, example.path ), {
                    plugins: [ 
                        transformPlugin( 'gather', info, stats )
                    ]
                }, ( err, result )=>{
        
                    if( err ){
                        reject(err);
                    }else{

                        manager.updateIndexes( info );
                        resolve( result );

                    }                        
        
                } )

            })

        })

    });

    return queue.then( ( result )=>{
        
        manager.updateCircularRefs();
        spinner.stopAndPersist();
        return manager;

    })
    
}