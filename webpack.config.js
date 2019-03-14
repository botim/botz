'use strict';

const path = require('path');
const { EnvironmentPlugin } = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const GoogleFontsPlugin = require('google-fonts-plugin');

const srcFolder = 'src';
const distFolder = 'dist';
const srcFileExtensions = ['.ts', '.js'];
const copyIgnoredFiles = ['*.ts', '*.js', '*.scss', '*.html'];

const apiUrls = {
  development: 'http://localhost:8080',
  production: 'https://botim-backend.herokuapp.com'
};

module.exports = (env, argv) => ({
  devtool: 'sourcemap',
  entry: {
    content: [`./${srcFolder}/content.ts`, `./${srcFolder}/styles/content.scss`],
    background: `./${srcFolder}/background.ts`
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
        use: 'html-loader'
      }
    ]
  },
  plugins: [
    new EnvironmentPlugin({
      API_URL: apiUrls[argv.mode]
    }),
    new CleanWebpackPlugin(distFolder),
    new CopyWebpackPlugin([
      {
        from: '**/*',
        context: srcFolder,
        ignore: copyIgnoredFiles
      },
      {
        from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
      }
    ]),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new GoogleFontsPlugin({
      fonts: [
        {
          family: 'Heebo',
          variants: ['400', '700'],
          subsets: ['hebrew']
        }
      ],
      formats: ['woff']
    })
  ],
  resolve: {
    extensions: srcFileExtensions
  }
});
