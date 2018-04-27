const path = require( 'path' );

module.exports = class ExamplesManager{

    constructor( three ){

        this.globals = Object.keys( three );
        this.examples = []; 

        this.byPath = {};
        this.byGroup = {};
        this.byClass = {};

        this.circularRefs = [];
        this.resolvedCircularRefs = [];
        this.unresolvedCircularRefs = [];

    }

    isGlobal( cls ){
        
        return this.globals.indexOf( cls ) > -1;

    }

    addExample( info ){

        if( this.examples.indexOf(info) === -1 ){
            this.examples.push( info );
        }else{
            return;
        }

        this.byPath[ info.path ] = info;
        this.byGroup[ info.group ] = info;

        info.exports.forEach( (ex)=>{
            this.byClass[ ex ] = info;
        });

    }

    /**
     * Update the circular ref list.
     * 
     * Files that do contain cicular refs will be 
     * have multiple classes exported to different
     * files during transformation. This is providing
     * that the files in question can be split.
     */
    updateCircularRefs(){

        this.circularRefs.splice(0);
        
        // Detect Refs
        this.examples.forEach( (current)=>{

            this.examples.forEach( (target)=>{

                this.circularRefs = this.circularRefs.concat(
                    current.detectCircularRefs( target )
                ); 

            });

        });

        this.resolvedCircularRefs.splice(0);
        this.unresolvedCircularRefs.splice(0);

        const resolutions = [];
        const writePathCount = {};

        const createWritePath = ( info, cls )=>{

            let parts = info.path.split( path.sep );
            parts[ parts.length-1 ] = cls + '.js';
            return parts.join( path.sep );

        }

        const incrementWritePath = ( writePath )=>{

            if( writePathCount[ writePath ] === undefined ){
                writePathCount[ writePath ] = 1;
            }else{
                writePathCount[ writePath ]++;
            }

        }

        this.circularRefs.forEach( ( circ )=>{

            const ref = circ.ref;
            const imp = this.byClass[ ref.import ];
            const exp = this.byClass[ ref.export ];

            const result = {
                resolveImport: false,
                resolveExport: false,
                circ: circ,
                import: imp,
                export: exp,
                splitClass: null,
                writePath: null 
            };

            resolutions.push( result );

            /**
             * Resolve by checking if the target is 
             * not the exportDefault on both sides, in which case we
             * should be able to split this class in to
             * a separate file.
             * 
             * Also, count up the results of one side vs
             * the other to choose the least number
             * of splits possible and choose one option over
             * the other if the same split file is resolved
             * multiple times.
             */

            if( circ.ref.export !== exp.exportDefault ){

                result.resolveExport = true;
                result.splitClass = circ.ref.export;
                result.writePath = createWritePath( exp, circ.ref.export );
                incrementWritePath( result.writePath );
            }

            if( circ.ref.import !== imp.exportDefault ){

                result.resolveImport = true;
                result.splitClass = circ.ref.import;
                result.writePath = createWritePath( imp, circ.ref.import );
                incrementWritePath( result.writePath );

            }

        });

        const unresolved = resolutions.filter( (res)=>{
            return !res.resolveImport && !res.resolveExport;
        })

        const resolved = resolutions.filter( (res)=>{
            return res.resolveImport || res.resolveExport;
        })

        /**
         * Optimize to use optimal split via
         * import or via export.
         */
        unresolved.forEach( (un)=>{

            console.log( 'Unresolved:', un.circ.ref.import, un.circ.ref.export );
            
        })

        resolved.forEach( (res)=>{

            if( res.resolveExport && res.resolveImport ){

                const impWritePath = createWritePath( res.import, res.circ.ref.import );
                const expWritePath = createWritePath( res.export, res.circ.ref.export );

                if( writePathCount[ impWritePath ] > writePathCount[ expWritePath ] ){
                    res.splitClass = res.circ.ref.import;
                    res.writePath = impWritePath;
                }else{
                    res.splitClass = res.circ.ref.export;
                    res.writePath = expWritePath;
                }

            }

            console.log( 'Resolved:', res.splitClass, res.writePath, res.circ.ref.import, res.circ.ref.export );
            
        })

        console.log( writePathCount );

    }

}