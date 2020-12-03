<template>
  <div class="demo-kendo">
    <p data-intro="点击‘选择’日历">这是日历</p>
    <kendo-calendar :value="new Date()"></kendo-calendar>
  </div>
</template>

<script>
import IntroJs from 'intro.js'

export default {
  name: 'KendoDemo',

  data () {
    return {

    }
  },

  mounted () {
    IntroJs().setOptions({
      prevLabel: '上一步',
      nextLabel: '下一步',
      skipLabel: '跳过',
      doneLabel: '结束',
      showStepNumbers: false,
      showBullets: false,
      hidePrev: true,
      hideNext: true
    }).oncomplete(() => {

    }).onexit(() => {

    }).start()
  }
}
</script>

<style lang="stylus" scoped>

</style>
