<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!-- 卡片视图区域 -->
		<el-card>
			<el-row>
				<el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
			</el-row>

			<!-- 角色列表区域 -->
			<el-table :data="roleList" row-key="id" border stripe>
				<!-- 展开行 -->
				<el-table-column type="expand">
					<template slot-scope="scope">
						<el-row :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
							<!-- 一级渲染区域 -->
							<el-col :span="5">
								<el-tag @close="removeRightById(scope.row, item1.id)" closable>{{ item1.authName }}</el-tag>
								<i class="el-icon-caret-right"></i>
								<!-- <pre>{{ scope.row.children }}</pre> -->
							</el-col>
							<!-- 二级,三级渲染区域 -->
							<el-col :span="19">
								<!-- 渲染二级权限 -->
								<el-row :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, index2) in item1.children" :key="item2.id">
									<el-col :span="6">
										<el-tag @close="removeRightById(scope.row, item2.id)" closable type="success">{{ item2.authName }}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>

									<el-col :span="18">
										<!-- 渲染三级权限 -->
										<el-tag @close="removeRightById(scope.row, item3.id)" closable type="warning" v-for="item3 in item2.children" :key="item3.id">{{ item3.authName }}</el-tag>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
					</template>
				</el-table-column>
				<!-- 索引行 -->
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column prop="roleName" label="角色名称"></el-table-column>
				<el-table-column prop="roleDesc" label="角色描述"></el-table-column>
				<el-table-column label="操作" width="300px">
					<template slot-scope="scope">
						<!-- 修改按钮 -->
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
						<!-- 分配角色按钮 -->
						<el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>

			<!-- 添加角色的弹出层区域 -->
			<el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
				<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
					<el-form-item label="角色名称" prop="roleName">
						<el-input v-model="addForm.roleName"></el-input>
					</el-form-item>
					<el-form-item label="角色描述" prop="roleDesc">
						<el-input v-model="addForm.roleDesc"></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="addDialogVisible = false">取 消</el-button>
					<el-button type="primary" @click="addRole">确 定</el-button>
				</div>
			</el-dialog>

			<!-- 修改角色的弹出层区域 -->
			<el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
				<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
					<el-form-item label="角色名称" prop="roleName">
						<el-input v-model="editForm.roleName"></el-input>
					</el-form-item>
					<el-form-item label="角色描述" prop="roleDesc">
						<el-input v-model="editForm.roleDesc"></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer" class="dialog-footer">
					<el-button @click="editDialogVisible = false">取 消</el-button>
					<el-button type="primary" @click="editRole">确 定</el-button>
				</div>
			</el-dialog>

			<!-- 分配角色权限的弹出层区域 -->
			<el-dialog title="分配权限" :visible.sync="setDialogVisible" width="50%" @close="setDialogClosed">
				<!-- 树形控件 -->
				<el-tree :data="rightsList" :props="treeProps" node-key="id" show-checkbox default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>

				<div slot="footer" class="dialog-footer">
					<el-button @click="setDialogVisible = false">取 消</el-button>
					<el-button type="primary" @click="allotRight">确 定</el-button>
				</div>
			</el-dialog>
		</el-card>
	</div>
</template>

