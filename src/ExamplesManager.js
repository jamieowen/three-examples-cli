
module.exports = class ExamplesManager{

    constructor( three ){

        this.globals = Object.keys( three );
        this.examples = []; 

        this.byPath = {};
        this.byGroup = {};
        this.byClass = {};

    }

    isGlobal( cls ){
        
        return this.globals.indexOf( cls ) > -1;

    }

    updateIndexes( info ){

        this.byPath[ info.path ] = info;
        this.byGroup[ info.group ] = info;

        info.exports.forEach( (ex)=>{
            this.byClass[ ex ] = info;
        });        

    }

    updateCircularRefs(){

        /**
         * Detect cicular refs.
         * Files that do contain cicular refs will be 
         * split in two during transformation.
         */
        for( let i = 0; i<this.examples.length; i++ ){

            let info = this.examples[i];

            if( info.imports.length > 0 ){

                for( let j = 0; j<info.imports.length; j++ ){

                    let imported = info.imports[j];
                    let ref = this.byClass[ imported ];

                    if( !ref ){
                        console.log( 'COULD NOT FIND:', ref, imported );
                    }
                    for( let k = 0; k<info.exports.length; k++ ){

                        let exp = info.exports[k];
                        let idx = ref.imports.indexOf( exp );
                        console.log( exp );
                        if( idx > -1 ){
                            // Circular Ref.
                            console.log( 'Circ :', exp,ref.imports[idx] );
                        }

                    }


                }

            }

        }

    }

}