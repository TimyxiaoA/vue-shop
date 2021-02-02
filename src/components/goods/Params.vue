<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator="/">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>参数列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 警告区域 -->
			<el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon> </el-alert>

			<!-- 选择商品分类区域 -->
			<el-row>
				<el-col class="cat_opt">
					<span>选择商品分类：</span>
					<!-- 级联选择框 -->
					<el-cascader :options="cateList" :props="cateProps" v-model="selectedCateKeys" @change="handleChange"> </el-cascader>
				</el-col>
			</el-row>

			<!-- tab 页签区域 -->
			<el-tabs v-model="activeName" @tab-click="handleTabClick">
				<!--// *动态参数区域 -->
				<el-tab-pane label="动态参数" name="many">
					<el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible = true">添加参数</el-button>
					<!-- 表格区域 -->
					<el-table :data="manyTableData" border stripe>
						<!-- 展开项 -->
						<el-table-column type="expand">
							<template slot-scope="scope">
								<!-- 循环渲染Tag标签 -->
								<el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index, scope.row)">{{ item }}</el-tag>
								<!-- 输入的文本框 -->
								<el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"> </el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<!-- 索引项 -->
						<el-table-column type="index"></el-table-column>
						<el-table-column prop="attr_name" label="参数名称"></el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
								<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>

				<!-- 静态属性区域 -->
				<el-tab-pane label="静态属性" name="only">
					<el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible = true">添加属性</el-button>
					<!-- 表格区域 -->
					<el-table :data="onlyTableData" border stripe>
						<!-- 展开项 -->
							<el-table-column type="expand">
							<template slot-scope="scope">
								<!-- 循环渲染Tag标签 -->
								<el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index, scope.row)">{{ item }}</el-tag>
								<!-- 输入的文本框 -->
								<el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"> </el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<!-- 索引项 -->
						<el-table-column type="index"></el-table-column>
						<el-table-column prop="attr_name" label="属性名称"></el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
								<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
			</el-tabs>
		</el-card>

		<!-- 添加参数/属性的对话框 -->
		<el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
			<el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
				<el-form-item :label="titleText" prop="attr_name">
					<el-input v-model="addForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="addParams">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 修改参数/属性的对话框 -->
		<el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
			<el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
				<el-form-item :label="titleText" prop="attr_name">
					<el-input v-model="editForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="editParams">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: 'Params',

	data() {
		return {
			//所有商品分类列表
			cateList: [],
			//级联选中框配置对象
			cateProps: {
				value: 'cat_id',
				label: 'cat_name',
				children: 'children',
				expandTrigger: 'hover'
			},
			// 级联选择框选中的数组集合
			selectedCateKeys: [],
			// 被激活的页签的名称
			activeName: 'many',
			// 动态参数的数据
			manyTableData: [],
			// 静态属性的数据
			onlyTableData: [],

			//添加参数/属性对话框的数据区域
			addDialogVisible: false,
			addForm: {},
			addFormRules: {
				attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
			},
			//修改参数/属性对话框的数据区域
			editDialogVisible: false,
			editForm: {},
			editFormRules: {
				attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
			}
		}
	},
	created() {
		this.getCateList()
	},
	methods: {
		// *获取所有商品列表
		async getCateList() {
			const { data: res } = await this.$http.get('categories')
			if (res.meta.status !== 200) return this.$Message.error('获取商品列表数据失败')
			this.cateList = res.data
		},
		// 级联选择框选中项变化触发事件
		handleChange() {
			this.getParamsData()
		},
		// tab 页签选中项变化触发
		handleTabClick() {
			this.getParamsData()
		},

		// *获取所有参数的列表数据
		async getParamsData() {
			//如果不是3级分类
			if (this.selectedCateKeys.length !== 3) {
				this.selectedCateKeys = [] // 让他选不上 并将表格内容清空
				this.manyTableData = []
				this.onlyTableData = []
				return this.$Message.error('只允许为三级分类设置参数!')
			}
			// 如果是三级分类,则根据所选分类的 ID，和当前所处的面板，获取对应的参数
			const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
				params: {
					sel: this.activeName
				}
			})
			if (res.meta.status !== 200) {
				return this.$Message.error('获取参数列表失败')
			}
			// !对 res.data 中的 attr_vals 进行加工
			res.data.forEach(item => {
				item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
				// ! 对 res.data中的数据加工 使每个文本框的值各自独立
				// 控制文本输入框和按钮切换的变量 默认为输入框隐藏
				item.inputVisible = false
				// 文本输入框的默认内容
				item.inputValue = ''
			})
			// console.log(res)
			// 根据tab选项的名字获取不同的数据并赋值
			if (this.activeName === 'many') {
				this.manyTableData = res.data
			} else {
				this.onlyTableData = res.data
			}
		},

		// 关闭添加对话框事件
		addDialogClosed() {
			this.$refs.addFormRef.resetFields()
		},
		// *点击按钮 添加参数
		async addParams() {
			const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
				attr_name: this.addForm.attr_name,
				attr_sel: this.activeName
			})
			if (res.meta.status !== 201) return this.$Message.error('添加参数失败')

			this.$Message.success('添加参数成功')
			this.getParamsData()
			this.addDialogVisible = false
		},

		// *点击修改弹出对话框 根据id获取查询参数 获取修改表单的数据
		async showEditDialog(attrId) {
			const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
				params: {
					attr_sel: this.activeName
				}
			})
			if (res.meta.status !== 200) return this.$Message.error('获取参数失败')
			// console.log(res)
			this.editForm = res.data
			this.editDialogVisible = true
		},
		// 关闭修改框触发事件
		editDialogClosed() {
			this.$refs.editFormRef.resetFields()
		},

		// *点击确定 修改参数事件
		editParams() {
			this.$refs.editFormRef.validate(async valid => {
				if (!valid) return false
				const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
					attr_name: this.editForm.attr_name,
					attr_sel: this.editForm.attr_sel,
					attr_vals: this.editForm.attr_vals //!把之前的带上,防止把之前的清空
				})
				console.log(res)
				if (res.meta.status !== 200) return this.$Message.error('修改参数失败')
				this.$Message.success('修改参数成功')
				this.getParamsData()
				this.editDialogVisible = false
			})
		},

		// *根据 id 删除参数
		async removeParams(attrId) {
			//询问框
			const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 如果用户确认删除, 则返回字符串 confirm 取消则返回 cancel
			if (confirmRes !== 'confirm') {
				return this.$Message.info('已取消删除')
			}
			// 确认删除 发送请求
			const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
			if (res.meta.status !== 200) return this.$Message.error('删除参数失败')
			this.$Message.success('删除参数成功')
			this.getParamsData()
		},

		// 按下 enter 或 输入内容触发
		async handleInputConfirm(row) {
			// 添加内容为空 直接恢复
			if (row.inputValue.trim().length === 0) {
				row.inputValue = ''
				row.inputVisible = false
				return false
			}

			// 如果有内容则添加标签并发起请求保存数据
			row.attr_vals.push(row.inputValue.trim())
			row.inputValue = ''
			row.inputVisible = false
			// 保存数据到后台接口中
			this.saveAttrVals(row)
		},

		//! 将对 attr_vals 的操作，保存到数据库
		async saveAttrVals(row) {
			const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
				attr_name: row.attr_name,
				attr_sel: row.attr_sel,
				attr_vals: row.attr_vals.join(' ')
			})
			if (res.meta.status !== 200) return this.$Message.error('修改参数失败')
			this.$Message.success('修改参数成功')
		},
		// 点击按钮显示输入文本框
		showInput(row) {
			row.inputVisible = true
			// ! $nextTick 方法的作用,就是视图被重新渲染之后,才会执行函数中的代码
			this.$nextTick(() => {
				// 让文本框自动获取焦点
				this.$refs.saveTagInput.$refs.input.focus()
			})
		},

		// 点击tag标签后的删除  删除对应的参数
		handleClose(i, row) {
			row.attr_vals.splice(i, 1)
			// 保存到后台接口中
			this.saveAttrVals(row)
		}
	},
	computed: {
		// 如果按钮需要被禁用，则返回 true，否则返回 false
		isBtnDisable() {
			return this.selectedCateKeys.length !== 3
		},
		// 当前选中的 3 级分类的 ID
		cateId() {
			if (this.selectedCateKeys.length === 3) {
				return this.selectedCateKeys[2]
			}
			return null
		},
		// 文本内容
		titleText() {
			return this.activeName === 'many' ? '动态参数' : '静态属性'
		}
	}
}
</script>

<style lang="less" scoped>
.cat_opt {
	margin: 15px 0;
}
.el-tag {
	margin: 0 10px;
}
.input-new-tag {
	width: 120px;
}
</style>
