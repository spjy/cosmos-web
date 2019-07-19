const path = require('path');

const neutrino = require('neutrino');
const react = require('@neutrinojs/react');
const airbnb = require('@neutrinojs/airbnb');
const jest = require('@neutrinojs/jest');
const devServer = require('@neutrinojs/dev-server');
const styles = require('@neutrinojs/style-loader');

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  options: {
    root: __dirname,
  },
  use: [
    airbnb(),
    react({
      html: {
        title: 'COSMOS Web',
      }
    }),
    jest(),
    devServer({
      disableHostCheck: true
    }),
    (neutrino) => {
      neutrino.config.module
        .rule('file-loader')
          .test(/\.(glb)$/)
          .use('file-loader')
            .loader('file-loader')

      neutrino.config
        .plugin('Dotenv')
        .use(Dotenv, [{
          defaults: true
        }])
        .end()
          .plugin('CopyWebpackPlugin')
          .use(CopyWebpackPlugin, [[
            {
              from: "node_modules/cesium/Build/Cesium",
              to: "cesium",
            },
          ]])
          .end()
            .plugin('HtmlWebpackPlugin')
            .use(HtmlWebpackPlugin, [{
              template: './src/public/index.html'
            }])
            .end()
              .plugin('HtmlWebpackTagsPlugin')
              .use(HtmlWebpackTagsPlugin, [{
                append: false,
                tags: ["cesium/Widgets/widgets.css", "cesium/Cesium.js"],
              }])
              .end()
                .plugin('DefinePlugin')
                .use(webpack.DefinePlugin, [{
                  CESIUM_BASE_URL: JSON.stringify("/cesium"),
                }])
                .end()

      neutrino.config
        .externals({
          cesium: 'Cesium'
        });
    },
  ]
};
