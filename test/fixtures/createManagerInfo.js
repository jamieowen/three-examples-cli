const ExamplesManager = require( '../../src/ExamplesManager' );
const ExampleInfo = require( '../../src/ExampleInfo' );

module.exports = function(){

    const manager = new ExamplesManager( {} );

    const data = [
        { 
            path: 'examples/js/postprocessing/EffectComposer',
            imports: [ 'MaskPass' ],
            exports: [ 'Pass', 'EffectComposer' ],
            exportDefault: 'EffectComposer'
        },
        {
            path: 'examples/js/postprocessing/MaskPass',
            imports: [ 'Pass' ],
            exports: [ 'MaskPass' ],
            exportDefault: 'MaskPass'
        }
    ]
    
    const infoObjects = data.map( (item)=>{

        const info = new ExampleInfo( item.path, 'none', manager );

        info.exports = item.exports.splice(0);
        info.imports = item.imports.splice(0);

        manager.addExample( info );

    });

    return manager;

}