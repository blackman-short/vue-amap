<template>
  <div class="gCascader">
    <div class="trigger" @click="toggle">
      <slot>{{result}}</slot>
    </div>
    <!-- <cascader-item v-if="isVisible" :options="options" @change="change" :value="value"></cascader-item> -->

    <cascader-item v-if="isVisible" :options="options" @change="change" :value="value"></cascader-item>
  </div>
</template>

<script>
import CascaderItem from './item'

export default {
  name: 'Cascader',

  components: {
    CascaderItem
  },

  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      isVisible: true,
      result: ''
    }
  },

  directives: {
    clickOutside: {
      inserted (el, bindings) {
        document.addEventListener('click', e => {
          if (e.target === el || el.contains(el.target)) {
            return
          }

          bindings.value()
        })
      }
    }
  },

  methods: {
    close () {
      this.isVisible = false
    },

    toggle () {
      this.isVisible = !this.isVisible
    },

    change (value) {
      this.result = value.map(item => item.label).join('/')
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="stylus" scoped>
.gCascader
  .trigger
    width 150px
    height 25px
    border 1px solid #ccc
    cursor pointer
</style>
