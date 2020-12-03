<template>
  <span v-if="type !== 'image'" class="create-qrcode">
    <el-button type="text" :size="buttonSize" @click="showQrCodeDialog = true">{{btnTextValue}}</el-button>
    <el-dialog
      :id="eleId"
      :title="firstTitle"
      :visible.sync="showQrCodeDialog"
      :width="(qrCodeSize + 100) + 'px'"
      center
    >
      <vue-qr :text="qrText" :logoSrc="logoImg" :dotScale="dotScale" :size="qrCodeSize"></vue-qr>
      <p>
        <a
          style="white-space: pre-line; color:#00896C"
          title="点击下载"
          @click="toShowQrCode"
          v-if="downloadable"
          :href="imgUrl"
          :download="subTitle + '.png'"
        >{{subTitle}}</a>
        <span v-else>{{subTitle}}</span>
      </p>
    </el-dialog>
  </span>
  <span v-else>
    <vue-qr :text="qrText" :logoSrc="logoImg" :dotScale="dotScale" :size="qrCodeSize"></vue-qr>
    <p style="color: #666; font-size: 14px">
      <span>{{subTitle}}</span>
    </p>
  </span>
</template>

<script>
import VueQr from 'vue-qr'
import { Formate } from '@/utils'

export default {
  name: 'CreateQrCode',

  components: {
    VueQr
  },

  props: {
    btnTextValue: {
      type: String,
      default: '二维码'
    },
    qrText: {
      type: String,
      default: 'this is a title'
    },

    logoImg: {
      type: String,
      default: ''
    },

    buttonSize: {
      type: String,
      default: 'mini'
    },

    firstTitle: {
      type: String,
      default: '二维码'
    },

    subTitle: {
      type: String,
      default: 'This is a sub title'
    },

    qrCodeSize: {
      type: Number,
      default: 300
    },

    downloadable: {
      type: Boolean,
      default: false
    },

    type: {
      type: [String],
      default: ''
    }
  },

  computed: {
    eleId () {
      return `qrcode-${Formate.generateUUID()}`
    }
  },

  data () {
    return {
      dotScale: 1, // 二维码数据点的大小比例(0 ~ 1.0)
      showQrCodeDialog: false,
      imgUrl: '#'
    }
  },

  methods: {
    toShowQrCode () {
      if (this.downloadable) {
        const diaologEle = document.getElementById(this.eleId)
        const imgEles = diaologEle.getElementsByTagName('img')
        if (imgEles && imgEles[0]) {
          const qrCodeImgEle = imgEles[0]
          this.imgUrl = qrCodeImgEle.src
        }
      }
    }
  }
}
</script>

<style scope>
.create-qrcode {
  color: #303133;
}

.create-qrcode .el-dialog__body {
  text-align: center !important;
  height: 400px;
}
</style>