<script>
export default {
	name: 'Roles',

	data() {
		return {
			// 所有角色列表
			roleList: [],
			// 添加角色的表单数据
			addDialogVisible: false,
			addForm: {
				roleName: '',
				roleDesc: ''
			},
			// 添加角色的表单效验规则
			addFormRules: {
				roleName: [
					{ required: true, message: '请输入角色名称', trigger: 'blur' },
					{ min: 2, max: 8, message: '角色名称长度在2~8个字符', trigger: 'blur' }
				],
				roleDesc: [
					{ required: true, message: '请输入用户描述', trigger: 'blur' },
					{ min: 1, max: 15, message: '角色描述长度在1~15个字符', trigger: 'blur' }
				]
			},

			// 修改角色的表单数据
			editDialogVisible: false,
			editForm: {},
			// 修改角色的表单效验规则
			editFormRules: {
				roleName: [
					{ required: true, message: '请输入角色名称', trigger: 'blur' },
					{ min: 2, max: 8, message: '角色名称长度在2~8个字符', trigger: 'blur' }
				],
				roleDesc: [
					{ required: true, message: '请输入用户描述', trigger: 'blur' },
					{ min: 1, max: 15, message: '角色描述长度在1~15个字符', trigger: 'blur' }
				]
			},
			// 分配角色权限的数据
			setDialogVisible: false,
			//所有权限的数据
			rightsList: [],
			// 树形控件的属性绑定对象
			treeProps: {
				label: 'authName',
				children: 'children' // 通过 children 实现嵌套
			},
			// 控制默认选中的 id 集合
			defKeys: [],
			// 当前角色的 id
			roleId: ''
		}
	},
	created() {
		this.getRoleList()
	},

	methods: {
		async getRoleList() {
			const { data: res } = await this.$http.get('roles')
			if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
			// 成功就取值并赋值
			this.roleList = res.data
		},
		//监听添加角色的对话框关闭事件
		addDialogClosed() {
			//清除数据
			this.$refs.addFormRef.resetFields()
		},
		// 点击确定按钮添加角色
		addRole() {
			//调用 validate 进行表单验证
			this.$refs.addFormRef.validate(async valid => {
				if (!valid) return this.$message.error('请填写完整角色信息')
				const { data: res } = await this.$http.post('roles', this.addForm)
				if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
				// 添加成功
				this.$message.success(res.meta.msg)
				// 关闭对话框
				this.addDialogVisible = false
				//  刷新角色列表
				this.getRoleList()
			})
		},

		//监听修改角色的对话框关闭事件
		editDialogClosed() {
			this.$refs.editFormRef.resetFields()
		},
		// 根据id获取角色信息
		async showEditDialog(id) {
			// console.log(id)
			const { data: res } = await this.$http.get('roles/' + id)
			if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
			// 将角色的信息赋值给 editForm
			this.editForm = res.data
			// 打开弹出层
			this.editDialogVisible = true
		},
		// 根据id修改角色信息
		async editRole() {
			const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, {
				roleName: this.editForm.roleName,
				roleDesc: this.editForm.roleDesc
			})
			if (res.meta.status !== 200) return this.$message.error('修改角色信息失败')
			this.$message.success('修改角色信息成功')
			// 刷新角色列表
			this.getRoleList()
			// 关闭对话框
			this.editDialogVisible = false
		},

		// 根据id删除角色
		async removeRoleById(id) {
			console.log(id)
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
			const { data: res } = await this.$http.delete('roles/' + id)
			// console.log(res)
			if (res.meta.status !== 200) this.$message.error('删除角色失败')

			// 成功则提示消息 并刷新角色列表
			this.$message.success('删除角色成功')
			this.getRoleList()
		},

		//根据 id 删除对应的权限
		async removeRightById(role, rightId) {
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
			// 确认删除 发送请求 需要roleId rightId
			const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
			if (res.meta.status !== 200) this.$message.error('删除权限失败')
			//成功则 刷新数据
			// this.getRoleList() //! 这样会刷新页面 导致折叠收起来
			role.children = res.data //!函数引用修改数据也可更改页面数据中的内容
		},

		//根据 角色信息分配角色对应的权限
		async showSetRightDialog(role) {
			// 存储角色id 待后续调用分配权限接口使用
			this.roleId = role.id
			const { data: res } = await this.$http.get('rights/tree')
			if (res.meta.status !== 200) return this.$message.error('获取权限树形列表失败')
			// 获取数据并赋值
			this.rightsList = res.data
			// 调用递归函数
			this.getLeafKeys(role, this.defKeys)
			// 关闭对话框
			this.setDialogVisible = true
		},

		// 通过递归函数,获取三级权限下的 id 集合
		getLeafKeys(node, arr) {
			// 没有 children 就是最终的三级权限,直接将id push到 arr 数组中
			if (!node.children) {
				return arr.push(node.id)
			}
			// 如果不是 则遍历children数组 使用递归函数
			node.children.forEach(item => this.getLeafKeys(item, arr))
		},

		// 关闭对话框 清除 defKeys
		setDialogClosed() {
			this.defKeys = []
		},

		// 点击为角色分配角色
		async allotRight() {
			const arr1 = this.$refs.treeRef.getCheckedKeys()
			const arr2 = this.$refs.treeRef.getHalfCheckedKeys()
			const keys = arr1.concat(arr2)
			const keyStr = keys.join()
			const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: keyStr })
			if (res.meta.status !== 200) return this.$message.error('分配权限失败')
			// 提示信息
			this.$message.success('分配权限成功')
			// 刷新数据
			this.getRoleList()
			// 关闭对话框
			this.setDialogVisible = false
		}
	}
}
</script>

<style lang="less" scoped>
.el-tag {
	margin: 7px;
}
.bdbottom {
	border-bottom: 1px solid #ccc;
}
.bdtop {
	border-top: 1px solid #ccc;
}
.vcenter {
	display: flex;
	align-items: center;
}
</style>
