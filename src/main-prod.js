// 项目发布阶段的打包入口文件main-prod(production).js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
// 导入全局样式表
import './assets/css/global.css'
// 导入vue-table-with-tree-grid 依赖
import TreeTable from 'vue-table-with-tree-grid'

// 导入 vue-quill-editor 依赖(导入富文本编辑器)
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入进度条NProgress包对应的js和css
import NProgress from 'nprogress'


import axios from 'axios'
// 为axios设置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截器 => interceptors 在页面发送请求前进行一次预处理
// 在request请求拦截器中，展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在发起axios请求前自动进行预处理，追加一个token，以便于访问需要权限的页面
  // 为请求头对象(headers)中添加token验证的自定义字段(Authorization)
  // 作用是为了让需要验证才能使用的API能够使用(请求头中携带了token值则可通过验证)
  // 在最后必须return config
  return config
})
// 在response响应拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

// 为vue原型对象手动挂载了一个$axios函数
// 给所有组件注册了一个属性 $axios,所有组件都可以用 this.$axios 来使用axios(ajax异步请求);
Vue.prototype.$axios = axios
Vue.config.productionTip = false

// 将 TreeTable 注册为全局可用的组件
// 可以在全局通过 <tree-table></tree-table> 去使用
Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)


// Vue.js 允许你自定义过滤器，可被用于一些常见的文本格式化。
// Vue.filter用来定义过滤器，这里定义了一个格式化时间的过滤器
// 因为这是在main.js中，所以这个时间过滤器是全局可用的，也可以在组件中定义本地过滤器
// 时间戳*1000 => 秒变成毫秒,再进行过滤
// (dt.getSeconds() + '')指的是将dt.getSeconds()变成字符串
// padStart(a, 'b')字符串方法:不足a位数，前面加'b'来填充
// 这里的padStart(2, '0')指的是，不足2位，前面加0，比如：02月03日04时05分06秒
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal * 1000)
  const year = dt.getFullYear()
  const month = (dt.getMonth() + 1 + '').padStart(2, '0')
  const date = (dt.getDate() + '').padStart(2, '0')

  const hour = (dt.getHours() + '').padStart(2, '0')
  const minute = (dt.getMinutes() + '').padStart(2, '0')
  const second = (dt.getSeconds() + '').padStart(2, '0')

  return `${year}-${month}-${date} ${hour}:${minute}:${second}`
})

// Vue.use(ElementUI);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
