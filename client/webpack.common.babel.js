/** @type {import('webpack').Configuration} */

import { resolve } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const config = {
    entry: resolve(__dirname, './app/index.js'),
    output: {
        path: resolve(__dirname, './dist'),
        filename: 'app.js'
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/i,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
              }
        ]
    },
    plugins: [new HtmlWebpackPlugin({template: resolve(__dirname, './app/index.html')})]
};

export default config;