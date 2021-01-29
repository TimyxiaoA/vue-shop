<template>
	<div>
		<el-button type="info" @click="logout">退出</el-button>
	</div>
</template>

<script>
export default {
	name: 'Home',

	data() {
		return {}
	},

	methods: {
		logout() {
			//清除 token 跳转至登录页面
			window.sessionStorage.removeItem('token')
			this.$router.push('/login')
		}
	}
}
</script>

<style lang="less" scoped></style>
