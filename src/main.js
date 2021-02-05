import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'

//导入字体图标
import './assets/fonts/iconfont.css'

//导入全局样式
import './assets/css/global.css'

// 导入axios 设置根路径
import axios from 'axios'
// import { config } from 'vue/types/umd'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//请求拦截器
axios.interceptors.request.use(config => {
	config.headers.Authorization = window.sessionStorage.getItem('token')
	return config
})
// 响应拦截器
axios.interceptors.response.use(res => {
	if (res.data.meta.msg === '无效的token' && res.data.meta.status === 400) {
		location.href = '/#/login'
	}
	return res
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

//全局注册组件
Vue.component('tree-table', TreeTable)

//创建过滤器将秒数过滤为年月日，时分秒
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + '').padStart(2, '0');
  const d = (dt.getDate() + '').padStart(2, '0');

  const hh = (dt.getHours() + '').padStart(2, '0');
  const mm = (dt.getMinutes() + '').padStart(2, '0');
  const ss = (dt.getSeconds() + '').padStart(2, '0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});
new Vue({
	router,
	render: h => h(App)
}).$mount('#app')
