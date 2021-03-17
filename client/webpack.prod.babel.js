/** @type {import('webpack').Configuration} */

import {merge} from 'webpack-merge';
import common from './webpack.common.babel';

const config = merge(common, {
    mode: 'production'
});

export default config;