<template>
  <div class="create-qrcode">
    <div class="input">
      <el-input
        v-model="qrText"
        placeholder="请输入网址内容"
        type="textarea"
        :rows="10"
        maxlength="200"
        show-word-limit>
      </el-input>
    </div>
    <div class="code">
      <vue-qr v-if="qrText" :text="qrText" :logoSrc="logoImg" :dotScale="1" :size="300"></vue-qr>
      <p v-else>此处生成二维码</p>
    </div>
  </div>
</template>

<script>
import VueQr from 'vue-qr'
import xdfLogo from '@/assets/images/xdf.png'

export default {
  name: 'QrCode',

  components: {
    VueQr
  },

  data () {
    return {
      qrText: '',
      logoImg: xdfLogo
    }
  }
}
</script>

<style lang="stylus" scoped>
.create-qrcode
  display flex
  align-items center
  justify-content center
  width 85%
  margin 0 auto
  padding-top 2rem
  .input
    width 45%
    margin-right 2rem
    >>>textarea
      min-height 305px !important
  .code
    display flex
    align-items center
    justify-content center
    border 1px solid #DCDFE6
    color #ccc
    width 305px
    height 305px
</style>
