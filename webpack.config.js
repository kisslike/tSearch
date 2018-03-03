const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const outputPath = path.resolve('./dist/');

const config = {
  entry: {
    bg: './src/js/bg',
    popup: './src/js/popup',
    options: './src/js/options',
    sandbox: './src/js/sandbox',
  },
  output: {
    path: outputPath,
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              'transform-decorators-legacy'
            ],
            presets: [
              'react',
              ['env', {
                "targets": {
                  "browsers": ["Chrome >= 22"]
                }
              }]
            ]
          }
        }
      },
      {
        test: /\.(css|scss)$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "sass-loader"
        }]
      },
      {
        test: /\.(png|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new CleanWebpackPlugin(outputPath),
    new CopyWebpackPlugin([
      {from: './src/manifest.json',},
      {from: './src/icons', to: './icons'},
      {from: './src/trackers', to: './trackers'},
      {from: './src/_locales', to: './_locales'},
    ]),
    new HtmlWebpackPlugin({
      filename: 'popup.html',
      template: './src/popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      filename: 'options.html',
      template: './src/options.html',
      chunks: ['options']
    }),
    new HtmlWebpackPlugin({
      filename: 'sandbox.html',
      template: './src/sandbox.html',
      chunks: ['sandbox']
    }),
  ]
};

module.exports = config;