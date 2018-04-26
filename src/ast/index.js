
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
                throw new Error( `Couldn't result resolve MemberExpression head. Increase maxDepth.` );
            }

            return result;

        }
    }

}