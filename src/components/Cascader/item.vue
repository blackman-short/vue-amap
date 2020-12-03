<template>
  <div class="content cascader-item">
    <!-- 父选择项 -->
    <div class="content-left">
      <div class="label" v-for="(item,key) in options" :key="key">
        <div @click="select(item)">{{item.label}}</div>
      </div>
    </div>

    <!-- 儿子选择项 -->
    <div v-if="lists && lists.length" class="content-right">
      <CascaderItem :options="lists" @change="change" :value="value" :level="level+1"></CascaderItem>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'CascaderItem',

  props: {
    options: {
      type: Array,
      default: () => []
    },

    value: { // 级联选择：获取的数据类型是Array
      type: Array,
      default: () => []
    },

    level: {
      type: Number,
      default: 0
    }
  },

  computed: {
    lists () {
      if (this.value && this.value[this.level]) {
        // 找到这一项
        let item = this.options.find(item => item.label === this.value[this.level].label)
        // 将儿子进行返回
        if (item && item.children) {
          return item.children
        }
      }
      // return this.currentSelect && this.currentSelect.children
    }
  },

  data () {
    return {
      currentSelect: null // 当前点击的第一层儿子
    }
  },

  methods: {
    select (item) {
      let cloneValue = cloneDeep(this.value)
      cloneValue[this.level] = item
      cloneValue.splice(this.level + 1)
      this.$emit('change', cloneValue)
    },

    change (value) {
      this.$emit('change', value)
    }
  }
}
</script>

<style>
.cascader-item {
 display: flex;
}
.content-left{
    border: 1px solid #ccc;
    min-height: 100px;
}
.content-right{
    margin-left:-1px;
}
.label{
    width:60px;
    font-size: 12px;
    line-height: 20px;
    color: #606266;
    padding-left: 10px;
    cursor: pointer
}
.label:hover{
    background: #f5f7fa;
}
</style>
