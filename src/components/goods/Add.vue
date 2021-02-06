<template>
	<div>
		<!-- 面包屑导航 -->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>添加商品</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 卡片视图区域 -->
		<el-card>
			<!-- 消息提示框 -->
			<el-alert title="添加商品信息" type="info" show-icon center :closable="false"> </el-alert>
			<!-- 步骤条 -->
			<el-steps :space="200" :active="+activeIndex" finish-status="success" align-center>
				<el-step title="基本信息"></el-step>
				<el-step title="商品参数"></el-step>
				<el-step title="商品属性"></el-step>
				<el-step title="商品图片"></el-step>
				<el-step title="商品内容"></el-step>
				<el-step title="完成"></el-step>
			</el-steps>

			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
				<!-- tab栏切换 -->
				<el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
					<el-tab-pane label="基本信息" name="0">
						<el-form-item label="商品名称" prop="goods_name">
							<el-input v-model="addForm.goods_name"></el-input>
						</el-form-item>
						<el-form-item label="商品价格" prop="goods_price">
							<el-input v-model="addForm.goods_price" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品重量" prop="goods_weight">
							<el-input v-model="addForm.goods_weight" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品数量" prop="goods_number">
							<el-input v-model="addForm.goods_number" type="number"></el-input>
						</el-form-item>
						<el-form-item label="商品分类" prop="goods_cat1">
							<el-cascader :options="cateList" :props="cateProps" v-model="addForm.goods_cat1" @change="handleChange"> </el-cascader>
						</el-form-item>
					</el-tab-pane>

					<!-- ........ 在参数信息，商品属性面板中添加循环生成结构的代码 -->
					<el-tab-pane label="商品参数" name="1">
						<!-- 渲染表单item项 -->
						<el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in manyTableData">
							<!-- 使用数组渲染复选框组 -->
							<el-checkbox-group v-model="item.attr_vals">
								<el-checkbox border :label="val" v-for="(val, i) in item.attr_vals" :key="i"></el-checkbox>
							</el-checkbox-group>
						</el-form-item>
					</el-tab-pane>
					<!-- 商品属性区域 -->
					<el-tab-pane label="商品属性" name="2">
						<!-- 渲染表单item项 -->
						<el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
							<el-input v-model="item.attr_vals"></el-input>
						</el-form-item>
					</el-tab-pane>
					<!-- 图片上传区域 -->
					<el-tab-pane label="商品图片" name="3">
						<el-upload :action="uploadURL" :headers="headersObj" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture">
							<el-button size="small" type="primary">点击上传</el-button>
						</el-upload>
					</el-tab-pane>
					<el-tab-pane label="商品内容" name="4">
						<!-- 富文本编辑器组件 -->
						<quill-editor v-model="addForm.goods_introduce"></quill-editor>
						<!-- 添加商品按钮 -->
						<el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
					</el-tab-pane>
				</el-tabs>
			</el-form>
		</el-card>

		<!-- 图片预览区域对话框 -->
		<el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
			<img :src="previewPath" alt="" class="previewImg" />
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: 'Add',

	data() {
		return {
			activeIndex: '0',
			//添加的表单对象
			addForm: {
				goods_name: '',
				goods_price: 0,
				goods_weight: 0,
				goods_number: 0,
				goods_cat: [],
				goods_cat1: [],
				// 上传图片的数组
				pics: [],
				// 商品介绍
				goods_introduce: '',
				// 商品参数
				attrs: []
			},

			addFormRules: {
				goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
				goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
				goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
				goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
				goods_cat1: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
			},
			//用来保存分类数据
			cateList: [],
			//配置级联菜单中数据如何展示
			cateProps: {
				value: 'cat_id',
				label: 'cat_name',
				children: 'children',
				expandTrigger: 'hover'
			},
			// 动态参数数据
			manyTableData: [],
			// 静态属性数据
			onlyTableData: [],
			// 上传图片的地址
			uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
			//设置上传的请求头部
			headersObj: {
				Authorization: window.sessionStorage.getItem('token')
			},
			// 图片预览的后台地址
			previewPath: '',
			// 图片预览对话框显示与隐藏
			previewDialogVisible: false
		}
	},
	created() {
		this.getCateList()
	},
	methods: {
		// 获取商品列表
		async getCateList() {
			const { data: res } = await this.$http.get('categories')

			if (res.meta.status !== 200) {
				return this.$Message.error('获取商品分类数据失败')
			}
			this.cateList = res.data
		},
		handleChange() {
			if (this.addForm.goods_cat1.length !== 3) {
				this.addForm.goods_cat1 = []
				return false
			}
		},
		beforeTabLeave(activeName, oldActiveName) {
			// console.log('即将离开的标签页', oldActiveName)
			// console.log('即将进入的标签页', activeName)
			if (oldActiveName === '0' && this.addForm.goods_cat1.length !== 3) {
				this.$Message.error('请选择商品分类')
				return false
			}
		},
		async tabClicked() {
			//当用户点击切换tab栏时触发
			if (this.activeIndex === '1') {
				//发送请求获取动态参数
				const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })

				if (res.meta.status !== 200) {
					return this.$Message.error('获取动态参数列表失败')
				}
				//将attr_vals字符串转换为数组
				res.data.forEach(item => {
					item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
				})
				this.manyTableData = res.data
			} else if (this.activeIndex === '2') {
				//发送请求获取静态属性
				const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
				console.log(res.data)
				if (res.meta.status !== 200) {
					return this.$Message.error('获取静态属性列表失败')
				}
				this.onlyTableData = res.data
			}
		},
		// 点击预览文件列表中已上传的文件时的钩子
		handlePreview(file) {
			// console.log(file)
			//当用户点击图片进行预览时执行，处理图片预览
			//形参file就是用户预览的那个文件
			this.previewPath = file.response.data.url
			this.previewDialogVisible = true
		},
		// 文件列表移除文件时的钩子
		handleRemove(file) {
			console.log(file)
			//当用户点击X号删除时执行
			//形参file就是用户点击删除的文件
			//获取用户点击删除的那个图片的临时路径
			const filePath = file.response.data.tmp_path
			//使用findIndex来查找符合条件的索引
			const index = this.addForm.pics.findIndex(item => item.pic === filePath)
			//移除索引对应的图片
			this.addForm.pics.splice(index, 1)
		},
		//  文件上传成功的钩子
		handleSuccess(response) {
			//当上传成功时触发执行
			//形参response就是上传成功之后服务器返回的结果
			//将服务器返回的临时路径保存到addForm表单的pics数组中
			this.addForm.pics.push({ pic: response.data.tmp_path })
		},
		//编写点击事件完成商品添加
		add() {
			this.$refs.addFormRef.validate(async valid => {
				if (!valid) return this.$Message.error('请填写必要的表单项!')
				this.addForm.goods_cat = [...this.addForm.goods_cat1]
				console.log(this.addForm.goods_cat)
				this.addForm.goods_cat = this.addForm.goods_cat.join(',')
				//处理attrs数组，数组中需要包含商品的动态参数和静态属性
				//将manyTableData（动态参数）处理添加到attrs
				this.manyTableData.forEach(item => {
					this.addForm.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') })
				})
				//将onlyTableData（静态属性）处理添加到attrs
				this.onlyTableData.forEach(item => {
					this.addForm.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals })
				})
				console.log(this.addForm)
				//发送请求完成商品的添加,商品名称必须是唯一的
				const { data: res } = await this.$http.post('goods', this.addForm)
				if (res.meta.status !== 201) {
					return this.$Message.error('添加商品失败')
				}
				this.$Message.success('添加商品成功')
				//编程式导航跳转到商品列表
				this.$router.push('/goods')
			})
		}
	},
	computed: {
		cateId() {
			if (this.addForm.goods_cat1.length === 3) {
				return this.addForm.goods_cat1[2]
			}
			return null
		}
	}
}
</script>

<style lang="less" scoped>
.el-checkbox {
	margin: 0 10px 0 0 !important;
}
.previewImg {
	width: 100%;
	max-height: 600px;
}
.btnAdd {
	margin-top: 15px;
}
</style>
