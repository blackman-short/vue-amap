<template>
  <el-button style="cursor:pointer" type="text" size="mini" :class="type" @click="operat">{{btLabel}}</el-button>
</template>

<script>
export default {
  name: 'InnerBt',

  props: {
    type: {
      type: [String],
      default: 'edit'
    },

    label: {
      type: [String],
      default: ''
    }
  },

  computed: {
    btLabel () {
      if (this.label) return this.label

      const labelMapper = [
        {
          type: 'edit',
          label: '编辑'
        },
        {
          type: 'view',
          label: '详情'
        },
        {
          type: 'delete',
          label: '删除'
        }
      ]

      return labelMapper.find(x => x.type === this.type).label
    }
  },

  methods: {
    operat () {
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.edit {
  color: #E6A23C
}

.view {
  color: #409EFF
}

.delete {
  color: #F56C6C
}
</style>
