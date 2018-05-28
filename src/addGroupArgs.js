

module.exports = function addGroupArgs( state ){

    const yargs = state.yargs;
    const examples = state.examples;

    return Promise.resolve()
        .then(()=>{

            const groups = [];

            examples.forEach( (ex)=>{
                if( groups.indexOf(ex.group) === -1 ){
                    groups.push( ex.group );
                }
            });

            groups.sort( (a,b)=>{
                return b - a;
            });

            groups.forEach( (group)=>{

                yargs.option( group, {
                    // alias: 's',
                    describe: `Include all ${group} modules.`,
                    default: true
                    // choices: ['xs', 's', 'm', 'l', 'xl']
                  });

            })

            var argv = yargs.help().argv;
            state.argv = argv;

            return state;

        });

}