<template>
  <div class="amap-wrapper">
    <el-amap class="amap-box" vid="map"
      :zoom="zoom"
      :center="center">
    </el-amap>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      zoom: 16,
      center: [121.406051, 31.179695]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.amap-box {
 height: 350px;
 width: 350px
}
</style>
