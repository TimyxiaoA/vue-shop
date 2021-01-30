<template>
	<el-container class="home-container">
		<!-- 头部区域 -->
		<el-header>
			<div>
				<img src="../assets/heima.png" alt="" />
				<span>电商后台管理系统</span>
			</div>
			<el-button type="info" @click="logout">退出</el-button>
		</el-header>
		<!-- 页面主体区域 -->
		<el-container>
			<!-- 侧边栏 -->
			<el-aside :width="isCollapse ? '64px' : '200px'">
				<!-- 折叠栏 -->
				<div class="toggle-button" @click="toggleCollapse">|||</div>
				<!-- 菜单区域 -->
				<el-menu background-color="#373d41" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
					<!-- 一级菜单 -->
					<el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
						<!-- 一级菜单模板 -->
						<template slot="title">
							<!-- 图标 -->
							<i :class="iconsObj[item.id]"></i>
							<!-- 文本 -->
							<span>{{ item.authName }}</span>
						</template>
						<!-- 二级子菜单 -->
						<el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
							<!-- 二级菜单模板 -->
							<template slot="title">
								<!-- 图标 -->
								<i class="el-icon-menu"></i>
								<!-- 文本 -->
								<span>{{ subItem.authName }}</span>
							</template>
						</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-aside>
			<!-- 主体结构 -->
			<el-main>
				<router-view></router-view>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
import hub from '../utils/hub.js'
export default {
	name: 'Home',

	data() {
		return {
			menulist: [],
			iconsObj: {
				/* 125: 'iconfont icon-user',
				103: 'iconfont icon-tijikongjian',
				101: 'iconfont icon-shangpin',
				102: 'iconfont icon-danju',
				145: 'iconfont icon-baobiao' */
			},
			// 是否折叠
			isCollapse: false,
			// 被激活的链接地址
			activePath: ''
		}
	},

	methods: {
		logout() {
			//清除 token 跳转至登录页面
			window.sessionStorage.removeItem('token')
			this.$router.push('/login')
		},
		// 获取菜单列表
		async getMenulist() {
			const { data: res } = await this.$http.get('menus')
			console.log(res)
			if (res.meta.status !== 200) return this.$Message.error(res.meta.msg)
			this.menulist = res.data
			const arr = ['iconfont icon-user', 'iconfont icon-tijikongjian', 'iconfont icon-shangpin', 'iconfont icon-danju', 'iconfont icon-baobiao']
			res.data.forEach((item, index) => {
				this.iconsObj[item.id] = arr[index]
			})
		},
		// 点击按钮切换是否折叠
		toggleCollapse() {
			this.isCollapse = !this.isCollapse
		},
		saveNavState(path) {
			// 点击二级菜单时保存被点击的二级菜单信息
			window.sessionStorage.setItem('activePath', path)
			// 让当前的二级菜单高亮
			this.activePath = path
		}
	},
	created() {
		this.getMenulist()
		//重新获取当前匹配的 让其刷新时仍然高亮
		this.activePath = window.sessionStorage.getItem('activePath')
		// 定义一个事件监听，事件监听里面做 2 件事情，改变 activePath 和 本地的 sessionStorage
		hub.$on('saveNavState', this.saveNavState)
	},
	beforeDestroy(){
		//移除事件监听,防止监听多次
		hub.$off('saveNavState')
	}
}
</script>

<style lang="less" scoped>
.home-container {
	height: 100%;
}
.el-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #373d41;
	padding-left: 0;
	color: #fff;
	font-size: 20px;
	div {
		display: flex;
		align-items: center;
		span {
			margin-left: 15px;
		}
	}
}
.el-aside {
	background-color: #333744;
	.el-menu {
		border-right: none;
	}
}
.el-main {
	background-color: #eaedf1;
}
.iconfont {
	margin-right: 10px;
}
.toggle-button {
	background-color: #4a5064;
	font-size: 10px;
	line-height: 24px;
	text-align: center;
	letter-spacing: 0.2em;
	cursor: pointer;
}
</style>
