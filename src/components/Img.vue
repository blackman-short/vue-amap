<template>
  <span class="g-img" v-if="imgSrc" @mouseover="showDeleteIcon = true" @mouseout="showDeleteIcon = false">
    <i title="删除" v-show="showDeleteIcon" class="el-icon-delete icon_del" @click="clickDel"></i>
    <img :src="imgSrc" class="avatar">
  </span>
</template>

<script>
export default {
  name: 'TheImg',

  props: {
    imgSrc: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      showDeleteIcon: false
    }
  },

  methods: {
    clickDel () {
      this.$emit('delImg', this.imgSrc)
    }
  }
}
</script>

<style scoped>
.icon_del {
  position: absolute;
  color: #ff4949;
  font-weight: 800;
  cursor: pointer;
  border-radius: 50%;
  padding: .5rem;
  background-color: rgb(255, 255, 255, .9);
}

.g-img {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
