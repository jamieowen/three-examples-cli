module.exports = class ExampleInfo{

    constructor( path,group,manager ){
        
        this.path = path;
        this.group = group;
        this.manager = manager;

        this.imports = [];
        this.exports = [];
        this.globals = [];

        this.circularRefs = [];
        this.exportDefault = null;
        
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

    isCircular(){

        return this.circularRefs.length > 0;

    }

}