const path = require("path");
const dotenv = require('dotenv');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function initializeEnv() {
    const env = dotenv.config().parsed;

    const envKeys = Object.keys(env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(env[next]);
        return prev;
    }, {});

    return new webpack.DefinePlugin(envKeys);
}

module.exports = {
    devtool: 'eval-source-map',

    entry: {
        app: './src/modules/core/client/main.js'
    },

    resolve: {
        modules: [path.join(process.cwd(), 'app'), 'node_modules'],
        extensions: ['.js', '.css', '.scss'],
        symlinks: false
    },

    plugins: [
        new CleanWebpackPlugin({
            verbose: true
        }),
        initializeEnv()
    ],

    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: 'url-loader'
            }
        ]
    }
};
