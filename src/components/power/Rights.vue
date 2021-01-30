<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>权限列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card>
			123
		</el-card>
	</div>
</template>

<script>
export default {
	name: 'Rights',

	data() {
		return {
			rightsList: []
		}
	},
	created() {
		this.getRightsList()
	},
	methods: {
		async getRightsList() {
			const { data: res } = await this.$http.get('right/list')
			if (res.meta.status !== 200) return false
			//获取数据并赋值
			this.rightsList = res.data
		}
	}
}
</script>

<style lang="less" scoped></style>
