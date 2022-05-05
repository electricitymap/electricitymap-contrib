const webpack = require('webpack');
const fs = require('fs');
const postcssPresetEnv = require('postcss-preset-env');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const { version } = require('./public/client-version.json');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  devtool: isProduction ? 'sourcemap' : 'eval',
  entry: {
    bundle: './src/index.jsx',
    styles: './src/scss/styles.scss',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
  },
  module: {
    rules: [
      // Extract css files
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /^node_modules$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { url: false } },
          { loader: 'postcss-loader', options: { postcssOptions: { plugins: [postcssPresetEnv] } } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: [/\.(js|jsx)$/],
        exclude: [/node_modules/],
        loader: 'babel-loader',
        options: {
          cacheDirectory: true, // cache results for subsequent builds
        },
      },
    ],
  },
  plugins: [
    new OptimizeCssAssetsPlugin(),
    new MiniCssExtractPlugin({
      filename: `[name].${  isProduction ? '[chunkhash]' : 'dev'  }.css`,
      chunkFilename: `[name].${  isProduction ? '[chunkhash]' : 'dev'  }.css`,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    function () {
      this.plugin('done', (stats) => {
        // Avoid dumping everything (~30mb)
        const output = {...stats.toJson({all: false, assets: true, groupAssetsByChunk: true})};
        fs.writeFileSync(
          `${__dirname}/public/dist/manifest.json`,
          JSON.stringify(output)
        );
      });
    },
    new webpack.DefinePlugin({
      ELECTRICITYMAP_PUBLIC_TOKEN: `"${process.env.ELECTRICITYMAP_PUBLIC_TOKEN || 'development'}"`,
      VERSION: JSON.stringify(version),
      'process.env': {
        NODE_ENV: JSON.stringify(isProduction ? 'production' : 'development'),
      },
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  output: {
    // filename affects styles.js and bundle.js
    filename: `[name].${isProduction ? '[chunkhash]' : 'dev'}.js`,
    // chunkFilename affects `vendor.js`
    chunkFilename: `[name].${isProduction ? '[chunkhash]' : 'dev'}.js`,
    path: `${__dirname}/public/dist`,
    pathinfo: false,
  },
  // The following is required because of https://github.com/webpack-contrib/css-loader/issues/447
  node: {
    fs: 'empty',
  },
};
