const path = require( 'path' );
const babel = require( '@babel/core' );
const ora = require( 'ora' );

const transformPlugin = require( './transformPlugin' );

class ExampleInfo{

    constructor( path, isGlobal ){

        this.path = path;
        this.isGlobal = isGlobal;

        this.imports = [];
        this.exports = [];
        this.globals = [];

        this.exportDefault = null;

    }

    addImport( memberName ){
        
        if( this.isGlobal( memberName ) ){
            if( this.globals.indexOf( memberName ) === -1 ){
                this.globals.push( memberName );
            }
        }else
        if( this.imports.indexOf( memberName ) === -1 ){
            this.imports.push( memberName );
        }

    }

    addExport( memberName ){

        if( this.exportDefault === null && this.path.indexOf( memberName ) > -1 ){
            this.exportDefault = memberName;
        }

        this.exports.push( memberName );

    }

}


module.exports = ( threePath, examples )=>{

    const three = require( threePath );
    const info = {

        globals: Object.keys( ( key )=>{

        }),
        examples: {
            byPath: {},
            byGroup: {},
            byClass: {}
        }

    };

    const isGlobal = ( memberName )=>{

        return three[ memberName ] !== undefined;

    }

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

        const exampleInfo = new ExampleInfo( example.path, isGlobal );
        info.examples.byPath[ example.path ] = exampleInfo;

        queue = queue.then( ()=>{

            return new Promise( (resolve,reject )=>{

                updateStats( example.path, stats );

                babel.transformFile( path.join( threePath, example.path ), {
                    plugins: [ 
                        transformPlugin( 'gather', exampleInfo, stats )
                    ]
                }, ( err, result )=>{
        
                    if( err ){
                        reject(err);
                    }else{

                        resolve( result );
                    }                        
        
                } )

            })

        })

    });

    return queue.then( ( result )=>{
        
        /**
         * Search for circular dependencies as these files 
         * need splitting in two when transformed.
         */
        spinner.stopAndPersist();
        console.log( Object.keys( info ) );

        return info;

    })
    
}