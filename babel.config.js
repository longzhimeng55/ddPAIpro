const plugins = [
  [
      "component",
      {
          "libraryName": "element-ui",
          "styleLibraryName": "theme-chalk"
      }
  ]
];
if (['production', 'prod'].includes(process.env.NODE_ENV)) {
  plugins.push("transform-remove-console")
}
module.exports = {
  presets: [[
    '@vue/app',
    {
      useBuiltIns: "entry",
      polyfills: [
              //promisepolyfillalonedoesn'tworkinIE,
              //needsthisaswell.see:#1642
              'es6.array.iterator',
              //thisisrequiredforwebpackcodesplitting,vuexetc.
              'es6.promise',
              //#2012es6.promisereplacesnativePromiseinFFandcausesmissingfinally
              'es7.promise.finally',
              'es6.symbol'
          ]
          //polyfills: ['es6.promise', 'es6.array.find-index', 'es7.array.includes', 'es6.string.includes']
          //项目中用到的polyfill
       }
  ]],
  plugins: plugins
}
