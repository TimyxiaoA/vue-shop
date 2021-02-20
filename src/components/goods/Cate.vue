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
					<el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
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
				<template slot="opt" slot-scope="scope">
					<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
					<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)">删除</el-button>
				</template>
			</tree-table>

			<!-- 分页 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
		</el-card>

		<!-- 添加分类对话框 -->
		<el-dialog title="添加商品分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
			<el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="100px">
				<el-form-item label="分类名称" prop="cat_name">
					<el-input v-model="addCateForm.cat_name"></el-input>
				</el-form-item>
				<el-form-item label="父级分类：">
					<!-- options: 指定数据源 -->
					<!-- props: 用来指定配置对象 -->
					<!-- change-on-select: 允许选择任意一级分类 -->
					<el-cascader :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable> </el-cascader>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addCateDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addCate">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 编辑分类对话框 -->
		<el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
			<el-form :model="editCateForm" :rules="editCateRules" ref="editCateRef" label-width="100px">
				<el-form-item label="分类名称" prop="cat_name">
					<el-input v-model="editCateForm.cat_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editCateDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editCate">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: 'Cate',

	data() {
		return {
			// 商品分类数据列表,默认为空
			cateList: [],
			//查询分类数据的条件
			queryInfo: {
				type: 3,
				pagenum: 1, //当前页码
				pagesize: 5 //当前页码每页展示几条数据
			},
			//保存总数据条数
			total: 0,
			// 为 table 指定列的定义
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
			],

			// 添加分类数据区域
			addCateDialogVisible: false,
			// 添加分类的表单数据对象
			addCateForm: {
				// 分类名称
				cat_name: '',
				// 父级分类的 ID
				cat_pid: 0,
				// 分类的等级，默认要添加的是 1 级分类
				cat_level: 0
			},
			addCateRules: {
				cat_name: [
					{ required: true, message: '分类名称不能为空', trigger: 'blur' },
					{ min: 1, max: 8, message: '分类名称长度在1~8个字符', trigger: 'blur' }
				]
			},
			// 父级分类的列表
			parentCateList: [],
			// 指定级联选择器的配置对象
			cascaderProps: {
				value: 'cat_id',
				label: 'cat_name',
				children: 'children',
				expandTrigger: 'hover',
				checkStrictly: true
			},
			// 选中的父级分类的 Id 数组
			selectedKeys: [],

			// 编辑分类数据区域
			editCateDialogVisible: false,
			editCateForm: {},
			// 编辑表单的效验规则
			editCateRules: {
				cat_name: [
					{ required: true, message: '分类名称不能为空', trigger: 'blur' },
					{ min: 1, max: 8, message: '分类名称长度在1~8个字符', trigger: 'blur' }
				]
			}
		}
	},
	created() {
		this.getCateList()
	},
	methods: {
		// 获取所有商品分类列表
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
		},
		// 监听页面的size改变
		handleSizeChange(newSize) {
			this.queryInfo.pagesize = newSize
			// 刷新数据
			this.getCateList()
		},
		// 监听页面的页码改变
		handleCurrentChange(newPage) {
			this.queryInfo.pagenum = newPage
			// 刷新数据
			this.getCateList()
		},
		// 显示添加分类对话框
		showAddCateDialog() {
			// 获取父级分类的数据
			this.getParentCateList()
			this.addCateDialogVisible = true
		},
		// 获取父级分类的列表
		async getParentCateList() {
			const { data: res } = await this.$http.get('categories', {
				params: {
					type: 2 // 获取前两级的所有分类
				}
			})
			if (res.meta.status !== 200) {
				return this.$message.error('获取父级分类数据失败')
			}
			// 存一下
			this.parentCateList = res.data
		},
		// 级联选择项发生变化会触发的函数
		parentCateChanged() {
			console.log(this.selectedKeys)
			//判断 selectKeys 数组的长度是否为0来确认添加的是否为一级分类
			const arr = this.selectedKeys
			if (arr.length > 0) {
				// 父级分类的 ID
				this.addCateForm.cat_pid = arr[arr.length - 1]
				// 分类的等级
				this.addCateForm.cat_level = arr.length
			} else {
				this.addCateForm.cat_pid = 0
				this.addCateForm.cat_level = 0
			}
		},

		// 点击确认按钮添加分类
		async addCate() {
			this.$refs.addCateRef.validate(async valid => {
				if (!valid) return false
				const { data: res } = await this.$http.post('categories', this.addCateForm)
				if (res.meta.status !== 201) return this.$message.error('添加分类失败')
				this.$message.success('添加分类成功')
				this.getCateList()
				this.addCateDialogVisible = false
			})
		},
		// 关闭对话框并重置数据
		addCateDialogClosed() {
			this.addCateForm.cat_name = ''
			this.addCateForm.cat_pid = 0
			this.addCateForm.cat_level = 0
			this.selectedKeys = []
		},

		// 显示编辑修改对话框
		async showEditCateDialog(id) {
			const { data: res } = await this.$http.get(`categories/${id}`)
			if (res.meta.status !== 200) return this.$message.error('获取分类失败')
			this.editCateForm = res.data
			this.editCateDialogVisible = true
		},
		// 关闭编辑对话框
		editCateDialogClosed() {
			this.$refs.editCateRef.resetFields()
		},
		// 点击确认修改分类
		async editCate() {
			const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
			if (res.meta.status !== 200) return this.$message.error('修改分类失败')
			this.$message.success('修改分类成功')
			this.getCateList()
			this.editCateDialogVisible = false
		},
		// 删除分类
		async removeCate(id) {
			//询问框
			const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 如果用户确认删除, 则返回字符串 confirm 取消则返回 cancel
			if (confirmRes !== 'confirm') {
				return this.$message.info('已取消删除')
			}
			// 确认删除 发送请求
			const { data: res } = await this.$http.delete(`categories/${id}`)
			if (res.meta.status !== 200) return this.$message.error('删除分类失败')
			this.$message.success('删除分类成功')
			this.getCateList()
		}
	}
}
</script>

<style lang="less" scoped>
.zk-table {
	margin-top: 15px;
}
.el-cascader {
	width: 100%;
}
</style>
