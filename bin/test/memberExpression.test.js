const test = require( 'ava' );
const babel = require( '@babel/core' );
const astExtra = require( '../ast' );


const transform = function transformPlugin( babel ){

    const t = babel.types;
    const tExtra = astExtra( t );

    let validCount = 0;
    let successCount = 0;

    return {

        visitor:{

            Program: {
                exit: ( path,state )=>{
                    console.log( 'SUCCESS/VALID', successCount, '/', validCount );
                } 
            },

            MemberExpression: ( path,state )=>{

                const valid = path.node.object.name === 'THREE' && 
                    t.isIdentifier( path.node.object ) &&
                    t.isIdentifier( path.node.property );
    
                const pathHead = tExtra.getMemberExpressionHead( path );
                
                if( valid ){
                    
                    validCount++;

                    if( t.isMemberExpression( path.parentPath ) ){

                        // THREE.Something.Nested ( any number of nested member expression will work )
                        path.parentPath.replaceWith( 
                            t.memberExpression( t.identifier(path.node.property.name ), path.parentPath.node.property, path.parentPath.node.computed )                             
                        );
                        console.log( 'member expression' );
                        successCount++;

                    }else
                    if( t.isCallExpression( pathHead.parentPath ) ||
                        t.isNewExpression( pathHead.parentPath ) ){
                        path.parentPath.node.callee = path.node.property;
                        successCount++;
                    }else
                    if( t.isObjectProperty( pathHead.parentPath ) ){
                        pathHead.parentPath.node.value = pathHead.node.property;
                        successCount++;
                    }else
                    if( t.isReturnStatement( pathHead.parentPath ) || 
                        t.isUnaryExpression( pathHead.parentPath ) ){
                        pathHead.parentPath.node.argument = pathHead.node.property;
                        successCount++;
                    }else
                    if( t.isVariableDeclarator( pathHead.parentPath ) ){
                        pathHead.parentPath.node.init = pathHead.node.property;
                        successCount++;
                    }else
                    if( t.isAssignmentExpression( pathHead.parentPath ) &&
                        pathHead.parentPath.node.right === pathHead.node ){
                        // path.parentPath.replaceWith( path.node.property );
                        console.log( 'RIGHT ASSIGNED SHIT' );
                        // path.parentPath.right.node = pathHead.node
                    }else
                    if( t.isAssignmentExpression( pathHead.parentPath ) &&
                        pathHead.parentPath.node.left === pathHead.node ){
                        
                        if( t.isMemberExpression( pathHead.parentPath.node.left ) ){
                            successCount++;
                            pathHead.parentPath.replaceWith( 
                                t.variableDeclaration( "var", [
                                    t.variableDeclarator( 
                                        t.identifier( path.node.property.name ), pathHead.parentPath.node.right
                                    )
                                ])
                            );                            
                        }else{
                            throw new Error( 'Unhandled left AssignmentExpression.' );
                        }

                    }else
                    if( t.isBinaryExpression( pathHead.parentPath ) &&
                        pathHead.parentPath.node.left === pathHead.node ){
                        path.parentPath.node.left = pathHead.node.property;
                    }else                    
                    if( t.isBinaryExpression( pathHead.parentPath ) &&
                        pathHead.parentPath.node.right === pathHead.node ){
                        path.parentPath.node.right = pathHead.node.property;
                    }else                    
                    {                                                   
                        console.log( 'No Success', pathHead.parentPath.type );
                    }

                    // console.log( pathHead.node.object.name );
                }
                
    
            }
        } 

    }

};

test.cb( 'Test MemberExpression', (t)=>{

    const code = `

        // New Expression
        const quat = new THREE.Quaternion();
        const quat2 = new THREE.Test.Test.Quaternion();

        // Assignment Expression Left
        THREE.EffectComposer = function(){
            THREE.Sub.call(this);
        };

        // AssignmentExpression Right
        const filter = THREE.LinearMipMapFilter;

        // ObjectProperty
        var opts = { blending: THREE.NoBlending };

        // CallExpression
        THREE.Pass.call(this); 
        THREE.DeferredShaderChunk[ "unpackFloat" ];
        THREE.Deferred.Shader.Chunk[ "unpackFloat" ];

        // BinaryExpression
        if ( THREE.CopyShader === undefined ) {};
        if ( undefined === THREE.CopyShader ) {};

        // ArrayExpression
        var shader = [
            'void main(){',
                THREE.DeferredShaderChunk[ "unpackFloat" ],
            '}'
        ].join('')

        // ConditionalExpression
        var shader = ( _lightPrePass ) ? THREE.ShaderDeferred.Some.Thing[ 'spotLightPre' ] : THREE.ShaderDeferred[ 'spotLight' ];
        
        // SwitchCase
        switch(val){
            case THREE.ColorAdjustmentNode.SATURATION:
                break;
        }

        // VariableDeclartor
        var shader = THREE.CopyShader

        // LogicalExpression
        this.scope = scope || THREE.LightNode.TOTAL;

        // ReturnStatement
        var f = function(){
            return THREE.ShaderMaterial;
        }        

        // UnaryExpression
        if ( typeof THREE.TGALoader !== 'function' ) {}
        if ( !THREE.DDSLoader ) {}
    `;

    const expected = `

    `;

    babel.transform( code, {
        plugins: [ 
            transform
        ]
    }, ( err, result )=>{

        if( err ){
            console.log( 'ERROR', err );
        }else{
    
            console.log( result.code );
            t.end();

        }                        

    } )

})