
module.exports = class ExampleInfo{

    constructor( path,group,manager ){
        
        this.path = path;
        this.group = group;
        this.manager = manager;

        this.imports = [];
        this.exports = [];
        this.globals = [];

        this.exportDefault = null;

        /**
         * Exclude all files by default. They will be added in the filter process.
         */
        this.include = false; 
        
    }

    isGlobal(cls){

        return this.manager.isGlobal(cls);

    }

    addImport( memberName ){
        
        if( this.isGlobal( memberName ) ){
            if( this.globals.indexOf( memberName ) === -1 ){
                this.globals.push( memberName );
            }
        }else
        if( this.imports.indexOf( memberName ) === -1 ){
            this.imports.push( memberName );
        }

    }

    addExport( memberName ){

        if( this.exportDefault === null && this.path.indexOf( memberName ) > -1 ){
            this.exportDefault = memberName;
        }

        if( this.exports.indexOf( memberName ) === -1 ){
            this.exports.push( memberName );
        }        

    }
    
    detectCircularRefs( info ){

        const result = [];
        if( info.path === this.path ){
            return result;
        }

        info.imports.forEach( ( imp )=>{

            this.exports.forEach( ( exp )=>{

                if( imp === exp ){

                    this.imports.forEach( (imp2)=>{

                        info.exports.forEach( (exp2)=>{
                            
                            if( imp2 === exp2 ){

                                result.push( {
                                    info: this,
                                    ref:{
                                        export: imp,
                                        import: imp2
                                    }                                    
                                } );

                            }

                        })
                        
                    })

                }

            })            

        })

        return result;

    }

}