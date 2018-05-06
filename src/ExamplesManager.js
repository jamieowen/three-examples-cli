const path = require( 'path' );

module.exports = class ExamplesManager{

    constructor( three ){

        this.globals = Object.keys( three );
        this.examples = []; 

        this.byPath = {};
        this.byGroup = {};
        this.byClass = {};

    }

    addExample( info ){

        if( this.examples.indexOf(info) === -1 ){
            this.examples.push( info );
        }else{
            return;
        }

        this.byPath[ info.path ] = info;

        if( this.byGroup[info.group] === undefined ){
            this.byGroup[info.group] = [];
        }

        this.byGroup[info.group].push( info );

        info.exports.forEach( (ex)=>{
            this.byClass[ ex ] = info;
        });

    }

    _getImportsRecursive( imports,accum=[],visited={} ){
    
        for( let i=0; i<imports.length; i++ ){

            let imp = imports[i];

            if( visited[imp] === undefined ){

                visited[ imp ] = true;
                accum.push( imp );

                let info = this.byClass[ imp ];
                this._getImportsRecursive( info.imports,accum,visited );

            }

        }

    }

    findAllImports( info ){

        const visited = {};
        info.exports.forEach( (exp)=>{
            visited[exp] = true;
        });

        const accum = [];
        this._getImportsRecursive( info.imports,accum,visited );
        return accum;

    }

    removeExample( info ){

        const idx = this.examples.indexOf( info );

        if( idx > -1 ){   

            this.examples.splice( idx,1 );

            this.byPath[ info.path ] = undefined;
            delete this.byPath[ info.path ];

            const groupItems = this.byGroup[info.group]

            if( groupItems ){
                const gidx = groupItems.indexOf(info);
                if( gidx > -1 ){
                    groupItems.splice( gidx,1 );
                }
            }

            info.exports.forEach( (ex)=>{
                this.byClass[ ex ] = undefined;
                delete this.byClass[ ex ];
            })

        }

    }

    isGlobal( cls ){
        
        return this.globals.indexOf( cls ) > -1;

    }

    isMissingImports( info ){

        const failed = info.imports.filter( (imp)=>{
            return this.byClass[ imp ] === undefined;
        });

        if( failed.length > 0 ){
            return failed;
        }else{
            return false;
        }    
    }    

    /**
     * Resolve circular refs.
     * 
     * Files that do contain cicular refs will be 
     * have multiple classes exported to different
     * files during transformation. This is providing
     * that the files in question can be split.
     */
    resolveCircularRefs(){
        
        let circularRefs = [];

        this.examples.forEach( (current)=>{

            this.examples.forEach( (target)=>{

                circularRefs = circularRefs.concat(
                    current.detectCircularRefs( target )
                ); 

            });

        });


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

        circularRefs.forEach( ( circ )=>{

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
             * should be able to extract this class in to
             * a separate file.
             * 
             * Also, count up the results of one side vs
             * the other to optimize for the least number
             * of new files possible. And choose one side over
             * the other if both are valid and the same class is extracted
             * multiple times for the other circular refs.
             * 
             * e.g This is logic for the EffectComposer, MaskPass,ShaderPass
             * classes. All Passes are referencing the Pass defined in
             * EffectComposer but the EffectComposer is importing 
             * them also.
             * 
             */

            if( circ.ref.export !== exp.exportDefault ){

                result.resolveExport = true;
                result.extractClass = circ.ref.export;
                result.writePath = createWritePath( exp, circ.ref.export );
                incrementWritePath( result.writePath );

            }

            if( circ.ref.import !== imp.exportDefault ){

                result.resolveImport = true;
                result.extractClass = circ.ref.import;
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

        const extract = {};

        resolved.forEach( (res)=>{

            if( res.resolveExport && res.resolveImport ){

                const impWritePath = createWritePath( res.import, res.circ.ref.import );
                const expWritePath = createWritePath( res.export, res.circ.ref.export );

                if( writePathCount[ impWritePath ] > writePathCount[ expWritePath ] ){
                    res.extractClass = res.circ.ref.import;
                    res.writePath = impWritePath;
                }else{
                    res.extractClass = res.circ.ref.export;
                    res.writePath = expWritePath;
                }

            }

            console.log( 'Resolved:', res.extractClass, res.writePath, res.circ.ref.import, res.circ.ref.export );

            if( !extract[ res.extractClass ] ){

                extract[ res.extractClass ] = {
                    input: res.circ.info.path,
                    extractClass: res.extractClass,
                    output: res.writePath
                }

                /**
                 * Create an extract ref to all other exports in that class.
                 */
                res.circ.info.exports.forEach( (exp)=>{

                    if( !extract[ exp ] ){
                        extract[ exp ] = {
                            input: res.circ.info.path,
                            output: createWritePath( res.circ.info, exp ),
                            extractClass: exp
                        }
                    }
                })

            }
            
        })

        return { resolved,unresolved,extract }

    }

}