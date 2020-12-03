<template>
  <div class="home">
    <p class="title">日常工作使用工具集合</p>
    <div class="project">
      <div class="project_item"
        v-for="(tool, idx) in tools"
        :key="idx"
        @click="goTool(tool)">
        <img class="icon" :src="tool.img" alt="" srcset="">
        <p class="name">{{tool.name}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import qrCodePng from '@/assets/images/qrCode.png'
import certifyPng from '@/assets/images/certify.png'
import tableTransPng from '@/assets/images/tableTrans.png'

export default {
  name: 'Home',

  data () {
    return {
      tools: [
        { name: '表图转化', img: tableTransPng, url: '/chart/transform' },
        { name: '手机实名提取', img: certifyPng, url: '/table/transform' },
        { name: '手机实名提取 v.2', img: certifyPng, url: '/table/transform_v.2' },
        { name: '生成二维码', img: qrCodePng, url: '/qr-code' }
      ]
    }
  },

  methods: {
    goTool (tool) {
      this.$router.push(tool.url)
    }
  }
}
</script>

<style lang="stylus" scoped>
.home
  .title
    padding 1rem 0
    color #ffffff
    background-color #34A66C
    font-size 22px
    text-align center
  .project
    display flex
    flex-wrap wrap
    &_item
      cursor pointer
      width 180px
      height 120px
      margin-bottom 14px
      color #666
      font-size 14px
      display flex
      flex-direction column
      align-items center
      justify-content center
      &:hover
        background-color #e2f8eb
        color #34A66C
      .name
        line-height 2.5
        margin-bottom 0 !important
</style>
