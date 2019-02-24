'use strict';

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const srcFolder = 'src';
const distFolder = 'dist';
const srcFileExtensions = ['.ts', '.js'];
const copyIgnoredFiles = ['*.ts', '*.js'];

module.exports = (env, argv) => ({
  devtool: 'sourcemap',
  entry: {
    content: `./${srcFolder}/content.ts`
  },
  output: {
    path: path.join(__dirname, distFolder),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.png$/i,
        use: 'url-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(distFolder),
    new CopyWebpackPlugin([
      {
        from: '**/*',
        context: srcFolder,
        ignore: copyIgnoredFiles
      }
    ])
  ],
  resolve: {
    extensions: srcFileExtensions
  }
});
