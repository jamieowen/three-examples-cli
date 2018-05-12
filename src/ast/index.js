
module.exports = ( t )=>{

    return {

        /**
         * In various cases we have these situations :
         * 
         * THREE.EffectComposer = 
         * THREE.EffectComposer.prototype = 
         * THREE.EffectComposer.prototype.contructor = 
         * 
         * Which gives us a chained MemberExpression.
         * 
         * Resolve to the head of the MemberExpression so
         * path.parentPath.node.type !== 'MemberExpression'
         * 
         */
        getMemberExpressionHead: ( path )=>{

            const maxDepth = 10;
            
            if( !t.isMemberExpression(path) ){
                return null;
            }

            let result;
        
            for( let i = 0; i<maxDepth&&!result; i++ ){

                if( !t.isMemberExpression( path.parentPath ) ){
                    result = path;
                }
                path = path.parentPath;

            }

            if( !result ){
                throw new Error( `Couldn't resolve MemberExpression head. Increase maxDepth.` );
            }

            return result;

        },

        _traverseMemberExpressionName: function( path, result=[] ){

            if( t.isMemberExpression( path.node.object ) ){
                this._traverseMemberExpressionName( path.get('object'), result );
            }else
            if( t.isIdentifier( path.node.object ) ){
                result.push( {
                    value: path.node.object.name,
                    type: 'Identifier'
                });
            }else{
                throw new Error( 'Unhandled' );
            }

            if( t.isIdentifier( path.node.property ) ){
                result.push( {
                    value: path.node.property.name,
                    computed: path.node.property.computed,
                    type: 'Identifier'
                });                
            }else
            if( t.isLiteral( path.node.property ) ){
                result.push( {
                    type: 'Literal',
                    computed: path.node.property.computed,
                    value: path.node.property.value
                })
            }else{
                result.push( {
                    type: path.get( 'property' ).type
                })
            }
            
            return result;
        },

        /**
         * Deconstruct nested member expressions into an array.
         * e.g. THREE.Pass.prototype.constructor = 
         * Is converted into an array split at the '.' along
         * with AST node types.
         */
        deconstructMemberExpression: function( path, isHead=false ){

            if( !t.isMemberExpression(path) ){
                return null;
            }
    
            let head = path;
            if( !isHead ){
                head = this.getMemberExpressionHead( path );
            }

            const result = this._traverseMemberExpressionName( head );
            return result;

        },

        _createNode: function( item ){

            if( item.type === 'Identifier' ){
                return t.identifier( item.value )
            }else
            if( item.type === 'Literal' ){
                return t.identifier( item.value );
                // return t.stringLiteral( item.value );
            }else{
                throw new Error( 'Unhandled type...' + item.type );
            }

        },

        /**
         * Reconstruct a deconstructed member expression
         * into valid AST nodes.
         */
        reconstructMemberExpression: function( array ){

            const tailProp = this._createNode( array.pop() );
            const len = array.length;

            let prevNode = tailProp;
            let i = len-1;
            while( i >= 0 ){

                let currNode = this._createNode( array[i] );
                prevNode = t.memberExpression( prevNode, currNode );
                i--;

            }

            return prevNode;

        }
    }

}