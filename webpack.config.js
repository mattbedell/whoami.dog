const { resolve } = require("path");

require("dotenv").config();
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const APP_ENTRY = resolve("src", "index.jsx");
const EMIT_DIR = resolve("dist");

const getConfig = (isDev = false) => ({
  entry: {
    app: APP_ENTRY,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: [isDev && require.resolve("react-refresh/babel")].filter(
                Boolean
              ),
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    new webpack.DefinePlugin({
      WAID_API: JSON.stringify(process.env.WAID_API),
    }),
    isDev && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  output: {
    filename: "[name].[contenthash].js",
    path: EMIT_DIR,
    publicPath: "/",
  },
  ...(isDev && {
    devServer: {
      historyApiFallback: true,
      hot: true,
      proxy: {
        "/api": "http://localhost:3001",
        "/public": "http://localhost:3001",
      },
    },
  }),
  ...(isDev && { devtool: "eval-source-map" }),
});

module.exports = (_serve, options) => getConfig(options.mode === "development");
