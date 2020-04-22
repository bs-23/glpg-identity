const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {
    devtool: "eval-source-map",

    entry: {
        app: "./app/main.js"
    },

    resolve: {
        modules: [path.join(process.cwd(), "app"), "node_modules"],
        extensions: [".js", ".css", ".scss"],
        symlinks: false
    },

    plugins: [
        new CleanWebpackPlugin({
            verbose: true
        }),

        new LodashModuleReplacementPlugin({
            shorthands: true,
            currying: true,
            collections: true
        })
    ],

    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    plugins: ["react-html-attrs", "@babel/plugin-proposal-object-rest-spread"],
                    presets: [["@babel/preset-env", { targets: {"node": "current"} }], "@babel/preset-react" ]
                }
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.(png|ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: "url-loader"
            }
        ]
    }
};
