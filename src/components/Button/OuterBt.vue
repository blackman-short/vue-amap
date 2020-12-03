<template>
  <el-button :type="activeBt.color" @click="operat" size="small" round :plain="activeBt.plain">{{label || activeBt.label}}</el-button>
</template>

<script>
export default {
  name: 'OuterBT',

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
    activeBt () {
      return this.btnMapper.find(x => x.type === this.type)
    }
  },

  data () {
    return {
      btnMapper: [
        {
          type: 'search',
          label: '查询',
          color: 'primary'
        },
        {
          type: 'edit',
          label: '编辑',
          color: 'info'
        },
        {
          type: 'delete',
          label: '删除',
          color: 'danger'
        },
        {
          type: 'new',
          label: '新增',
          color: 'success'
        },
        {
          type: 'import',
          label: '导入',
          color: 'success',
          plain: true
        },
        {
          type: 'export',
          label: '导出',
          color: 'success',
          plain: true
        }
      ]
    }
  },

  methods: {
    operat () {
      this.$emit('click')
    }
  }
}
</script>
