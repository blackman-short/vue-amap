<template>
  <div class="expand_TB">
    <p class="opBtn">
      <!-- 指标项 -->
      <i data-step="1" data-intro="”点击“添加指标项" class="el-icon-plus opIcon" @click="addTarget" title="添加指标项"></i>
      <el-input
        style="width: 80px; margin-right: 8px"
        v-for="(t, idx) in targetList"
        :key="idx"
        :placeholder="idx > 0 ? '指标项' + (idx) : '日期'"
        v-model="targetList[idx]"></el-input>
      <i v-if="targetList && targetList.length > 1" class="el-icon-close closeIcon" title="删除指标" @click="removeTarget"></i>
    </p>

    <div class="tableData">
      <p class="row" v-for="(tv, idx) in targetValues" :key="idx">
        <el-input
          style="width: 80px; margin-right: 8px"
          v-for="td in targetList"
          :key="td"
          v-model="tv[td]"></el-input>

        <i v-if="targetValues && targetValues.length > 1 && idx === (targetValues.length-1)" class="el-icon-close closeIcon" title="删除行数据" @click="removeRowData"></i>
      </p>
      <p>
        <i data-step="2" data-intro="”点击“添加行数据" class="el-icon-plus opIcon opIcon_addRow" @click="addRowData" title="添加行数据"></i>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpandTable',

  data () {
    return {
      targetList: [''], // 指标项
      targetValues: [{}] // 指标值
    }
  },

  methods: {
    // 添加指标项
    addTarget () {
      if (this.targetList.includes('')) {
        alert(`第${this.targetList.indexOf('') + 1}个指标项为空！`)
      } else {
        // 指标项重复
        let findIndex = this.targetList.findIndex(x => x === this.targetList[this.targetList.length - 1])
        if (findIndex !== (this.targetList.length - 1)) {
          alert(`第${findIndex + 1}个 与 第${this.targetList.length}个指标项重复！`)
        } else {
          this.targetList.push('')

          this.$emit('headerChange', this.targetList)
        }
      }
    },

    // 删除指标项
    removeTarget () {
      if (this.targetList.length > 1) {
        this.targetList.pop()
        this.$emit('headerChange', this.targetList)
      }
    },

    // 添加行数据
    addRowData () {
      if (this.targetList.length === 1 && !this.targetList[0]) {
        alert('请先填写指标项！')
      } else {
        let isValid = true

        for (let i = 0; i < this.targetList.length; i++) {
          let t = this.targetList[i]
          for (let j = 0; j < this.targetValues.length; j++) {
            let v = this.targetValues[j]
            if (!v[t]) {
              isValid = false
              alert(`第${j + 1}行数据，[${t}]指标值为空！`)
              break
            }
            /* 数值校验 */
            // else if (v[t] && !/^-?[1-9]\d*$/.test(v[t].trim())) {
            //   isValid = false
            //   alert(`请填写数值：第${j + 1}行数据，[${t}]指标值 【${v[t]}】！`)
            //   break
            // }
          }

          if (!isValid) break
        }

        if (isValid) {
          this.targetValues.push({})
          this.$emit('dataChange', this.targetValues.slice(0, this.targetValues.length - 1))
        }
      }
    },

    // 删除行数据
    removeRowData () {
      if (this.targetValues.length > 1) {
        this.targetValues.pop()
        this.$emit('dataChange', this.targetValues)
      }
    }
  }
}
</script>

<style lang="stylus">
.expand_TB
  .opBtn
    padding .25rem
    display flex
    align-items center
    background-color #E6EFFB
  .closeIcon
    color #F56C6C
    cursor pointer
    font-size 16px
    margin-left 8px
    &:hover
      color #EA1010
  .tableData
    padding .25rem
    .row
      margin 2px 0
    .rowBtnOp
      display flex
      align-items center
      justify-content center
      height 20px
      border 1px solid #e5eff5
      margin 8px 0
  .opIcon
     cursor pointer
     font-size 15px
     margin 0 8px
     color #007AFA
     font-weight bold
     &_addRow
      padding .25rem 0
      margin .25rem 0 0
      display flex
      align-items center
      justify-content center
      border 1px dashed #e6effb
      &:hover
        border 1px dashed #C9DDF6
        background-color #e6effb
     &:hover
      color #216AC4
</style>
