const { resolve } = require("path");

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const APP_ENTRY = resolve("src", "index.jsx");
const EMIT_DIR = resolve("dist");

const config = {
  entry: {
    app: APP_ENTRY,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        use: [{ loader: "babel-loader" }],
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
  ],
  output: {
    filename: "[name].[contenthash].js",
    path: EMIT_DIR,
    publicPath: "/",
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    proxy: {
      "/api": "http://localhost:3001",
      "/public": "http://localhost:3001",
    },
  },
};

module.exports = (_serve, options) => {
  if (options.mode === 'development') {
   config.devtool = 'eval-source-map';
  }
  return config;
}
