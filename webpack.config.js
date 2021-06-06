"use strict";
var path = require("path");
var webpack = require("webpack");
var config = require("config");

const devMode = process.env.NODE_ENV !== 'production';
//const devMode = false;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const WebpackPugManifestPlugin = require('./api/pug-manifest');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

var options = {

  mode: process.env.NODE_ENV || 'development',

  entry: {
    // Le coeur de l'application
    app: ["./app/src/main.js"],
    // Les librairies externes
    vendor: [
      "underscore",
      "jquery",
      "backbone",
      "backbone.marionette",
      "q",
    ]

  },

  output: {
    path: path.join(__dirname, "app/build"),
    filename: devMode ? "[name].bundle.js" : "[name].[hash].bundle.js",
    publicPath: "/",
  },

  resolve: {
    extensions: [
      ".js",
      ".json",
    ],
    modules: ["./app/src", "./app/src/libs", "node_modules"]
  },

  devtool: "eval",

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },

      {
        include: /\.pug/,
        loader: 'pug-html-loader'
      },

      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === 'development',
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },

      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name:'[name].[ext]',
              outputPath:'img/'
            },
          },
        ],
      },

    ],
  },

  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all'
    }
  },

  plugins: (
    [
      new CleanWebpackPlugin({
        verbose: true,
        cleanOnceBeforeBuildPatterns: ['*.gz', '**/*.gz', '*.js', '**/*.css' ],
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: devMode ? '/css/[name].css' : '/css/[name].[hash].css',
        chunkFilename: devMode ? '/css/[id].css' : '/css/[id].[hash].css',
      }),
      // On expose des proxy pour les dépendances des librairies
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        _: 'underscore',
        q: 'q',
        Backbone: 'backbone',
        Marionette: 'backbone.marionette',
      }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new CompressionPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        deleteOriginalAssets: true,
        test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
        minRatio: 0.8
      }),
      new WebpackPugManifestPlugin(),
    ]
  ),

}

module.exports = options;
