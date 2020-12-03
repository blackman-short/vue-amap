<template>
  <router-view></router-view>
</template>

<script>
import IntroJs from 'intro.js'

export default {
  name: 'ChartIndex',

  data () {
    return {
      tourConfig: {
        steps: [
          {
            target: '#v-step-0', // We're using document.querySelector() under the hood
            content: `Discover <strong>Vue Tour</strong>!`
          },
          {
            target: '#v-step-1',
            content: 'An awesome plugin made with Vue.js!',
            params: {
              placement: 'top'
            }
          },
          {
            target: '#v-step-2',
            content: 'Try it, you\'ll love it!<br>You can put HTML in the steps and completely customize the DOM to suit your needs.',
            params: {
              placement: 'top'
            }
          }
        ],

        options: {
          labels: {
            buttonSkip: '跳过',
            buttonPrevious: '上一步',
            buttonNext: '下一步',
            buttonStop: '完成'
          }
        }
      }
    }
  },

  methods: {
    introduce () {
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
        // window.location.href = 'http://10.124.14.119:8081/#/kendo/ui?multipage=true'
      }).onexit(() => {

      }).start()
    }
  },

  mounted () {
    this.introduce()
  }
}
</script>
