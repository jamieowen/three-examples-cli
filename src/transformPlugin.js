
const astExtra = require( './ast' );

module.exports = function( runMode, info, stats ){

    const RUN_MODE = {
        INFO: 'gather',
        TRANSFORM: 'transform'
    }

    const incrementStat = ( prop )=>{

        if( !stats[prop] ){
            stats[prop] = 1;        
        }else{
            stats[prop]++;
        }

    }

    return function transformPlugin( babel ){

        const t = babel.types;
        const tExtra = astExtra( t );

        return {

            pre:( state )=>{            
    
            },

            post: ( state )=>{
    
            }, 
            
            visitor: {

                Program: {
                    
                    enter: ( path, state )=>{

                    },
                    exit: ( path, state )=>{



                        if( RUN_MODE.INFO ){

                            /**
                             * Validate/Filter imports. There are cases where we will not be able to 
                             * determine if a usage is definitely an import.
                             * e.g. When we declare a class/constant within a file and use it within the same file.
                             */

                            const before = info.imports;
                            info.imports = info.imports.filter( (imp)=>{
                                return info.exports.indexOf( imp ) === -1 && info.exportDefault !== imp;
                            })

                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }

                    }

                },

                __ExpressionStatement: {

                    enter( path, state ){
    
                        /**
                         * 
                         * There are some cases where an example is wrapped entirely in a self-executing function closure. 
                         * e.g. TransformControls.
                         * In this case, we can replace the ExpressionStatement with the array of nodes of the BlockStatement body.
                         * 
                         * ( function(){
                         * 
                         *      THREE.TransformControls = function(){
                         *      
                         *      }
                         * 
                         *      THREE.TransformControls.prototype = Object.create(Object3D.prototype);
                         *      .. etc
                         * 
                         * }() )
                         * 
                         */

                        if( RUN_MODE.TRANSFORM ){

                            if( t.isProgram( path.getFunctionParent() ) ){
    
                                if( 
                                    t.isCallExpression( path.node.expression ) &&
                                    t.isFunctionExpression( path.node.expression.callee )
                                ){
                                    let block = path.node.expression.callee.body;
                                    path.replaceWithMultiple( block.body );                            
                                }
        
                            }

                        }
    
                    }
    
                }, 
            
                MemberExpression: ( path,state )=>{

                    const valid = path.node.object.name === 'THREE' && 
                        t.isIdentifier( path.node.object ) &&
                        t.isIdentifier( path.node.property );

                    const pathHead = tExtra.getMemberExpressionHead( path );

                     /**
                     * const quat = new THREE.Quaternion(); ( Import )
                     */        
                    if( valid && t.isNewExpression( pathHead.parentPath ) ){

                        incrementStat( 'NewExpression' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else 
                    /**
                     * THREE.EffectComposer = function(){}; ( Export )
                     */
                    if( valid && t.isAssignmentExpression( pathHead.parentPath ) &&
                        pathHead.parentPath.node.left === pathHead.node ){
                        
                        incrementStat( 'AssignmentExpression_Left' );

                        if( RUN_MODE.INFO ){
                            info.addExport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){
                            
                        }
                        
                    }else
                    /**
                     * const filter = THREE.LinearMipMapFilter; ( Import )
                     */                    
                    if( valid && t.isAssignmentExpression( pathHead.parentPath ) &&
                        pathHead.parentPath.node.right === pathHead.node ){

                        incrementStat( 'AssignmentExpression_Right' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){
                            
                        }

                    }else
                    /**
                     * var opts = { blending: THREE.NoBlending }
                     */                     
                    if( valid && t.isObjectProperty( pathHead.parentPath ) ){

                        incrementStat( 'ObjectProperty' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else                     
                    /**
                     * THREE.Pass.call(this); THREE.DeferredShaderChunk[ "unpackFloat" ],
                     */        
                    if( valid && t.isCallExpression( pathHead.parentPath ) ){

                        incrementStat( 'CallExpression' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else
                    
                    /**
                     * if ( THREE.CopyShader === undefined ) {
                     */
                    if( valid && t.isBinaryExpression( pathHead.parentPath ) ){

                        incrementStat( 'BinaryExpression' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else                         
                    /**
                     * [
                     * 'void main(){'
                     *      THREE.DeferredShaderChunk[ "unpackFloat" ],
                     * '}'
                     * ].join('')
                     */        
                    if( valid && t.isArrayExpression( pathHead.parentPath ) ){

                        incrementStat( 'ArrayExpression' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else   
                    /**
                     * var shader = ( _lightPrePass ) ? THREE.ShaderDeferred[ 'spotLightPre' ] : THREE.ShaderDeferred[ 'spotLight' ];
                     */
                    if( valid && t.isConditionalExpression( pathHead.parentPath ) ){

                        incrementStat( 'ConditionalExpression' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else    
                    /**
//                     * case THREE.ColorAdjustmentNode.SATURATION:                      
                     */
                    if( valid && t.isSwitchCase( pathHead.parentPath ) ){

                        incrementStat( 'SwitchCase' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else    
                    /**
                     * var shader = THREE.CopyShader
                     */
                    if( valid && t.isVariableDeclarator( pathHead.parentPath ) ){

                        incrementStat( 'VariableDeclarator' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else
                    /**
                     * this.scope = scope || THREE.LightNode.TOTAL;
                     */                    
                    if( valid && t.isLogicalExpression( pathHead.parentPath ) ){

                        incrementStat( 'LogicalExpression' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else
                    /**
                     * return this.ShaderMaterial;
                     */                    
                    if( valid && t.isReturnStatement( pathHead.parentPath ) ){

                        incrementStat( 'ReturnStatement' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else   
                    /**
                     * if ( typeof THREE.TGALoader !== 'function' ) {
                     * if ( !THREE.DDSLoader ) {
                     */                    
                    if( valid && t.isUnaryExpression( pathHead.parentPath ) ){

                        incrementStat( 'UnaryExpression' );

                        if( RUN_MODE.INFO ){
                            info.addImport( path.node.property.name );
                        }else
                        if( RUN_MODE.TRANSFORM ){

                        }
                        
                    }else                                         
                    if( valid ){

                        incrementStat( 'Unhandled' );

                        console.log( '' );
                        console.log( 'Unhandled Node:', info.path );
                        console.log( '>', path.node.property.name, ' : ', pathHead.parentPath.node.type, path.node.loc.start );
                        
                    }

                }             

            }

        }

    }

}