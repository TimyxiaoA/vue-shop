<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图区域 -->
		<el-card>
			<el-row :gutter="20">
				<el-col :span="8">
					<!-- 搜索与添加区域 -->
					<el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList"> <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button></el-input>
				</el-col>
				<el-col :span="4">
					<el-button type="primary" @click="goAddPage">添加商品</el-button>
				</el-col>
			</el-row>
			<!-- 表格区域 -->
			<el-table :data="goodsList" border stripe>
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column prop="goods_name" label="商品名称"> </el-table-column>
				<el-table-column prop="goods_price" label="商品价格(元)" width="95px"> </el-table-column>
				<el-table-column prop="goods_weight" label="商品重量" width="70px"> </el-table-column>
				<el-table-column label="创建时间" width="140px">
					<template slot-scope="scope">
						{{ scope.row.add_time | dateFormat }}
					</template>
				</el-table-column>
				<el-table-column label="操作" width="130px">
					<template slot-scope="scope">
						<el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页区域 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
			</el-pagination>
		</el-card>
	</div>
</template>

<script>
export default {
	name: 'List',

	data() {
		return {
			queryInfo: {
				query: '',
				pagenum: 1,
				pagesize: 10
			},
			// 所有商品列表
			goodsList: [],
			// 商品总数
			total: 0
		}
	},
	created() {
		this.getGoodsList()
	},

	methods: {
		// 获取所有商品列表
		async getGoodsList() {
			const { data: res } = await this.$http.get('goods', {
				params: this.queryInfo
			})
			console.log(res.data)
			this.goodsList = res.data.goods
			this.total = res.data.total
		},
		handleSizeChange(newSize) {
			this.queryInfo.pagesize = newSize
			this.getGoodsList()
		},
		handleCurrentChange(newPage) {
			this.queryInfo.pagenum = newPage
			this.getGoodsList()
		},
		//删除商品
		async removeById(id) {
			//询问框
			const confirmRes = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 如果用户确认删除, 则返回字符串 confirm 取消则返回 cancel
			if (confirmRes !== 'confirm') {
				return this.$message.info('已取消删除')
			}
			// 确认删除 发送请求
			const { data: res } = await this.$http.delete(`goods/${id}`)
			if (res.meta.status !== 200) return this.$message.error('删除商品失败')
			this.$message.success('删除商品成功')
			this.getGoodsList()
    },
    // 添加跳转到添加页面
    goAddPage(){
      this.$router.push('/goods/add')
    }
	}
}
</script>

<style lang="less" scoped></style>
