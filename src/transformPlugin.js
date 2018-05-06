const pathUtil = require( 'path' );
const astExtra = require( './ast' );


module.exports = function( runMode, info, stats={} ){

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

                        if( runMode === RUN_MODE.INFO ){

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
                        if( runMode === RUN_MODE.TRANSFORM ){

                            // console.log( 'RUNMODE TRANSFORM', info.path, info.imports, typeof info.imports.forEach );
                            const importNodes = info.imports.map( ( imp )=>{

                                // Determine relative path.

                                const from = info.path.split(pathUtil.sep).slice(0,-1).join(pathUtil.sep);
                                const to = info.manager.byClass[ imp ].path;
                                const relativePath = `./` + pathUtil.relative( from, to ).replace( '.js', '' );

                                return t.importDeclaration( [
                                    t.importSpecifier( t.identifier( imp ), t.identifier( imp ) )
                                ], t.stringLiteral( relativePath ) );
                                
                            } );

                            const globalNodes = info.globals.map( ( imp )=>{
                                return t.importSpecifier( t.identifier( imp ), t.identifier( imp ) )
                            })

                            importNodes.forEach( (importNode)=>{
                                path.unshiftContainer( 'body', importNode )
                            } )

                            path.unshiftContainer( 'body', 
                                t.importDeclaration( globalNodes, t.stringLiteral( 'three' ) ) 
                            );

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

                        if( runMode === RUN_MODE.TRANSFORM ){

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
                    
                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'NewExpression' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

                        }
                        
                    }else 
                    /**
                     * THREE.EffectComposer = function(){}; ( Export )
                     */
                    if( valid && t.isAssignmentExpression( pathHead.parentPath ) &&
                        pathHead.parentPath.node.left === pathHead.node ){
                        
                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'AssignmentExpression_Left' );
                            info.addExport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){
                            
                        }
                        
                    }else
                    /**
                     * const filter = THREE.LinearMipMapFilter; ( Import )
                     */                    
                    if( valid && t.isAssignmentExpression( pathHead.parentPath ) &&
                        pathHead.parentPath.node.right === pathHead.node ){

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'AssignmentExpression_Right' );                            
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){
                            
                        }

                    }else
                    /**
                     * var opts = { blending: THREE.NoBlending }
                     */                     
                    if( valid && t.isObjectProperty( pathHead.parentPath ) ){

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'ObjectProperty' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

                        }
                        
                    }else                     
                    /**
                     * THREE.Pass.call(this); THREE.DeferredShaderChunk[ "unpackFloat" ],
                     */        
                    if( valid && t.isCallExpression( pathHead.parentPath ) ){

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'CallExpression' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

                        }
                        
                    }else
                    
                    /**
                     * if ( THREE.CopyShader === undefined ) {
                     */
                    if( valid && t.isBinaryExpression( pathHead.parentPath ) ){

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'BinaryExpression' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

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

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'ArrayExpression' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

                        }
                        
                    }else   
                    /**
                     * var shader = ( _lightPrePass ) ? THREE.ShaderDeferred[ 'spotLightPre' ] : THREE.ShaderDeferred[ 'spotLight' ];
                     */
                    if( valid && t.isConditionalExpression( pathHead.parentPath ) ){

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'ConditionalExpression' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

                        }
                        
                    }else    
                    /**
//                     * case THREE.ColorAdjustmentNode.SATURATION:                      
                     */
                    if( valid && t.isSwitchCase( pathHead.parentPath ) ){                        

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'SwitchCase' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

                        }
                        
                    }else    
                    /**
                     * var shader = THREE.CopyShader
                     */
                    if( valid && t.isVariableDeclarator( pathHead.parentPath ) ){

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'VariableDeclarator' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

                        }
                        
                    }else
                    /**
                     * this.scope = scope || THREE.LightNode.TOTAL;
                     */                    
                    if( valid && t.isLogicalExpression( pathHead.parentPath ) ){

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'LogicalExpression' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

                        }
                        
                    }else
                    /**
                     * return this.ShaderMaterial;
                     */                    
                    if( valid && t.isReturnStatement( pathHead.parentPath ) ){

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'ReturnStatement' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

                        }
                        
                    }else   
                    /**
                     * if ( typeof THREE.TGALoader !== 'function' ) {
                     * if ( !THREE.DDSLoader ) {
                     */                    
                    if( valid && t.isUnaryExpression( pathHead.parentPath ) ){

                        if( runMode === RUN_MODE.INFO ){
                            incrementStat( 'UnaryExpression' );
                            info.addImport( path.node.property.name );
                        }else
                        if( runMode === RUN_MODE.TRANSFORM ){

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