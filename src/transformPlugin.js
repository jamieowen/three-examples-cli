
/**
 * A babel plugin to transform an example.
 * With a few other differences.
 * 
 * @param {*} runMode 
 * @param {*} info 
 */
module.exports = function( runMode, info ){

    return function transformPlugin( babel ){

        const t = babel.types;

        console.log( 'Gather Info Plugin' );

        return {
            
        }

    }

}