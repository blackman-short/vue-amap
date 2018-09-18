// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueAMap from 'vue-amap'

Vue.use(VueAMap)
Vue.config.productionTip = false

// 初始化vue-amap
VueAMap.initAMapApiLoader({
  // 高德key
  key: 'e4d1ae99c2993eda5802a3685254928b',
  // 插件集合 （插件按需引入）
  plugin: ['AMap.Geolocation']
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
