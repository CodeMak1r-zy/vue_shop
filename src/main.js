import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// 导入全局样式表
import './assets/css/global.css'
// 导入vue-table-with-tree-grid 依赖
import TreeTable from 'vue-table-with-tree-grid'

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截器 => interceptors 在页面发送请求前进行一次预处理
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 为请求头对象(headers)中添加token验证的自定义字段(Authorization)
  // 作用是为了让需要验证才能使用的API能够使用(请求头中携带了token值则可通过验证)
  // 在最后必须return config
  return config
})
// 为axios设置请求根路径
Vue.prototype.$axios = axios
// 为vue原型对象手动挂载了一个$axios函数
// 给所有组件注册了一个属性 $axios,所有组件都可以用 this.$axios 来使用axios(ajax异步请求);
Vue.config.productionTip = false

// 将 TreeTable 注册为全局可用的组件
// 可以在全局通过 <tree-table></tree-table> 去使用
Vue.component('tree-table', TreeTable)

Vue.use(ElementUI);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
