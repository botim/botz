'use strict';

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const srcFolder = 'src';
const distFolder = 'dist';
const srcFileExtensions = ['.ts', '.js'];
const copyIgnoredFiles = ['*.ts', '*.js', '*.scss', '*.html'];

module.exports = (env, argv) => ({
  devtool: 'sourcemap',
  entry: {
    content: [`./${srcFolder}/content.ts`, `./${srcFolder}/content.scss`]
  },
  output: {
    path: path.join(__dirname, distFolder),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.png$/i,
        use: 'url-loader'
      },
      {
        test: /\.html$/i,
        use: 'html-loader?exportAsEs6Default'
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
    ]),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ],
  resolve: {
    extensions: srcFileExtensions
  }
});
