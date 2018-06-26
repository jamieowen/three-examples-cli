const chalk = require( 'chalk' );
const package = require( '../../package.json' );

let step = 1;

module.exports = {

    intro: ()=>{

        const border = chalk.yellow;
        const message = chalk.blue;

        console.log( border('*********') );
        console.log( message( `${package.name}`) );
        console.log( message( `${package.version}`) );
        console.log( border('*********') );
    },

    message: ()=>{

    },

    file: ( from, to, newFile=false )=>{

        console.log( chalk.blue( from ) + ' >> ' + chalk.yellow( to ) );

    },

    step: ( message )=>{

        let num = ( '00' + step ).slice(-2);
        console.log( '' );
        console.log( chalk.grey( num + '__' )  + chalk.green( message ) );
        step++;

    },

    substep: ( id, message )=>{

    },

    info: ()=>{

    },

    error: ()=>{

    },

    warning: ( warning, message )=>{

        console.log( chalk.red( warning ) + ' ' + chalk.white( message ) );
        
    }

}