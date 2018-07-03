const test = require( 'ava' );
const babel = require( '@babel/core' );
const path = require( 'path' );

const extractClassPlugin = require( '../extractClassPlugin' );
const ExampleInfo = require( '../ExampleInfo' );
const EFFECT_COMPOSER_PATH = path.join( __dirname, 'fixtures/EffectComposer.js' );

const createInfo = ( exportDefault )=>{

    const info = new ExampleInfo();

    info.exports = [ 'EffectComposer', 'Pass' ];
    info.exportDefault = exportDefault;

    return info;

}

test( 'Extract EffectComposer->EffectComposer test', (t)=>{

    return new Promise( (resolve,reject)=>{

        const extractItem = {
            extractClass: 'EffectComposer',
            info: createInfo( 'EffectComposer' )
        };

        babel.transformFile( EFFECT_COMPOSER_PATH, {
            plugins: [ 
                extractClassPlugin( extractItem.extractClass, extractItem.info )
            ]
        }, ( err, result )=>{
    
            if( err ){
                reject(err);
            }else{    
                t.pass();
                console.log( result.code );
                resolve( result );
            }
    
        } )

    })

} );

test( 'Extract EffectComposer->Pass test', (t)=>{

    return new Promise( (resolve,reject)=>{
        
        const extractItem = {
            extractClass: 'Pass',
            info: createInfo( 'Pass' )
        };

        babel.transformFile( EFFECT_COMPOSER_PATH, {
            plugins: [ 
                extractClassPlugin( extractItem.extractClass, extractItem.info )
            ]
        }, ( err, result )=>{
    
            if( err ){
                reject(err);
            }else{    
                t.pass();
                console.log( result.code );
                resolve( result );
            }                        
    
        } )

    })

} )