<template>
  <div class="chart-transform">
    <p class="title">{{pageTitle}}</p>
    <div class="content">
      <!-- 表格数据 -->
      <div class="content_left">
        <!-- <expand-table ref="chartExpandTable" @dataChange="generateChart"></expand-table> -->
        <expand-table ref="chartExpandTable"></expand-table>
      </div>

      <!-- 图表数据 -->
      <div class="content_right">
        <p class="opBtns">
          <span>
            <el-select v-model="chartConfig.selectedType" @change="toggleChartType">
              <el-option
                v-for="op in chartConfig.types"
                :key="op.type"
                :label="op.name"
                :value="op.type"></el-option>
            </el-select>

            <el-select v-if="chartConfig.selectedType === 'pie'" v-model="chartConfig.selectedPieTarget" @change="togglePieTarget">
              <el-option
                v-for="op in chartConfig.pieSeries.options"
                :key="op"
                :label="op"
                :value="op"></el-option>
            </el-select>

            <el-input style="width: 180px" type="number" v-model="chartConfig.width">
              <template slot="prepend">宽度：</template>
            </el-input>
            <el-input style="width: 180px" type="number" v-model="chartConfig.height">
              <template slot="prepend">高度：</template>
            </el-input>
          </span>

          <span>
            <el-button data-step="3" data-intro="数据填充完，”点击“生成相应图表" @click="generateChart" type="primary" round>生成图表</el-button>
          </span>
        </p>
        <ve-chart
          :data="chartData"
          :title="chartConfig.title"
          :series="chartConfig.series"
          :settings="chartConfig.settings"
          :extend="chartConfigExtend"
          :width="chartWidth"
          :height="chartHeight">
        </ve-chart>
      </div>
    </div>
  </div>
</template>

<script>
import ExpandTable from '@/components/expandTable'

export default {
  name: 'ChartTransform',

  components: {
    ExpandTable
  },

  computed: {
    pageTitle () {
      return document.title
    },

    chartConfigExtend () {
      return this.chartConfig.selectedType === 'histogram' ? { barGap: '0' } : null
    },

    chartWidth () {
      return this.chartConfig.width === 'auto' ? 'auto' : this.chartConfig.width + 'px'
    },

    chartHeight () {
      return this.chartConfig.height === 'auto' ? 'auto' : this.chartConfig.height + 'px'
    }
  },

  data () {
    return {
      KFServicer: '李方宁',

      chartData: {
        columns: [], // 所有的指标项
        rows: [] // 指标数据
        // metrics: [], // 显示的指标项
        // dimension: [] // 横坐标
      },

      chartConfig: {
        width: 'auto',
        height: '400',
        title: {
          show: true,
          text: '',
          textStyle: { color: '#007AFA', fontSize: 15 }
        },
        settings: {
          type: 'histogram'
        },
        types: [
          { type: 'histogram', name: '柱形图' },
          { type: 'line', name: '线形图' },
          { type: 'pie', name: '饼图' }
        ],
        selectedType: 'histogram', // 图表类型
        selectedPieTarget: '', // 饼图选中的指标值
        series: [],
        pieSeries: {
          options: [],
          series: {}
        } // 饼图的series
      }
    }
  },

  methods: {
    // 生成图表
    generateChart () {
      this.chartData.rows = this.$refs['chartExpandTable'].targetValues // 指标值
      this.chartData.columns = this.$refs['chartExpandTable'].targetList // 指标项
      this.chartConfig.title.text = this.KFServicer

      if ((!this.chartData.rows || !this.chartData.rows.length || !Object.keys(this.chartData.rows[0]).length) ||
      (!this.chartData.columns || !this.chartData.columns.length || !this.chartData.columns.filter(x => (x !== undefined && x !== '' && x !== null)))) {
        this.chartData = {
          rows: [],
          columns: []
        }
        alert('请填写指标数据！')
        return
      }

      if (this.chartConfig.selectedType !== 'pie') {
        this.chartConfig.series = this.generateSeries(this.chartData.columns, this.chartData.rows, this.chartConfig.selectedType)
      } else {
        this.chartConfig.pieSeries = this.generatePieSeries(this.chartData.columns, this.chartData.rows)
        if (!this.chartConfig.selectedPieTarget) { this.chartConfig.selectedPieTarget = this.chartConfig.pieSeries.options[0] }
        this.chartConfig.series = this.chartConfig.pieSeries[this.chartConfig.selectedPieTarget]
      }

      // 设置维度 & 指标项
      // this.chartConfig.settings.metrics = [columns[0]]
      // this.chartConfig.settings.dimension = columns.slice(1, columns.length)
    },

    // 生成图表series data => 显示数值
    generateSeries (columns = [], rows = [], type = 'histogram') {
      let series = []
      // 去除第一个指标项: 第一个为X轴.
      let filterCols = columns.slice(1, columns.length)
      for (let key of filterCols) {
        series.push({
          name: key,
          type: type === 'histogram' ? 'bar' : type,
          data: rows.map(x => x[key]),
          label: {
            show: true,
            position: 'top'
          }
        })
      }
      return series
    },

    // 生成饼图series data
    generatePieSeries (columns = [], rows = []) {
      let seriesObj = {
        options: [],
        series: {}
      }

      // 饼图指标值选项集合
      seriesObj.options = columns.slice(1, columns.length)

      // => 生成series.data: name(第一指标项的值), value(其他指标项的值)
      for (let key of seriesObj.options) {
        seriesObj.series[key] = [{
          name: key,
          type: 'pie',
          data: this.convertPieSeriesData(rows, columns[0], key),
          label: {
            show: true,
            position: 'inside'
          }
        }]
      }

      return seriesObj
    },

    convertPieSeriesData (rows, nameKey, valueKey) {
      let data = []

      for (let c of rows) {
        data.push({
          name: c[nameKey],
          value: c[valueKey]
        })
      }

      return data
    },

    // 切换图表类型
    toggleChartType (value) {
      this.chartConfig.selectedType = value
      this.chartConfig.settings.type = value
      if (value !== 'pie') {
        this.chartConfig.series = this.generateSeries(this.chartData.columns, this.chartData.rows, value)
      } else {
        if (!this.chartConfig.pieSeries.options.length) {
          this.chartConfig.pieSeries = this.generatePieSeries(this.chartData.columns, this.chartData.rows)
        }

        // 默认第一指标项
        if (!this.chartConfig.selectedPieTarget) this.chartConfig.selectedPieTarget = this.chartConfig.pieSeries.options[0]

        this.chartConfig.series = this.chartConfig.pieSeries[this.chartConfig.selectedPieTarget]
      }
    },

    // 切换饼图 指标项
    togglePieTarget (target) {
      this.chartConfig.selectedPieTarget = target
      this.chartConfig.series = this.chartConfig.pieSeries.series[target]
      this.chartConfig.title.text = `指标：${target}`
    }
  }
}
</script>

<style lang="stylus" scoped>
.chart-transform
  width 90%
  min-width 750px
  height 100%
  margin 0 auto
  .title
    font-size 1.25rem /* 20/16 */
    color #444
    text-align center
    line-height 3
  .content
    height 85%
    &_left
    &_right
      border 1px solid #e6effb

    &_left
      width 100%
      min-height 45%
      border-top 2px solid #e5eff5
      overflow-y auto
    &_right
      border-top 2px solid #e5eff5
      width 100%
      .opBtns
        display flex
        align-items center
        justify-content space-between
        padding .25rem
        background-color #e6effb
        span
          display flex
          align-items center
          .el-select
          .el-input
            margin-right .5rem
</style>
