var debug = process.env.NODE_ENV !== "production";
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');

module.exports = [
    // Private css bundle
    {
        entry: [
            path.resolve(__dirname, '../assets/sass/main.scss'),
        ],
        module: {
            loaders: [
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract(
                        "style",
                        "css!sass"
                    )
                },
                {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    loaders: [
                        'file?hash=sha512&digest=hex&name=[hash].[ext]',
                        'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                    ]
                },
            ]   
        },
        output: {
            path: "./assets/css",
            filename: "extract-css.js"
        },
        plugins: [
            new ExtractTextPlugin("../css/main.css")]
    }
];