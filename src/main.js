import App from './App'
import Vue from 'vue'
import promise from 'es6-promise';
promise.polyfill();
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.config.productionTip = false
Vue.use(ElementUI,{size:'mini'})
// 添加IE兼容
import '@babel/polyfill';
new Vue({
  render: h => h(App),
}).$mount('#app')
