import Vue from 'vue'
import { Button, Form, FormItem, Input } from 'element-ui'
//导入 Message 提示信息
import { Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 全局挂载
Vue.prototype.$Message = Message
