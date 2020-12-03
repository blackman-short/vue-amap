<template>
  <div class="gTable bt-table table-sm">
    <div id="btnsQuery">
      <slot name="aQuery"></slot>
    </div>
    <div id="tableContentView" class="table-responsive-sm">
      <table class="table table-bordered">
        <thead class="thead-light">
          <tr>
            <th v-if="firstIndexType === 'index'" class="text-nowrap text-center" scope="col">#</th>
            <th
              v-else-if="firstIndexType === 'selection'"
              class="text-nowrap text-center"
              scope="col"
            >
              <el-checkbox v-model="tableHeaderCheckboxIsChecked" @change="changeHeaderCheckbox" :disabled="(!fields || !fields.length || !tableData || !tableData.length)"></el-checkbox>
            </th>

            <th
              class="text-nowrap text-center"
              v-for="f in fields"
              :key="f.label"
              scope="col"
            >{{ f.label }}</th>
            <th class="text-center" v-if="operatable && fields && fields.length">操作</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(td, i) in theTableData" :key="i" :style="setTrStyle(td, i)">
            <th
              v-if="firstIndexType === 'index'"
              scope="row"
              class="align-middle text-center"
            >{{i + 1}}</th>
            <th
              v-else-if="firstIndexType === 'selection'"
              class="text-nowrap text-center"
              scope="col"
            >
              <el-checkbox v-model="td.isChecked" @change="tableRowChecked(td)"></el-checkbox>
            </th>
            <td class="text-nowrap align-middle text-center" v-for="f in fields" :key="f.label">
              <span v-if="f.type === 'link'" @click="goChildLink(f, td)" class="linkCol">{{td[f.field]}}</span>
              <span v-else-if="f.type === 'money'">{{'￥' + (td[f.field] || '0')}}</span>
              <span
                v-else-if="f.type === 'date'"
              >{{f.formateString ? formateDate(td[f.field], f.formateString) : formateDate(td[f.field])}}</span>
              <span
                v-else-if="f.type === 'datetime'"
              >{{f.formateString ? formateDateTime(td[f.field], f.formateString) : formateDateTime(td[f.field])}}</span>
              <span v-else-if="f.type === 'template'" class="d-flex justify-content-center">
                <slot :name="'colTemp.' + f.field" :row="td"></slot>
              </span>
              <span v-else-if="f.type === 'templateHTML'" class="d-flex justify-content-center">
                <div v-html="f.template"></div>
              </span>
              <span v-else-if="f.type === 'boolean'">
                <el-switch v-if="f.childType === 'switch'"
                  :width="switchWidth"
                  @change="colSwitch(td, i)"
                  v-model="td[f.field]"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  :active-value="f.valueMapper[0]"
                  :inactive-value="f.valueMapper[1]"></el-switch>
                <el-tag v-else
                  effect="dark"
                  size="mini"
                  :type="td[f.field] ? 'success': 'info'"
                >{{ td[f.field] ? 'Y' : 'N' }}</el-tag>
              </span>
              <!-- 图片 -->
              <span v-else-if="f.type === 'image'">
                <img class="avater" :src="td[f.field]" alt="图片" srcset />
              </span>
              <!-- 二维码 -->
              <span v-else-if="f.type === 'qrcode'">
                <the-link downloadable
                  :logoImg="QrLogo"
                  :firstTitle="f.title ||'活动链接'"
                  :subTitle="td[f.field]"
                  :qrText="f.link + td[f.field]"></the-link>
              </span>
              <!-- 文件预览 -->
              <span v-else-if="f.type === 'file'">
                <el-link style="font-size: 12px; margin-right: 8px" :href="td[f.field]" type="success">下载</el-link>
                <el-link style="font-size: 12px" @click="viewFile(td[f.field])" type="warning">{{f.viewMsg || '文件预览'}}</el-link>
              </span>
              <span v-else-if="f.type === 'avatar'">
                <el-avatar :size="f.size || 'small'" :src="td[f.field]"></el-avatar>
              </span>
              <span v-else :style="!td[f.field] ? 'color: #ccc' : ''">
                <!-- {{(td[f.field] && td[f.field].length && td[f.field].length > 20 ? td[f.field].substring(0 , 20) + '...' : td[f.field]) || '——'}} -->
                <el-tooltip v-if="td[f.field] && td[f.field].length && td[f.field].length > 30" effect="light" :content="td[f.field]" placement="top">
                  <label>{{td[f.field].substring(0 , 30) + '...'}}</label>
                </el-tooltip>
                <label v-else>{{td[f.field] || '——'}}</label>
              </span>
            </td>
            <td v-if="operatable" class="text-nowrap align-middle text-center">
              <slot name="operationColumn" :data="td"></slot>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="(!fields || !fields.length || !tableData || !tableData.length)" class="emptyDataTr">暂无数据</p>
    </div>
    <div v-if="fields && fields.length && tableData && tableData.length" class="row d-flex justify-content-center">
      <el-pagination
        small
        background
        :page-size="pageSize"
        :hide-on-single-page="hideSinglePage"
        layout="total, prev, pager, next"
        :total="totalRecordCount"
        @current-change="currentChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import QrLogo from '@/assets/images/xdf_logo.png'
import TheLink from '@/components/CreateQrCode'
import TheEdit from '@/components/Ele_EditDialog'

