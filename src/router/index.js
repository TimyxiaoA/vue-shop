import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'
Vue.use(VueRouter)

const router = new VueRouter({
	routes: [
		{ path: '/', redirect: '/login' },
		{ path: '/login', component: Login },
		{
			path: '/home',
			component: Home,
			redirect: '/welcome',
			children: [
				{ path: '/welcome', component: Welcome },
				{ path: '/users', component: Users },
				{ path: '/rights', component: Rights },
				{ path: '/roles', component: Roles },
				{ path: '/categories', component: Cate },
				{ path: '/params', component: Params },
				{ path: '/goods', component: List },
				{ path: '/goods/add', component: Add },
				{ path: '/orders', component: Order },
				{ path: '/reports', component: Report }
			]
		}
	]
})

// 为路由设置路由导航守卫
router.beforeEach((to, from, next) => {
	// to 要访问的路由
	// from 从哪里来
	// next() 直接放行, next('/login') 强制跳转到此页面
	if (to.path === '/login') return next()
	const tokenStr = window.sessionStorage.getItem('token')
	// token 不存在就直接跳转到登录页面
	if (!tokenStr) return next('/login')
	//否则 token 存在那就直接放行  [这里后端应该提供一个效验 token 有效性的接口]
	next()
})

export default router
