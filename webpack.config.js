const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const path = require('path');

module.exports = {

    mode: 'development',

    entry: {
        effectscomposer: path.join( __dirname, '/src/effects-composer.js' )
    },

    devtool: 'inline-source-map',
    devServer: {

    },

    output: {
        filename: '[name].bundle.js',
        path: path.join( __dirname, 'build' )
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'three-examples-cli / effect-composer'
        })
    ],    

    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [ '@babel/preset-env', { loose: false } ]
                        ],
                        plugins: [                                                        
                        ]
                    }
                }
            }
        ],
    }    
};