<template>
	<div>
		<h3>welcome</h3>
	</div>
</template>

<script>
import hub from '../utils/hub.js'
export default {
	name: 'Welcome',

	data() {
		return {}
	},
	created() {
		hub.$emit('saveNavState', '')
	},

	methods: {}
}
</script>

<style lang="less" scoped></style>
