<template>
	<div>
		<h3>商品分类</h3>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator="/">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 添加分类按钮区域 -->
			<el-row>
				<el-col>
					<el-button type="primary">添加分类</el-button>
				</el-col>
			</el-row>
			<!-- 分类表格  -->

			<!-- 分页 -->
		</el-card>
	</div>
</template>

<script>
export default {
	name: 'Cate',

	data() {
		return {
			// 商品分类数据列表
			cateList: [],
			//查询分类数据的条件
			queryInfo: {
				type: 3,
				pagenum: 1,
				pagesize: 5
			},
			//保存总数据条数
			total: 0
		}
	},
	created() {
		this.getCateList()
	},
	methods: {
		async getCateList() {
			//获取商品分类数据
			const { data: res } = await this.$http.get('categories', {
				params: this.queryInfo
			})

			if (res.meta.status !== 200) {
				return this.$message.error('获取商品列表数据失败')
			}
			//将数据列表赋值给cateList
			this.cateList = res.data.result
			//保存总数据条数
			this.total = res.data.total
			//   console.log(res.data);
		}
	}
}
</script>

<style lang="less" scoped></style>
