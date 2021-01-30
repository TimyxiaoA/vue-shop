<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 搜索与添加区域 -->
			<el-row :gutter="20">
				<el-col :span="8">
					<el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
						<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
					</el-input>
				</el-col>

				<el-col :span="4">
					<el-button type="primary" @click="dialogFormVisible = true">添加用户</el-button>

					<!-- 添加用户的弹出层区域 -->
					<el-dialog title="添加用户" :visible.sync="dialogFormVisible" width="50%" @close="addDialogClosed">
						<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
							<el-form-item label="用户名" prop="username">
								<el-input v-model="addForm.username"></el-input>
							</el-form-item>
							<el-form-item label="密码" prop="password">
								<el-input v-model="addForm.password"></el-input>
							</el-form-item>
							<el-form-item label="邮箱" prop="email">
								<el-input v-model="addForm.email"></el-input>
							</el-form-item>
							<el-form-item label="电话" prop="mobile">
								<el-input v-model="addForm.mobile"></el-input>
							</el-form-item>
						</el-form>
						<div slot="footer" class="dialog-footer">
							<el-button @click="dialogFormVisible = false">取 消</el-button>
							<el-button type="primary" @click="addUser">确 定</el-button>
						</div>
					</el-dialog>
				</el-col>
			</el-row>

			<!-- 用户列表区域 -->
			<el-table :data="userList" border style="width: 100%">
				<el-table-column type="index" label="#"> </el-table-column>
				<el-table-column prop="username" label="姓名"> </el-table-column>
				<el-table-column prop="email" label="邮箱"> </el-table-column>
				<el-table-column prop="mobile" label="电话"> </el-table-column>
				<el-table-column prop="role_name" label="角色"> </el-table-column>
				<el-table-column prop="mg_state" label="状态">
					<template slot-scope="scope">
						<!-- {{scope.row}} -->
						<el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<!-- 修改按钮 -->
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
						<!-- 分配角色按钮 -->
						<el-tooltip effect="dark" content="分配权限" placement="top" :enterable="false">
							<el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页功能 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 3, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>

			<!-- 修改用户的弹出层区域 -->
			<el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
				<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
					<el-form-item label="用户名">
						<el-input v-model="editForm.username" disabled></el-input>
					</el-form-item>
					<el-form-item label="邮箱" prop="email">
						<el-input v-model="editForm.email"></el-input>
					</el-form-item>
					<el-form-item label="手机" prop="mobile">
						<el-input v-model="editForm.mobile"></el-input>
					</el-form-item>
				</el-form>
				<span slot="footer" class="dialog-footer">
					<el-button @click="editDialogVisible = false">取 消</el-button>
					<el-button type="primary" @click="editUserInfo">确 定</el-button>
				</span>
			</el-dialog>
		</el-card>
	</div>
</template>

