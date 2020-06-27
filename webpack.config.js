const path = require('path');

const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const pkg = require('./package.json');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: '/',
    sourcePrefix: '',
  },
  amd: {
    // Enable webpack-friendly use of require in Cesium
    toUrlUndefined: true,
  },
  node: {
    // Resolve node module use of fs
    fs: 'empty',
  },
  devServer: {
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      cesium$: 'cesium/Cesium',
      cesium: 'cesium/Source',
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        resolve: {
          extensions: ['.js', '.jsx'],
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader'],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
        exclude: /node_modules/,
        use: ['url-loader'],
      },
      {
        test: /\.(glb|czml|obj|png)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new Dotenv({
      defaults: true,
    }),
    new HtmlWebPackPlugin({
      template: './src/public/index.html',
      filename: './index.html',
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(cesiumSource, cesiumWorkers),
        to: 'Workers',
      },
      {
        from: path.join(cesiumSource, 'Assets'),
        to: 'Assets',
      },
      {
        from: path.join(cesiumSource, 'Widgets'),
        to: 'Widgets',
      },
    ]),
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify('/'),
      'process.env.VERSION': JSON.stringify(pkg.version),
    }),
  ],
};
