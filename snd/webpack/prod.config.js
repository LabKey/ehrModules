/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
require("babel-polyfill");
const webpack = require("webpack");
const path = require("path");
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    context: path.resolve(__dirname, '..'),

    devtool: 'source-map',

    entry: {
        'app': [
            'babel-polyfill',
            './src/client/theme/style.js',
            './src/client/app.tsx'
        ]
    },

    output: {
        path: path.resolve(__dirname, '../resources/web/snd/gen/app/'),
        publicPath: './', // allows context path to resolve in both js/css
        filename: "[name].js"
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loaders: ['babel-loader', 'ts-loader']
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: [{
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    }],
                    fallback: 'style-loader'
                })
            },
            {
                test: /style.js/,
                loaders: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }]
            }
        ]
    },

    resolve: {
        extensions: [ '.jsx', '.js', '.tsx', '.ts' ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new ExtractTextPlugin({
            allChunks: true,
            filename: '[name].css'
        })
    ]
};
