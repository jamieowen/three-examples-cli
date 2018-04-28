import test from 'ava';
import createManagerInfo from './fixtures/createManagerInfo';

let manager;

test.before( (t)=>{

    manager = createManagerInfo();

})

test( 'Test ExampleInfo.hasCircularRef()', (t)=> {

    let effectComposer = manager.byClass['EffectComposer'];
    let maskPass = manager.byClass['MaskPass'];

    let effectRes = effectComposer.detectCircularRefs( maskPass );
    let maskRes = maskPass.detectCircularRefs( effectComposer );

    t.is( effectRes.length, 1 );
    t.deepEqual( effectRes[0].ref, {
        export: 'Pass',
        import: 'MaskPass'
    }, 'EffectComposer should contain circular refs.' );

    t.is( maskRes.length, 1 );
    t.deepEqual( maskRes[0].ref, {
        export: 'MaskPass',
        import: 'Pass'
    }, 'MaskPass should contain circular refs.' );
    
});

test( 'Resolve Circular Refs', (t)=>{

    manager.updateCircularRefs();
    console.log( manager.circularRefs );
    // temp..
    t.is( 1,1 );

});
