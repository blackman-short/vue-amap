// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'
import './plugins/element.js'
import './plugins/vchart.js'
import './plugins/dialogAlert.js'

import './assets/css/index.css'
import 'element-ui/lib/theme-chalk/index.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min'

import IntroJs from 'intro.js'
import 'intro.js/introjs.css'
import 'intro.js/themes/introjs-flattener.css'

Vue.use(IntroJs)

Vue.config.productionTip = false

if (sessionStorage.getItem('funny')) {
  store.replaceState(Object.assign({}, JSON.parse(sessionStorage.getItem('funny'))))
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
