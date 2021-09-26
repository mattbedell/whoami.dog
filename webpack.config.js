const { resolve } = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_ENTRY = resolve('src', 'index.jsx');
const EMIT_DIR = resolve('dist');

const config = {
  entry: {
    app: APP_ENTRY,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        use: [{ loader: 'babel-loader' }],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  output: {
    filename: '[name].[hash].js',
    path: EMIT_DIR,
    publicPath: '/',
  },
  devServer: {
    contentBase: EMIT_DIR,
    disableHostCheck: true,
    hot: true,
  },
};

module.exports = config;
