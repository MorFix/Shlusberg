/** @type {import('webpack').Configuration} */

import {HotModuleReplacementPlugin} from 'webpack';
import {merge} from 'webpack-merge';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import common from './webpack.common.babel';

const config = merge(common, {
    mode: 'development',
    plugins: [new ReactRefreshPlugin(), new HotModuleReplacementPlugin()],
    devtool: 'source-map',
    devServer: {
        host: '0.0.0.0',
        hot: true,
        proxy: {
            '/response': {
                target: 'http://localhost'
            }
        }
    }
});

export default config;