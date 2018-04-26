
module.exports = class ExamplesManager{

    constructor( three ){

        this.globals = Object.keys( three );
        
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

        console.log( 'update Circila refs' );
        return;
        /**
         * Detect circular dependencies.
         */
        let withMultipleExports = Object.keys( info.examples.byPath ).filter( (key)=>{
            let ex = info.examples.byPath[ key ];
            return ex.exports.length > 1;
        })

        withMultipleExports.forEach( (path)=>{
            let info = info.examples.byPath[ path ];
            ex.exports.forEach( (cls)=>{
                let exp = info.examples.byClass[ cls ];
                let circ = info.isCircular( exp );
            })
        })

        console.log( Object.keys( info.examples.byPath ).length );
        console.log( withMultipleExports.length );
        console.log( withMultipleExports );
        


    }

}