export default {
  name: 'BT_Table',

  components: {
    TheLink,
    TheEdit
  },

  props: {
    /**
     * label: 标题
     * field: 对应的字段
     * type: 类型 money(人民币), date(日期), datetime(日期时间), select(选择框), relative(关联列), boolean(switch - 开关, tag - Y/N), image(上传图片), qrcode(二维码), template(模板列)
     * options(type === 'select'): {label: '', value: ''}
     * hidden: 隐藏列
     * disEdit: 不可编辑列(不显示)
     * readonly：只读列(显示, 不可编辑)，
     * parentField(type === 'relative'): 相关联的父项字段; relativeValue: 相关联的父项字段值
     */
    fields: {
      type: [Array],
      default: () => {
        return [] // label; field
      }
    },

    tableData: {
      type: [Array],
      default: () => {
        return []
      }
    },

    totalRecordCount: {
      type: [String, Number],
      default: 0
    },

    hideSinglePage: {
      type: [Boolean],
      default: false
    },

    operatable: {
      type: [Boolean],
      default: true
    },

    editConfig: {
      type: [Object],
      default: () => {
        return {
          title: '编辑',
          fieldObjArray: [],
          validations: {}
        }
      }
    },

    firstIndexType: {
      type: [String],
      default: ''
    },

    pageSize: {
      type: [Number],
      default: 15
    },

    trStyle: {
      type: Function
    }
  },

  data () {
    return {
      QrLogo,
      switchWidth: 32,
      tableHeaderCheckboxIsChecked: false,
      theTableData: [],
      selectedRowData: []
    }
  },

  mounted () {
    let btnsEle = document.getElementById('btnsQuery')
    let tableEle = document.getElementById('tableContentView')

    tableEle.style.height = `${(window.innerHeight - (btnsEle ? btnsEle.clientHeight : 0) - 60)}px`
    tableEle.style.overflowY = 'auto'
  },

  created () {
    this.theTableData = this.tableData
  },

  methods: {
    // 首个字段为Link
    goChildLink (field, data) {
      this.$emit('colLink', {field, data})
    },

    colSwitch (row, index) {
      this.$emit('colSwitch', {data: row, index: index})
    },

    // 文件预览
    viewFile (filePath) {
      // 微软提供的文件预览模块
      window.open('https://view.officeapps.live.com/op/view.aspx?src=' + filePath)
    },

    // utils Fun.
    formateDateTime (dateValue, dateString = 'YYYY-MM-DD HH:mm:ss') {
      if (moment(dateValue).isValid()) {
        return moment(dateValue).format(dateString)
      } else {
        return 'Invalid Date'
      }
    },

    formateDate (dateValue, dateString = 'YYYY-MM-DD') {
      if (moment(dateValue).isValid()) {
        return moment(dateValue).format(dateString)
      } else {
        return 'Invalid Date'
      }
    },

    // page change.
    currentChange (page) {
      this.$emit('pageQueryTable', page)
    },

    // table row is checked
    tableRowChecked (rowData) {
      if (rowData.isChecked) {
        this.selectedRowData.push(rowData)
      } else {
        this.selectedRowData.pop(
          this.selectedRowData.find(x => x.QRCodeNo === rowData.QRCodeNo)
        )
      }

      // 当行checked => 整列是否checked.
      this.tableHeaderCheckboxIsChecked =
        this.selectedRowData.length === this.theTableData.length

      this.$emit(
        'selectionChange',
        this.deleteJsonDataFields(this.selectedRowData)
      )
    },

    changeHeaderCheckbox (isChecked) {
      this.theTableData = this.toggleTableDataChecked(
        isChecked,
        this.theTableData
      )

      if (isChecked) {
        this.$emit(
          'selectionChange',
          this.deleteJsonDataFields(this.theTableData)
        )
      } else {
        this.selectedRowData = []
        this.tableHeaderCheckboxIsChecked = false
        this.$emit('selectionChange', [])
      }
    },

    // toggle table data isCheckd field
    toggleTableDataChecked (isCheckd, rowDatas) {
      if (!rowDatas || !rowDatas.length) return []

      let newTableData = []

      for (let row of rowDatas) {
        let newRow = {
          ...row
        }

        newRow.isChecked = isCheckd
        newTableData.push(newRow)
      }

      return newTableData
    },

    deleteJsonDataFields (data, field = 'isChecked') {
      if (!data || !data.length) return []

      let newData = []

      for (let d of data) {
        let newD = {
          ...d
        }

        delete newD[field]
        newData.push(newD)
      }

      return newData
    },

    setTrStyle (row, index) {
      return this.$props.trStyle({row, index})
    }
  },

  watch: {
    tableData (newValue, oldValue) {
      this.theTableData = newValue
      this.changeHeaderCheckbox(false)
    }
  }
}
</script>

<style lang="less" scoped>
.avater {
  width: 30px;
  border-radius: 50%;
}

.linkCol {
  cursor: pointer;
  color: #409eff;
  text-decoration: underline
}

.linkCol:hover {
  color: #1989fa;
}

.emptyDataTr {
  background-color: #E9ECEF;
  text-align: center;
  color: #495057;
  font-size: 14px;
  padding: 2px 0
}

.gQuery {
  position: absolute;
  background-color: #fff;
  width: 100%
}

#btnsQuery {
  position: absolute;
  top: 0;
  width: 95%;
  height: 32px;
  line-height: 32px;
}

.gTable {
  padding-top: 50px
}
</style>
