<template>
  <div class="table-transform">
    <!-- 表格 -->
    <the-table
      :hideSinglePage="true"
      :fields="table.fields"
      :tableData="table.data"
      :trStyle="setTrBg">
      <!-- 首行操作栏 -->
      <template slot="aQuery">
        <p class="opBtns">
          <el-button type="success" size="mini" round @click="upload.visible = true">导入Excel</el-button>
          <el-button type="primary" size="mini" round @click="exportData">导出Excel</el-button>
          <el-button type="warning" size="mini" round @click="reFetchInfo">重新提取信息</el-button>
          <el-button type="info" size="mini" round @click="emptyExcel">清空表格</el-button>
        </p>
      </template>

      <!-- 表格操作列 -->
      <template slot="operationColumn" slot-scope="scope">
        <text-button type="edit" @click="editData(scope.data)"></text-button>
      </template>
    </the-table>

    <!-- 编辑 -->
    <the-edit
      :title="edit.title"
      :editModel="edit.model"
      :dialogVisible="edit.visible"
      :fieldObjArray="table.fields"
      @dialogCloseFun="edit.visible = false"
      @dialogEditSubmit="submitEdit">
    </the-edit>

    <!-- 上传 -->
    <the-upload
      :title="upload.title"
      :dialogVisible="upload.visible"
      :excelFieldsMapper="upload.excelFieldsMapper"
      @closeUploadFun="upload.visible = false"
      @transferImportData="handleImportData"></the-upload>
  </div>
</template>

<script>
import { ExcelUtil } from '@/utils'
import { mapState, mapActions } from 'vuex'

import TheTable from '@/components/BT_Table'
import TheUpload from '@/components/Ele_Upload'
import TheEdit from '@/components/Ele_EditDialog'
import TextButton from '@/components/Button/InnerBt'

var Export = ExcelUtil.Export

export default {
  name: 'KendoDemo',

  components: {
    TheEdit,
    TheTable,
    TheUpload,
    TextButton
  },

  computed: {
    ...mapState(['excelTable'])
  },

  data () {
    return {
      table: {
        fields: [
          { label: 'head_img', field: 'head_img', type: 'avatar', disEdit: true },
          { label: 'nick_name', field: 'nick_name' },
          { label: 'remark_name', field: 'remark_name' },
          { label: 'user_name', field: 'user_name' },
          { label: 'wxid', field: 'wxid' },
          { label: '手机号', field: 'phone' },
          { label: '实名', field: 'real_name' },
          { label: '商机类别', field: 'c_type' },
          { label: '线索来源', field: 'c_source' }
        ],

        data: []
      },

      edit: {
        title: '数据修改',
        visible: false,
        model: {}
      },

      upload: {
        title: '上传WeTool表格',
        visible: false,
        excelFieldsMapper: null
      },

      REG: {
        Phone: /((((13[0-9])|(15[^4])|(18[0,1,2,3,5-9])|(17[0-8])|(147))\d{8})|((\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}))?/g,
        Source: /地推|线上|市场/g,
        Type: /A|B|C|D|E/g
      },

      specialTyps: ['D', 'E']
    }
  },

  methods: {
    ...mapActions(['setExcelTable']),
    // 生成Field Mapper
    generateUploadFieldMapper () {
      let obj = {}

      let fields = this.table.fields.slice(0, this.table.fields.length - 2)

      for (let f of fields) {
        obj[f.label] = {
          field: f.field
        }
      }

      this.upload.excelFieldsMapper = obj
    },

    // 处理导入数据
    handleImportData (data) {
      let newList = []

      for (let d of data) {
        let needInfo = this.fetchNeedInfo(d.remark_name)
        newList.push({
          ...d,
          ...needInfo
        })
      }

      this.setExcelTable(newList)
    },

    // 导出
    exportData () {
      if (!this.table.data || !this.table.data.length) {
        this.showMessage('当前数据为空，请上传！', 'warning')
        return
      }
      var titles = this.table.fields.map(x => x.label)
      var fields = this.table.fields.map(x => x.field)
      var excelData = Export.formateData2Export(fields, this.table.data)
      Export.json2Excel(titles, excelData, '实名制数据')
    },

    // 编辑
    editData (data) {
      this.edit.visible = true
      this.edit.model = {...data}
    },

    // 提交编辑
    submitEdit (editData) {
      let newData = [...this.excelTable]
      let idx = newData.findIndex(x => x.head_img === editData.head_img)
      newData[idx] = editData
      this.handleImportData(newData)
      this.showMessage('编辑成功')
    },

    // 刷新表格数据
    refreshTableData () {
      this.table.data = this.excelTable
    },

    // 修改信息后
    reFetchInfo () {
      if (!this.excelTable || !this.excelTable.length) {
        this.showMessage('当前数据为空，请上传！', 'warning')
        return
      }
      this.handleImportData(this.excelTable)
      this.showMessage('信息提取成功')
    },

    // 清空缓存中ExcelData
    emptyExcel () {
      this.setExcelTable([])
    },

    fetchNeedInfo (value) {
      let phone = this.regMatch(value, this.REG.Phone, 11)

      // eslint-disable-next-line camelcase
      let c_source = this.regMatch(value, this.REG.Source)
      // eslint-disable-next-line camelcase
      let c_type = this.regMatch(value, this.REG.Type)
      // eslint-disable-next-line camelcase
      let real_name = this.fetchRegName(value)

      // 如果是 D/E 类线索， 且没有手机号
      if (this.specialTyps.includes(c_type) && !phone) {
        // eslint-disable-next-line camelcase
        real_name = value.substring(value.indexOf(c_type) + c_type.length).replace(this.REG.Source, '')
      }

      return {
        phone,
        c_source,
        c_type,
        real_name
      }
    },

    fetchRegName (value) {
      let realName = ''

      let phone = this.regMatch(value, this.REG.Phone)
      if (phone.length !== 11) return ''

      realName = value.substring(value.indexOf(phone) + phone.length).replace(this.REG.Source, '')
      return realName
    },

    regMatch (value, regValue, length) {
      let matchList = `${value}`.match(new RegExp(regValue))

      let mapValue = matchList ? (matchList.find(x => x !== '') || '') : ''

      if (length && mapValue.length !== length) {
        mapValue = ''
      }
      return mapValue
    },

    setTrBg ({row, index}) {
      if ((!row.phone || !row.real_name) && !this.specialTyps.includes(row.c_type)) {
        return {
          backgroundColor: 'rgba(214,15,15, .3)',
          color: '#D60F0F'
        }
      }
    }
  },

  watch: {
    table: {
      handler: 'generateUploadFieldMapper',
      immediate: true
    },

    excelTable: {
      handler: 'refreshTableData',
      immediate: true,
      deep: true
    }
  }
}
</script>

<style lang="stylus" scoped>
.table-transform
  width 95%
  margin 0 auto
  .opBtns
    margin 8px 0
    text-align right
</style>
