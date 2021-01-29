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
					<el-button type="primary">添加用户</el-button>
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
						<el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
						<!-- 删除按钮 -->
						<el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
						<!-- 分配角色按钮 -->
						<el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false">
							<el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页功能 -->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 3, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> </el-pagination>
		</el-card>
	</div>
</template>

<script>
export default {
	name: 'Users',

	data() {
		return {
			queryInfo: {
				query: '',
				pagenum: 1, // 当前所处页码
				pagesize: 2 // 当前页面显示数据的条数
			},
			userList: [],
			total: 0
		}
	},
	created() {
		this.getUserList()
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
		handleCurrentChange(newNum) {
			// console.log(newNum)
			this.queryInfo.pagenum = newNum
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
		}
	}
}
</script>

<style lang="less" scoped></style>
