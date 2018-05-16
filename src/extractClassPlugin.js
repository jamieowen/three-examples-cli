
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

                },

                Identifier: ( path,state )=>{   

                    const exports = info.exports;
                    const identifier = path.node.name;  

                    if( exports.indexOf( identifier ) > -1 ){

                        if( identifier !== extractClass ){

                            // Find root of this functional block and delete.
                            
                            let root = path.find( (p)=>{                                
                                return p.parentPath.isProgram();
                            });

                            root.remove();

                        }

                    }

                }

            }

        }

    }

}