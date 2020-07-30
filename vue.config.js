const path = require('path')
const resolve = (dir) => path.join(__dirname, dir);
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const zopfli = require("@gfx/zopfli");
const BrotliPlugin = require("brotli-webpack-plugin");
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);
const Version = new Date().getTime(); //当前时间为了防止打包缓存不刷新，所以给每个js文件都加一个时间戳
const port = 9528 // dev port
module.exports = {
  //基本路径
  //baseUrl: './',//vue-cli3.3以下版本使用
  publicPath: './', //vue-cli3.3+新版本使用 默认'/'，部署应用包时的基本 URL
  outputDir: 'dist', // 'dist', 生产环境构建文件的目录
  assetsDir: 'static', // 相对于outputDir的静态资源(js、css、img、fonts)目录
  lintOnSave: false, // eslint-loader 是否在保存的时候检查
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false, // 生产环境是否生成 sourceMap 文件
  css: {
    //extract: true, // 是否使用css分离插件 ExtractTextPlugin
    sourceMap: false, // 开启 CSS source maps
    loaderOptions: {}, // css预设器配置项
    modules: false // 启用 CSS modules for all css / pre-processor files.
  },
  parallel: require('os').cpus().length > 1, //是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建，在适当的时候开启几个子进程去并发的执行压缩
  pwa: {},
  // 修复HMR(热更新)失效
  chainWebpack: config => {
    // 修复HMR
    config.resolve.symlinks(true);
    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'));
    // 打包分析
    if (process.env.IS_ANALYZ) {
      config.plugin('webpack-report')
        .use(BundleAnalyzerPlugin, [{
          analyzerMode: 'static',
        }]);
    }
    // 修改prefetch：
    config.plugin('prefetch').tap(options => {
      options[0].fileBlacklist = options[0].fileBlacklist || []
      options[0].fileBlacklist.push(/myasyncRoute(.)+?\.js$/)
      return options
    })
  },
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: null
  },
  // 运行时(runtime)再去从外部获取这些扩展依赖
  configureWebpack: config => {
    config.externals = {
      'vue': 'Vue',
      'element-ui': 'ELEMENT',
      'vue-router': 'VueRouter',
      'vuex': 'Vuex',
      'axios': 'axios'
    },
      config.output = {
        filename: `[name].${Version}.js`,
        chunkFilename: `[name]${Version}.js`
      }
  },
  // 比gzip体验更好的Zopfli压缩
  configureWebpack: config => {
    if (IS_PROD) {
      const plugins = [];
      plugins.push(
        new CompressionWebpackPlugin({
          algorithm(input, compressionOptions, callback) {
            return zopfli.gzip(input, compressionOptions, callback);
          },
          compressionOptions: {
            numiterations: 15
          },
          minRatio: 0.99,
          test: productionGzipExtensions
        })
      );
      plugins.push(
        new BrotliPlugin({
          test: productionGzipExtensions,
          minRatio: 0.99
        })
      );
      config.plugins = [
        ...config.plugins,
        ...plugins
      ];
    }
  },
  // 第三方插件配置
  pluginOptions: {
    // ...
}
  // configureWebpack: {

  //   // provide the app's title in webpack's name field, so that
  //   // it can be accessed in index.html to inject the correct title.
  //   // name: name,
  //   resolve: {
  //     alias: {
  //       '@': resolve('src')
  //     }
  //   },
  //   output: {
  //     libraryExport: 'default'
  //   }
  //   // externals: {
  //   //   'vue': 'Vue',
  //   //   'element-ui': 'ELEMENT',
  //   // },
  // },
  // chainWebpack(config) {
  //   config.plugins.delete('preload') // TODO: need test
  //   config.plugins.delete('prefetch') // TODO: need test
  //   // config
  //   //   // 插件名 
  //   //   .plugin('extract-css')
  //   //   // 修改规则
  //   //   .tap(args => {
  //   //     args[0].filename = 'css/styles.css'
  //   //     args[0].chunkFilename = 'css/[name].css'
  //   //     return args
  //   //   })
  //   // set svg-sprite-loader
  //   config.module
  //     .rule('svg')
  //     .exclude.add(resolve('src/icons'))
  //     .end()
  //   config.module
  //     .rule('icons')
  //     .test(/\.svg$/)
  //     .include.add(resolve('src/icons'))
  //     .end()
  //     .use('svg-sprite-loader')
  //     .loader('svg-sprite-loader')
  //     .options({
  //       symbolId: 'icon-[name]'
  //     })
  //     .end()
  //   // set preserveWhitespace
  //   config.module
  //     .rule('vue')
  //     .use('vue-loader')
  //     .loader('vue-loader')
  //     .tap(options => {
  //       options.compilerOptions.preserveWhitespace = true
  //       return options
  //     })
  //     .end()

  //   config
  //     // https://webpack.js.org/configuration/devtool/#development
  //     .when(process.env.NODE_ENV === 'development',
  //       config => config.devtool('cheap-source-map')
  //     )

  //   // config
  //   //   .when(process.env.NODE_ENV !== 'development',
  //   //     config => {
  //   //       config
  //   //         .plugin('ScriptExtHtmlWebpackPlugin')
  //   //         .after('html')
  //   //         .use('script-ext-html-webpack-plugin', [{
  //   //           // `runtime` must same as runtimeChunk name. default is `runtime`
  //   //           inline: /runtime\..*\.js$/
  //   //         }])
  //   //         .end()
  //   //       config
  //   //         .optimization.splitChunks({
  //   //           chunks: 'all',
  //   //           cacheGroups: {
  //   //             libs: {
  //   //               name: 'chunk-libs',
  //   //               test: /[\\/]node_modules[\\/]/,
  //   //               priority: 10,
  //   //               chunks: 'initial' // only package third parties that are initially dependent
  //   //             },
  //   //             elementUI: {
  //   //               name: 'chunk-elementUI', // split elementUI into a single package
  //   //               priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
  //   //               test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
  //   //             },
  //   //             commons: {
  //   //               name: 'chunk-commons',
  //   //               test: resolve('src/components'), // can customize your rules
  //   //               minChunks: 3, //  minimum common number
  //   //               priority: 5,
  //   //               reuseExistingChunk: true
  //   //             }
  //   //           }
  //   //         })
  //   //       config.optimization.runtimeChunk('single')
  //   //     }
  //   //   )
  // }
}
