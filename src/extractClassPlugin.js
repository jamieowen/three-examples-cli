
module.exports = function( extractClass, info ){


    return function extractClassPlugin( babel ){

        const t = babel.types;

        return {

            pre: ( state )=>{

            },

            post: ( state )=>{

            },

            visitor: {

                Program: ( path,state )=>{

                    console.log( 'EXTRACT : ', extractClass );
                    console.log();

                },

                Identifier: ( path,state )=>{   

                    const exports = info.exports;
                    const identifier = path.node.name;  

                    if( exports.indexOf( identifier ) > -1 ){

                        console.log( 'SOMETHING', identifier, extractClass );
                        if( identifier !== extractClass ){

                            let pp = path.find( (p)=>{                                
                                return p.parentPath.isProgram();
                            })

                            pp.remove();
                            console.log( '>>>> ', pp.type );
                            // while( parent ){
                            //     console.log( parent.type );
                            //     parent = path.parentPath;
                            // }


                        }

                    }

                }

            }

        }

    }

}