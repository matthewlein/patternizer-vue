const path = require('path');
const webpack = require('webpack');

const config = {
  context: path.resolve('./js'),
  entry: {
    frontend: './frontend',
  },
  output: {
    filename: './js/bundles/[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {},
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015'],
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
  ],
  watch: true,
  cache: true,
  devtool: 'source-map',
  resolve: {
    alias: {
      farbtastic: path.resolve(__dirname, './js/vendor/farbtastic.js'),
      patternizer: path.resolve(__dirname, './js/vendor/patternizer.js'),
      vue: 'vue/dist/vue.js',
    },
  },
};

module.exports = config;
