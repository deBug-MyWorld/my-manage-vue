import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/styles/index.scss'
// 代码高亮
import VueHighlightJS from 'vue-highlightjs'
import 'highlight.js/styles/atom-one-dark.css'
// import './assets/global.css'  
import './permission'
import { hasPermission } from './utils/check'
Vue.use(VueHighlightJS)
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.prototype.hasPerm = hasPermission

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
