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

                            const exportNodes = info.exports.map( ( ex )=>{
                                return t.exportSpecifier( t.identifier( ex ), t.identifier( ex ) );                        
                            } );

                            importNodes.forEach( (importNode)=>{
                                path.unshiftContainer( 'body', importNode )
                            } )

                            path.unshiftContainer( 'body', 
                                t.importDeclaration( globalNodes, t.stringLiteral( 'three' ) ) 
                            );

                            path.pushContainer( 'body',
                                t.exportNamedDeclaration( null, exportNodes )
                            )                                  
                            
                            if( info.exportDefault ){
                                path.pushContainer( 'body', 
                                    t.exportDefaultDeclaration( t.identifier( info.exportDefault ) )
                                )
                            }                            

                        }

                    }

                },

            
                MemberExpression: ( path,state )=>{

                    const valid = path.node.object.name === 'THREE' && 
                        t.isIdentifier( path.node.object ) &&
                        t.isIdentifier( path.node.property );

                    const pathHead = tExtra.getMemberExpressionHead( path );
                    
                    if( pathHead !== path ){
                        // console.log( 'Trailing ::', pathHead.node.object.name );
                    }

                    if( valid ){
                        // const dePath = tExtra.deconstructMemberExpression( pathHead,true );
                        // dePath.shift();
                        // const newPath = tExtra.reconstructMemberExpression( dePath );
                    }

                    if( valid && runMode === RUN_MODE.INFO ){

                        if( t.isAssignmentExpression( pathHead.parentPath ) &&                        
                            pathHead.parentPath.node.left === pathHead.node ){

                            /**
                            * THREE.EffectComposer = function(){}; ( Export )
                            */

                            incrementStat( 'AssignmentExpression_Left' );
                            info.addExport( path.node.property.name );

                        }else 
                        if( t.isAssignmentExpression( pathHead.parentPath ) &&
                            pathHead.parentPath.node.right === pathHead.node ){

                            /**
                             * const filter = THREE.LinearMipMapFilter; ( Import )
                             */                

                            incrementStat( 'AssignmentExpression_Right' );                            
                            info.addImport( path.node.property.name );

                        }else                        
                        if( t.isNewExpression( pathHead.parentPath ) ){

                            /**
                             * const quat = new THREE.Quaternion(); ( Import )
                             */      

                            incrementStat( 'NewExpression' );
                            info.addImport( path.node.property.name );
                            
                        }else 
                        /**
                         * var opts = { blending: THREE.NoBlending }
                         */                     
                        if( t.isObjectProperty( pathHead.parentPath ) ){

                            incrementStat( 'ObjectProperty' );
                            info.addImport( path.node.property.name );
                            
                        }else                     
                        /**
                         * THREE.Pass.call(this); THREE.DeferredShaderChunk[ "unpackFloat" ],
                         */        
                        if( t.isCallExpression( pathHead.parentPath ) ){

                            incrementStat( 'CallExpression' );
                            info.addImport( path.node.property.name );
                            
                        }else
                        
                        /**
                         * if ( THREE.CopyShader === undefined ) {
                         */
                        if( t.isBinaryExpression( pathHead.parentPath ) ){

                            incrementStat( 'BinaryExpression' );
                            info.addImport( path.node.property.name );
                            
                        }else                         
                        /**
                         * [
                         * 'void main(){'
                         *      THREE.DeferredShaderChunk[ "unpackFloat" ],
                         * '}'
                         * ].join('')
                         */        
                        if( t.isArrayExpression( pathHead.parentPath ) ){

                            incrementStat( 'ArrayExpression' );
                            info.addImport( path.node.property.name );
                            
                        }else   
                        /**
                         * var shader = ( _lightPrePass ) ? THREE.ShaderDeferred[ 'spotLightPre' ] : THREE.ShaderDeferred[ 'spotLight' ];
                         */
                        if( t.isConditionalExpression( pathHead.parentPath ) ){

                            incrementStat( 'ConditionalExpression' );
                            info.addImport( path.node.property.name );
                            
                        }else    
                        /**
                         * case THREE.ColorAdjustmentNode.SATURATION:                      
                         */
                        if( t.isSwitchCase( pathHead.parentPath ) ){                        

                            incrementStat( 'SwitchCase' );
                            info.addImport( path.node.property.name );
                            
                        }else    
                        /**
                         * var shader = THREE.CopyShader
                         */
                        if( t.isVariableDeclarator( pathHead.parentPath ) ){

                            incrementStat( 'VariableDeclarator' );
                            info.addImport( path.node.property.name );
                            
                        }else
                        /**
                         * this.scope = scope || THREE.LightNode.TOTAL;
                         */                    
                        if( t.isLogicalExpression( pathHead.parentPath ) ){

                            incrementStat( 'LogicalExpression' );
                            info.addImport( path.node.property.name );
                            
                        }else
                        /**
                         * return this.ShaderMaterial;
                         */                    
                        if( t.isReturnStatement( pathHead.parentPath ) ){

                            incrementStat( 'ReturnStatement' );
                            info.addImport( path.node.property.name );
                            
                        }else   
                        /**
                         * if ( typeof THREE.TGALoader !== 'function' ) {
                         * if ( !THREE.DDSLoader ) {
                         */                    
                        if( t.isUnaryExpression( pathHead.parentPath ) ){

                            incrementStat( 'UnaryExpression' );
                            info.addImport( path.node.property.name );
                            
                        }else                                         
                        if( valid ){

                            incrementStat( 'Unhandled' );

                            console.log( '' );
                            console.log( 'Unhandled Node:', info.path );
                            console.log( '>', path.node.property.name, ' : ', pathHead.parentPath.node.type, path.node.loc.start );
                            
                        }

                    }else
                    if( valid && runMode === RUN_MODE.TRANSFORM ){

                        if( t.isMemberExpression( path.parentPath ) ){

                            // THREE.Something.Nested ( any number of nested member expression will work )
                            path.parentPath.replaceWith( 
                                t.memberExpression( t.identifier(path.node.property.name ), path.parentPath.node.property, path.parentPath.node.computed )                             
                            );
    
                        }else
                        if( t.isCallExpression( pathHead.parentPath ) ||
                            t.isNewExpression( pathHead.parentPath ) ){
                            path.parentPath.node.callee = path.node.property;
                        }else
                        if( t.isObjectProperty( pathHead.parentPath ) ){
                            pathHead.parentPath.node.value = pathHead.node.property;
                        }else
                        if( t.isReturnStatement( pathHead.parentPath ) || 
                            t.isUnaryExpression( pathHead.parentPath ) ){
                            pathHead.parentPath.node.argument = pathHead.node.property;
                        }else
                        if( t.isVariableDeclarator( pathHead.parentPath ) ){
                            pathHead.parentPath.node.init = pathHead.node.property;
                        }else
                        if( t.isAssignmentExpression( pathHead.parentPath ) &&
                            pathHead.parentPath.node.right === pathHead.node ){

                            pathHead.parentPath.node.right = pathHead.node.property;
                        }else
                        if( t.isAssignmentExpression( pathHead.parentPath ) &&
                            pathHead.parentPath.node.left === pathHead.node ){
                            
                            if( t.isMemberExpression( pathHead.parentPath.node.left ) ){
                                pathHead.parentPath.replaceWith( 
                                    t.variableDeclaration( "var", [
                                        t.variableDeclarator( 
                                            t.identifier( path.node.property.name ), pathHead.parentPath.node.right
                                        )
                                    ])
                                );
                            }else{
                                throw new Error( 'Unhandled left AssignmentExpression.', info.path );
                            }
    
                        }else
                        // BinaryExpresion or LogicalExpression
                        if( ( t.isBinaryExpression( pathHead.parentPath ) || t.isLogicalExpression( pathHead.parentPath ) )  &&
                            pathHead.parentPath.node.left === pathHead.node ){

                            // if( t.isMemberExpression( pathHead.parentPath.node.left ) ){
                            //     throw new Error( 'Something..' + info.path + JSON.stringify( path.node.loc ) );
                            // }

                            path.parentPath.node.left = pathHead.node.property;
                        }else                    
                        if( ( t.isBinaryExpression( pathHead.parentPath ) || t.isLogicalExpression( pathHead.parentPath ) ) &&
                            pathHead.parentPath.node.right === pathHead.node ){              

                            path.parentPath.node.right = pathHead.node.property;
                        }else
                        if( t.isConditionalExpression( pathHead.parentPath ) ){
                        
                            const condNode = pathHead.parentPath.node;
                            if( condNode.test === pathHead.node ){
                                throw new Error( 'Untested and unhandled path on ConditionalExpression.', info.path );
                            }else
                            if( condNode.consequent === pathHead.node ){
                                pathHead.parentPath.node.consequent = pathHead.node.property;
                            }else   
                            if( condNode.alternate === pathHead.node ){
                                pathHead.parentPath.node.alternate = pathHead.node.property;
                            }

                        }
                        else                    
                        {                                                   
                            throw new Error( 'Unhandled node type.', info.path, path.type, pathHead.parentPath.type );
                        }                        

                    }


                }             

            }

        }

    }

}