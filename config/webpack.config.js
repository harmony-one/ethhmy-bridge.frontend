const webpack = require('webpack');
const path = require('path');
const paths = require('./paths');
const getClientEnvironment = require('./env');

// variables
const srcDir = 'src';
const buildDir = 'build';
const isProduction = process.env.NODE_ENV !== 'development';
const sourcePath = path.join(__dirname, '..', `./${srcDir}`);
const outPath = path.join(__dirname, '..', `./${buildDir}`);
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const TerserPlugin = require('terser-webpack-plugin');

// plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TimingCompilationPlugin = require('./TimingCompilationPlugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// dev server proxy
const createDevServerConfig = require('./webpackDevServer.config');
const serverConfig = createDevServerConfig();

// rules
const codeRules = require('./rules/code');
const styleRules = require('./rules/styles');
const otherRules = require('./rules/other');

//PROD
const configProd = {
  app: [`${sourcePath}/index.tsx`],
  appFilename: 'static/js/app-[hash].js',
  vendorFilename: 'static/js/vendor-[contenthash].js',
  devtool: '',
  plugins: [
    new CleanWebpackPlugin(),
    // Minify the code.
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
    new CopyWebpackPlugin([{ from: 'public', to: '' }]),
  ],
  maxAssetSize: 10 * 1048576,
};

// DEV
const configDev = {
  app: ['react-dev-utils/webpackHotDevClient', `${sourcePath}/index.tsx`],
  appFilename: 'app-debug.js',
  vendorFilename: 'vendor-debug.js',
  // devtool: 'source-map',
  devtool: 'cheap-module-eval-source-map',
  cssUse: [],
  plugins: [new webpack.HotModuleReplacementPlugin()],
  maxAssetSize: 40 * 1048576,
};

console.log(`isProduction = ${isProduction}`);
const config = isProduction ? configProd : configDev;

module.exports = {
  // context: sourcePath,
  entry: config.app,
  output: {
    filename: config.appFilename,
    path: outPath,
    publicPath: '/',
  },
  devtool: config.devtool,
  resolve: {
    extensions: [
      '.mjs',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.web.js',
      '.js',
      '.json',
      '.web.jsx',
      '.jsx',
      '.css',
      'scss',
    ],
    // Fix webpack's default behavior to not load packages with jsnext:main module
    // (jsnext:main directs not usually distributable es6 format, but es6 sources)
    mainFields: ['module', 'browser', 'main'],
    alias: {
      src: `${sourcePath}/`,
      components: `${sourcePath}/components`,
      assets: `${sourcePath}/assets`,
      interfaces: `${sourcePath}/interfaces`,
      constants: `${sourcePath}/constants`,
      contexts: `${sourcePath}/contexts`,
      models: `${sourcePath}/models`,
      modalPages: `${sourcePath}/modalPages`,
      pages: `${sourcePath}/pages`,
      stores: `${sourcePath}/stores`,
      services: `${sourcePath}/services`,
      themes: `${sourcePath}/themes`,
      ui: `${sourcePath}/ui`,
      utils: `${sourcePath}/utils`,
    },
  },
  module: {
    rules: [...codeRules(), ...styleRules(), ...otherRules()],
  },
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({}),
      new TerserPlugin({
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          reuseExistingChunk: true,
          chunks: 'all',
          // filename: config.vendorFilename,
          priority: -10,
        },
      },
    },
  },
  performance: {
    hints: 'warning', // enum
    maxAssetSize: config.maxAssetSize, // int (in bytes),
    maxEntrypointSize: config.maxAssetSize, // int (in bytes)
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    },
  },
  devServer: serverConfig,
  plugins: (function() {
    let plugins = [];
    plugins.push(
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.appHtml,
      }),
      new webpack.ProvidePlugin({
        React: 'react',
        Promise: 'es6-promise', //add Promises for IE !!!
      }),
      new webpack.DefinePlugin(env.stringified),
      new TimingCompilationPlugin(),
      // new BundleAnalyzerPlugin()
    );
    if (config.plugins) {
      plugins = plugins.concat(config.plugins);
    }
    return plugins;
  })(),
};
