<template>
	<div>
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
			<!-- 分类表格
        :data(设置数据源) :columns(设置表格中列配置信息) :selection-type(是否有复选框)
        :expand-type(是否展开数据) show-index(是否设置索引列) index-text(设置索引列头)
        border(是否添加纵向边框) :show-row-hover(是否鼠标悬停高亮) -->
			<tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
				<!-- 是否有效 -->
				<template slot="isok" slot-scope="scope">
					<i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:#39ce39;"></i>
					<i class="el-icon-error" v-else style="color:red;"></i>
				</template>
				<!-- 排序 -->
				<template slot="order" slot-scope="scope">
					<el-tag effect="dark" size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
					<el-tag type="success" effect="dark" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
					<el-tag type="warning" effect="dark" size="mini" v-else>三级</el-tag>
				</template>
				<!-- 操作 -->
				<template slot="opt">
					<el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
					<el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
				</template>
			</tree-table>

			<!-- 分页 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
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
				pagenum: 1, //当前页码
				pagesize: 5 //当前页码每页展示几条数据
			},
			//保存总数据条数
			total: 0,
			columns: [
				{
					label: '分类名称',
					prop: 'cat_name'
				},
				{
					label: '是否有效',
					// 将当前列定义为模板列
					type: 'template',
					// 当前列使用的模板名称
					template: 'isok'
				},
				{
					label: '排序',
					type: 'template',
					template: 'order'
				},
				{
					label: '操作',
					type: 'template',
					template: 'opt'
				}
			]
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
			console.log(res)
			//将数据列表赋值给cateList
			this.cateList = res.data.result
			//保存总数据条数
			this.total = res.data.total
			//   console.log(res.data);
		},
		// 页面的size改变
		handleSizeChange(newSize) {
			this.queryInfo.pagesize = newSize
			// 刷新数据
			this.getCateList()
		},
		// 页面的页码改变
		handleCurrentChange(newPage) {
			this.queryInfo.pagenum = newPage
			// 刷新数据
			this.getCateList()
		}
	}
}
</script>

<style lang="less" scoped>
.zk-table {
	margin-top: 15px;
}
</style>
