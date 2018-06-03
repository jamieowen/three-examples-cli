const cheerio = require( 'cheerio' );
const fs = require( 'fs-extra' );
const path = require( 'path' );
const glob = require( 'glob' );
const chalk = require( 'chalk' );

const exampleDeps = require( './output-deps.generated' );
const buildOutputPath = path.join( __dirname, '../build' );
const examplesSource = path.join( __dirname, '../three.js/examples' );

const exampleHtmlFiles = glob.sync( '*.html', {
    cwd: examplesSource
} );

exampleHtmlFiles.forEach( ( htmlPath )=>{
        
    const inputHtml = path.join( examplesSource, htmlPath );
    const outputHtml = path.join( buildOutputPath, htmlPath );
    const outputJs = htmlPath.replace( '.html', '.es6.js' );

    const content = fs.readFileSync( inputHtml, { encoding: 'utf8' } );
    const document = cheerio.load( content );
    const scripts = document('body').find('script');
    
    const imports = [];

    // Build map of imports.
    
    const findCircularRefRedirect = ( imp )=>{

        // Could be faster with lookup.
        for( let i = 0; i<exampleDeps.output.length; i++ ){
            let out = exampleDeps.output[i];

            if( out.input === imp ){
                console.log( 'REDIRECT', imp );
            }

        }

        return imp;

    }

    for( let i = 0; i<scripts.length; i++ ){

        let script = scripts[ i ];
        let src = `examples/${script.attribs.src}`;        
        let depInfo = exampleDeps.byPath[ src ];

        if( depInfo ){
            
            depInfo.imports.forEach( (imp)=>{
                if( imports.indexOf(imp) === -1 ){
                    console.log( imp );
                    imports.push( findCircularRefRedirect(imp) );    
                }                
            });

        }
        
    }

    if( imports.length ){
        // console.log( 'EXAMPLE : ', inputHtml, imports.length, imports );
    }

    // Style.
    document( 'head' ).append( `
        <style> 

            .babel-ele{
                font-family: Monospace;
                font-weight: normal;
                font-size: 12px;
                line-height: 30px;
                color: black;
                text-align: left;
                margin: 0px; padding: 0px;
            }


            .babel-h{
                color: white;
            }

            .babel-link{
                color: pink;
            }

            div.babel-info-panel{
                position: absolute;
                margin: 0px;
                padding: 10px;
                padding-bottom: 20px;
                bottom: 0px; left: 0px;
                z-index: 999999;
                width: auto;
                height: auto;
                background-color: hotpink;
            }
            
            div.babel-class-container{
                margin: 0px;
                padding: 0px;
                max-height: 200px;
                overflow-y: scroll;
            }
        </style>
    `);

    // const exampleFiles = toTranspile.map( (src)=>{
    //     return `<p class="babel-ele">${src}</p>`;
    // });

    // const transpileInfo = willTranspile ? 
    //     `
    //     <p class="babel-ele babel-h"><em>Transpiled</em></p>                    
    //     <p class="babel-ele"><a class="babel-ele babel-link" target="_blank" href="${transpiledJsUrl}">${ transpiledJsUrl }</a></p>                
    //     <p class="babel-ele babel-h"><em>Files (${toTranspile.length})</em></p>
    //     ` :
    //     `
    //     <p class="babel-ele"><em>No need to transpile.</em></p>                    
    //     `

    // // Info
    // document( 'body' ).append( `
    //     <div class="babel-info-panel babel-ele">
    //         <p class="babel-ele babel-h">babel-plugin-three</p>
    //         ${transpileInfo}
    //         <div class="babel-class-container">
    //         ${ exampleFiles.join('') }
    //         </div>
    //     </div>
    // ` );

    // console.log( outputHtml );
    fs.writeFileSync( path.join( buildOutputPath, htmlPath ), document.html() );
    
    

})




