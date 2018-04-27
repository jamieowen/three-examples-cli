
module.exports = class ExamplesManager{

    constructor( three ){

        this.globals = Object.keys( three );
        this.examples = []; 

        this.byPath = {};
        this.byGroup = {};
        this.byClass = {};

        this.circularRefs = [];
        this.resolvedCircularRefs = [];

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
        const isResolved = {};

        /**
         * Create an id for a circular ref.
         * As we will have generated two circ ref objects,
         * A > B & B > A, we will only resolve once
         * and that should work.
         */
        const createId = ( imp,exp )=>{

            const lookup = [ imp,exp ].sort( (a,b)=>{
                return b - a;
            })

            console.log( 'LOOKUP', lookup );
            return lookup.join( '_' );

        }

        this.circularRefs.forEach( ( circ )=>{

            const ref = circ.ref;
            const imp = this.byClass[ ref.import ];
            const exp = this.byClass[ ref.export ];
            const id = createId( ref.import, ref.export );

            if( isResolved[id] === undefined ){
                isResolved[id] = {
                    id: id,
                    result: false,
                    circ: circ,
                    import: imp,
                    export: exp                    
                }
            }

            /**
             * Resolve by checking if the target is 
             * not the exportDefault and that we have
             * multiple exports, in which case we
             * should be able to split this class in to
             * a seperate file.
             */
            if( !isResolved[id].result ){

                if( 
                    circ.ref.export !== exp.exportDefault &&
                    exp.exports.length > 1
                ){

                    isResolved[id].result = true;
                    console.log( 'Resolved', id, exp.path );

                }

            }

        });

        const unresolved = Object.keys( isResolved )
            .map( (id)=>{
                return isResolved[id];
            })
            .filter( (res)=>{
                return !res.result;
            })

        unresolved.forEach( (un)=>{

            console.log( 'Unresolved:', un.id );
            
        })

    }

}