<script>
import hub from '../../utils/hub.js'
export default {
	name: 'Users',

	data() {
		//验证邮箱的规则
		const checkEmail = (rule, value, cb) => {
			const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
			if (regEmail.test(value)) {
				// 直接返回 cb()
				return cb()
			}
			//返回一个错误提示
			cb(new Error('请输入合法的邮箱'))
		}
		//验证手机号码的规则
		const checkMobile = (rule, value, cb) => {
			const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
			if (regMobile.test(value)) {
				// 直接返回 cb()
				return cb()
			}
			//返回一个错误提示
			cb(new Error('请输入合法的手机号码'))
		}
		return {
			queryInfo: {
				query: '',
				pagenum: 1, // 当前所处页码
				pagesize: 2 // 当前页面显示数据的条数
			},
			userList: [],
			total: 0,
			//添加用户的表单区域数据
			dialogFormVisible: false,
			addForm: {
				username: '',
				password: '',
				email: '',
				mobile: ''
			},
			//添加用户的表单效验规则
			addFormRules: {
				username: [
					{ required: true, message: '请输入用户名称', trigger: 'blur' },
					{ min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
				],
				password: [
					{ required: true, message: '请输入密码', trigger: 'blur' },
					{ min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
				],
				email: [
					{ required: true, message: '请输入邮箱', trigger: 'blur' },
					{ validator: checkEmail, trigger: 'blur' }
				],
				mobile: [
					{ required: true, message: '请输入手机号码', trigger: 'blur' },
					{ validator: checkMobile, trigger: 'blur' }
				]
			},

			//修改用户的表单区域数据
			editDialogVisible: false,
			editForm: {},
			//修改用户的表单的效验规则
			editFormRules: {
				email: [
					{ required: true, message: '请输入邮箱', trigger: 'blur' },
					{ validator: checkEmail, trigger: 'blur' }
				],
				mobile: [
					{ required: true, message: '请输入手机号码', trigger: 'blur' },
					{ validator: checkMobile, trigger: 'blur' }
				]
			}
		}
	},
	created() {
		this.getUserList()
		hub.$emit('saveNavState', '/users')
	},

	methods: {
		async getUserList() {
			const { data: res } = await this.$http.get('users', { params: this.queryInfo })
			// console.log(res)
			if (res.meta.status !== 200) return this.$Message.error(res.meta.msg)
			this.userList = res.data.users
			this.total = res.data.total
		},
		// 监听页面显示数据条数的改变
		handleSizeChange(newSize) {
			// console.log(newSize)
			this.queryInfo.pagesize = newSize
			//重新渲染页面
			this.getUserList()
		},
		// 监听当前页码值改变
		handleCurrentChange(newPage) {
			// console.log(newPage)
			this.queryInfo.pagenum = newPage
			//重新渲染页面
			this.getUserList()
		},
		//监听用户状态改变
		async userStateChanged(userinfo) {
			// console.log(userinfo)
			const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
			//设置状态失败 将当前开关返回初始状态
			if (res.meta.status !== 200) {
				userinfo.mg_state = !userinfo.mg_state
				return this.$Message.error(res.meta.msg)
			}
			this.$Message.success(res.meta.msg)
		},
		//监听对话框关闭事件
		addDialogClosed() {
			this.$refs.addFormRef.resetFields()
		},
		// 点击添加按钮 添加新用户
		addUser() {
			//调用validate进行表单验证
			this.$refs.addFormRef.validate(async valid => {
				if (!valid) return this.$Message.error('请填写完整用户信息!')
				//发送请求添加用户
				const { data: res } = await this.$http.post('users', this.addForm)
				if (res.meta.status !== 201) return this.$Message.error(res.meta.msg)
				this.$Message.success(res.meta.msg)
				//关闭对话框
				this.dialogFormVisible = false
				//重新获取用户列表
				this.getUserList()
			})
		},

		//修改用户信息按钮
		async showEditDialog(id) {
			console.log(id)
			const { data: res } = await this.$http.get('users/' + id)
			if (res.meta.status !== 200) return this.$Message.error(res.meta.msg)
			// 将获取数据赋值给表单
			this.editForm = res.data
			// 打开弹出层
			this.editDialogVisible = true
		},
		//监听对话框关闭事件
		editDialogClosed() {
			this.$refs.editFormRef.resetFields()
		},
		//提交修改的用户信息
		editUserInfo() {
			this.$refs.editFormRef.validate(async valid => {
				if (!valid) return false
				// 发送修改用户信息的请求
				const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
					email: this.editForm.email,
					mobile: this.editForm.mobile
				})
				if (res.meta.status !== 200) return this.$Message.error(res.meta.msg)
				//关闭弹出层
				this.editDialogVisible = false
				// 刷新数据
				this.getUserList()
				// 提示信息
				this.$Message.success(res.meta.msg)
			})
		},

		//删除用户
		async removeUserById(id) {
			//询问框
			const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).catch(err => err)
			// 如果用户确认删除, 则返回字符串 confirm 取消则返回 cancel
			if (confirmRes !== confirm) {
				return this.$Message.info('已取消删除')
			}
			// 确认删除 发送请求
			const { data: res } = await this.$http.delete('users/' + id)
			if (res.meta.status !== 200) return this.$Message.error(res.meta.msg)
			// 成功则提示消息 并刷新用户列表
			this.$Message.success(res.meta.msg)
			this.getUserList()
		}
	}
}
</script>

<style lang="less" scoped></style>
