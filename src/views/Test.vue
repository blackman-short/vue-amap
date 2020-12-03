<template>
  <div class="test">
    <the-cascader :options="options" v-model="selected"></the-cascader>
  </div>
</template>

<script>
import TheCascader from '@/components/Cascader/index'

export default {
  name: 'TestPage',

  components: {
    TheCascader
  },

  data () {
    return {
      selected: [],

      options: [
        {
          'label': '肉类',
          'children': [
            {
              'label': '猪肉',
              'children': [
                {
                  'label': '五花肉'
                },
                {
                  'label': '里脊肉'
                }
              ]
            },
            {
              'label': '鸡肉',
              'children': [
                {
                  'label': '鸡腿'
                },
                {
                  'label': '鸡翅'
                }
              ]
            }
          ]
        },
        {
          'label': '蔬菜',
          'children': [
            {
              'label': '叶菜类',
              'children': [
                {
                  'label': '大白菜'
                },
                {
                  'label': '小白菜'
                }
              ]
            },
            {
              'label': '根茎类',
              'children': [
                {
                  'label': '萝卜'
                },
                {
                  'label': '土豆'
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
</script>

<style lang="stylus" scoped>
.test
  width 95%
  margin 2rem auto
</style>
