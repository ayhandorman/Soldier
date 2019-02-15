const path              = require('path');
const webpack           = require('webpack');
const htmlPlugin        = require('html-webpack-plugin');
const openBrowserPlugin = require('open-browser-webpack-plugin'); 
const dashboardPlugin   = require('webpack-dashboard/plugin');
const autoprefixer      = require('autoprefixer'); 

const PATHS = {
  app: path.join(__dirname, 'src'),
  images:path.join(__dirname,'assets/img/'),
  build: path.join(__dirname, 'dist')
};

const options = {
  host:'localhost',
  port:'3000'
};

module.exports = {
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.[hash].js'
  },
  devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      stats: 'errors-only',
      host: options.host,
      port: options.port 
    },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          presets: ['es2015'],
          plugins: ['transform-class-properties']
        }
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
        include:PATHS.app
      },
      
      {
        test: /\.(ico|jpg|png|gif)(\?.*)?$/,        
        loader: 'file',
        query: {
          name: '[path][name].[ext]'
        }
      },      
    ]
  },
  postcss: function() {
    return [
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9',
        ]
      }),
    ];
  },
  plugins:[
    new dashboardPlugin(),
    new webpack.HotModuleReplacementPlugin({
        multiStep: true
    }),
    new htmlPlugin({
      template:path.join(PATHS.app,'index.html'),
      inject:'body'
    }),
    new openBrowserPlugin({
      url: `http://${options.host}:${options.port}`
    })
  ]
};