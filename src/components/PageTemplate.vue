<template>
  <div class="g_page_template">
    <g-table
      :operatable="operatable"
      :firstIndexType="firstIndexType"
      :fields="displayFields"
      :tableData="tableResult.data"
      :pageSize="defaultQuery.Limit"
      :totalRecordCount="tableResult.totalCount"
      @colLink="colLink"
      @colSwitch="colSwitch"
      @pageQueryTable="opSearch"
      @selectionChange="tableSelectChange"
    >
      <!-- 查询条件 -->
      <template slot="aQuery">
        <div class="g_query display-flex">
          <div class="g_query_left">
            <div v-for="enKey in queryKeys" :key="enKey" class="g_query_left_item">
              <el-select
                v-if="mapperActiveQuery(enKey).type === 'select'"
                v-model="activeQuery[enKey]"
                :placeholder="mapperActiveQuery(enKey).zh"
                :multiple="mapperActiveQuery(enKey).multiple"
                :collapse-tags="true"
                filterable
                clearable
              >
                <el-option
                  v-for="(op, idx) in mapperActiveQuery(enKey).options"
                  :key="idx"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>

              <el-date-picker
                v-else-if="['daterange', 'datetimerange'].includes(mapperActiveQuery(enKey).type)"
                v-model="activeQuery[enKey]"
                :type='mapperActiveQuery(enKey).type'
                :ange-separator="mapperActiveQuery(enKey).separator || '至'"
                :start-placeholder="mapperActiveQuery(enKey).zh + ' - 开始' || '开始日期'"
                :end-placeholder="mapperActiveQuery(enKey).zh + ' - 结束' || '结束日期'">
              </el-date-picker>

              <el-input
                v-else
                style="width: 150px;"
                v-model="activeQuery[enKey]"
                :placeholder="mapperActiveQuery(enKey).zh"
                clearable
              ></el-input>
            </div>
          </div>
          <div class="g_query_right">
            <g-button type="search" v-if="queryUrl && userHasControl('search')" @click="opSearch(1)"></g-button>
            <g-button type="delete" v-if="batchDeleteUrl && userHasControl('delete')" @click="opDelete"></g-button>
            <g-button type="import" v-if="uploadUrl && userHasControl('import')" @click="opImport"></g-button>
            <g-button type="export" v-if="exportExcelName && userHasControl('export')" @click="opExport"></g-button>
            <g-button type="new" v-if="newUrl && userHasControl('new')" @click="opNew"></g-button>
            <!-- extra operation btns -->
            <slot name="extraOp"></slot>
          </div>
        </div>
      </template>

      <!-- 操作列 -->
      <template slot="operationColumn" slot-scope="scope">
        <text-button type="edit" @click="colView(scope)"></text-button>
        <text-button type="delete" @click="colDelete(scope)"></text-button>
      </template>
    </g-table>

    <!-- Upload Excel-->
    <g-upload
      :title="'上传数据'"
      :dialogVisible="uploadDialogVisible"
      :excelFieldsMapper="uploadFieldsMapper"
      @closeUploadFun="uploadDialogVisible = false"
      @transferImportData="submitImport"
    ></g-upload>
    <!-- Upload Excel-->

    <!-- Edit Row Data -->
    <g-edit
      :title="editConfig.title"
      :editModel="editConfig.model"
      :dialogVisible="editConfig.dialogVisible"
      :fieldObjArray="editFields"
      :validations="formValidations"
      @dialogCloseFun="editConfig.dialogVisible = false"
      @dialogEditSubmit="submitColEdit"
    ></g-edit>
    <!-- Edit Row Data -->

    <!-- Download Table data -->
    <g-download
      :dialogVisible="downloadDialogVisible"
      @dialogCloseFun="downloadDialogVisible = false"
      @downloadCurrent="download"
      @downloadAll="download('all')"
    ></g-download>
    <!-- Download Table data -->
  </div>
</template>

<script>
// 组件
import GTable from '@/components/BT_Table'
import GUpload from '@/components/Ele_Upload'
import GDownload from '@/components/Ele_Export'
import GEdit from '@/components/Ele_EditDialog'
import GButton from '@/components/Button/OuterBt'
import TextButton from '@/components/Button/InnerBt'

import _ from 'lodash'
import { ExcelUtil } from '@/utils'
import Request from '@/services/request'

var Export = ExcelUtil.Export
export default {
  name: 'PageTemplate',
  components: {
    GEdit,
    GTable,
    GButton,
    GUpload,
    GDownload,
    TextButton
  },

  props: {
    firstIndexType: {
      type: [String],
      default: ''
    },

    operatable: {
      type: Boolean,
      default: true
    },

    // 用于记录页面操作
    operator: {
      type: [Object],
      default: () => {
        return {
          field: '',
          value: ''
        }
      }
    },
    // 首行查询实体
    query: {
      type: [Array],
      default: () => {
        return [
          {
            zh: '条件一',
            en: 'condition1'
          },
          {
            zh: '条件二',
            en: 'condition2'
          },
          {
            zh: '条件三',
            en: 'condition3'
          }
        ]
      }
    },

    // 表格配置：字段、pageSize、totalCount
    table: {
      type: [Object],
      default: () => {
        return {
          fields: []
        }
      }
    },

    // 上传Excel配置
    uploadUrl: {
      type: [String],
      default: ''
    },

    queryUrl: {
      type: [String],
      default: ''
    },

    newUrl: {
      type: [String],
      default: ''
    },

    editUrl: {
      type: [String],
      default: ''
    },

    deleteUrl: {
      type: [String],
      default: ''
    },

    batchDeleteUrl: {
      type: [String],
      default: ''
    },

    exportExcelName: {
      type: [String],
      default: ''
    },

    // 表单验证信息
    formValidations: {
      type: [Object],
      default: () => {
        return {}
      }
    },

    authControl: {
      type: Object,
      default: () => {
        // key: type-search/delete/import/export/new
        // value: users-[]
      }
    }
  },

  computed: {
    // 新增、编辑对应的字段
    editFields () {
      let fields = []
      for (let f of this.table.fields) {
        let newF = { ...f }
        // 表格字段 与 [新增、编辑]字段不一致
        if (newF.submitField) {
          newF.field = newF.submitField
          delete newF.submitField
        }
        fields.push(newF)
      }

      return fields
    },

    // 表格显示的字段
    displayFields () {
      return this.table.fields.filter(x => !x.hidden)
    },

    // 默认查询条件
    defaultQuery () {
      let conditions = {
        Limit: 20
      }

      let defaultValues = this.query.filter(x => x.hidden === true)
      defaultValues.forEach(x => {
        conditions[x.en] = x.value
      })

      return conditions
    },
    // 首行查询条件Keys
    queryKeys () {
      return Object.keys(this.activeQuery)
    },
    // 可否批量删除
    batchDeletable () {
      return this.tableSelections && this.tableSelections.length
    },

    // 上传Excel zh <=> en
    uploadFieldsMapper () {
      let obj = {}

      for (let f of this.table.fields) {
        let newF = _.cloneDeep(f)
        delete newF.label
        obj[f.label] = newF
      }

      return obj
    }
  },

  data () {
    return {
      tableSelections: [],
      activeQuery: {}, // 查询条件

      tableResult: {
        data: [],
        totalCount: 0
      },

      editConfig: {
        title: '数据详情',
        model: {},
        dialogVisible: false
      }, // 编辑dialog visible
      uploadDialogVisible: false, // 上传dialog visible
      downloadDialogVisible: false // 下载dialog visible
    }
  },

  async created () {
    this.activeQuery = this.organizeActiveQueryObj(this.query)
    await this.opSearch()
  },

  methods: {
    // 将传入的 [查询条件] => 查询{实体}
    organizeActiveQueryObj (arr = []) {
      let condition = {}
      let newArr = arr.filter(x => !x.hidden)
      if (newArr && newArr.length) {
        for (let obj of newArr) {
          // 如果字段名不存在
          if (!obj.zh || !obj.en) {
            this.showError('查询条件参数有误，请参照模板！')
            break
          } else if (condition[obj.zh]) {
            this.showError(`查询条件参数有误：Duplicate en_Key [${obj.zh}]！`)
          } else {
            condition[obj.en] = (obj.type === 'datetimerange' || (obj.type === 'select' && obj.multiple)) ? [] : ''
          }
        }
      }

      return condition
    },

    // 查找对应 en_Key 的 zn_Key
    mapperActiveQuery (enKey) {
      let findItem = this.query.find(x => x.en === enKey)

      return findItem || {}
    },

    /* 首行操作函数 */
    // 表格checkbox选中发生变化
    tableSelectChange (selections) {
      this.tableSelections = selections
      this.$emit('tableSelect', selections)
    },

    // 查询
    async opSearch (pageIndex = 1) {
      if (this.queryUrl) {
        // 查询条件trim()
        let qKeys = Object.keys(this.activeQuery)
        qKeys.forEach(key => {
          this.activeQuery[key] = typeof (this.activeQuery[key]) === 'string' ? this.activeQuery[key].trim() : this.activeQuery[key]
        })

        let response = await Request.post(this.queryUrl, {
          ...this.activeQuery,
          ...this.defaultQuery,
          Page: pageIndex
        })

        console.log(response)

        if (response && !response.resultCode) {
          if (response.data) {
            this.tableResult.data = response.data.List
            this.tableResult.totalCount = response.data.TotalCount
          } else {
            this.tableResult.data = response.List
            this.tableResult.totalCount = response.TotalCount
          }
        } else {
          this.showMessage('加载数据出错。。。', 'error')
        }
      }

      this.$emit('opSearch', this.activeQuery)
    },

    // 新增
    opNew () {
      this.editConfig.title = '新增数据'
      this.editConfig.operation = 'new'
      this.editConfig.model = {}
      this.editConfig.dialogVisible = true
    },

    // 新增提交
    async submitNew (data) {
      let reqData = { ...data }

      if (this.operator && this.operator.field) {
        reqData[this.operator.field] = this.operator.value
      }

      let response = await Request.post(this.editUrl, reqData)
      if (response && !response.resultCode) {
        await this.opSearch()
        this.showMessage('新增成功！')
      }
    },

    // 批量删除
    async opDelete () {
      if (!this.tableSelections.length) {
        this.showWarning('请选中要删除的项！')
        return
      }

      let deleteFields = this.query.filter(x => x.delete)
      if (deleteFields && deleteFields.length) {
        let field = deleteFields[0].en
        let delField = deleteFields[0].deleteField
        let deleteIds = this.tableSelections.map(x => x[delField])
        let reqData = {}
        reqData[field] = deleteIds
        console.log(reqData)
        let response = await Request.post(this.batchDeleteUrl, reqData)
        console.log(response)
        if (response && !response.resultCode) {
          await this.opSearch()
          this.showMessage('删除成功！')
        } else {
          this.showMessage('删除失败！', 'error')
        }
      } else {
        this.showMessage('缺少批量删除的对应字段', 'error')
      }
    },

    // 导入 1. 导入框弹出, 上传Excel
    opImport () {
      this.uploadDialogVisible = true
    },

    // 导入 2. 提交数据
    async submitImport (excelData) {
      if (this.uploadUrl) {
        if (this.operator && this.operator.field) {
          for (let d of excelData) {
            d[this.operator.field] = this.operator.value
          }
        }
        let response = await Request.post(this.uploadUrl, excelData)
        if (response &&
        !response.resultCode &&
        (response.data.hasOwnProperty('IsSuccess') ? response.data.IsSuccess : true)) {
          await this.opSearch()
          this.showMessage('数据导入成功！')
        } else {
          this.showMessage(`[导入失败]：${response.data.Message}`, 'error')
        }
      }
    },

    // 导出
    opExport () {
      this.downloadDialogVisible = true
      this.$emit('opExport')
    },

    // 执行导出
    async download (tag) {
      let downloadData = []
      var titles = this.table.fields.map(x => x.label)
      var fields = this.table.fields.map(x => x.field)

      if (tag === 'all') {
        let response = await Request.post(this.queryUrl, {
          ...this.activeQuery,
          ...this.defaultQuery,
          Page: 1,
          Limit: this.tableResult.totalCount
        })

        if (response && !response.resultCode) {
          if (response.data) {
            downloadData = response.data.List
          } else {
            downloadData = response.List
          }
        }
      } else {
        downloadData = this.tableResult.data
      }

      let excelData = Export.formateData2Export(fields, downloadData)
      if (downloadData.length > 50000) {
        this.showWarning('本次导出数据量大于 5W 条, 请联系 IT 老师，后台导出！',
          () => {
            this.showMessage('已取消导出操作', 'info')
          }, () => {

          })
      } else {
        Export.json2Excel(titles, excelData, this.exportExcelName)
      }
    },

    /* 表格操作函数 */

    // 查看详情
    colView (row) {
      this.editConfig.title = '数据详情'
      this.editConfig.operation = 'edit'

      // this.editConfig.model = {...row.data}
      this.editConfig.model = this.convertTable2EditDialog(row.data)
      this.editConfig.dialogVisible = true
      this.$emit('colView')
    },

    // table model => edit model
    convertTable2EditDialog (rowData) {
      let editModel = {}

      for (let f of this.table.fields) {
        if (f.submitField) {
          editModel[f.submitField] = rowData[f.field]
        } else {
          editModel[f.field] = rowData[f.field]
        }
      }

      return editModel
    },

    async submitColEdit (data) {
      if (this.editConfig.operation === 'new') {
        this.submitNew(data)
        return
      }

      delete data.isChecked
      if (this.editUrl) {
        let reqData = { ...data }

        if (this.operator && this.operator.field) {
          reqData[this.operator.field] = this.operator.value
        }

        // 验证表单信息

        let response = await Request.post(this.editUrl, reqData)
        if (response && !response.resultCode) {
          await this.opSearch()
          this.showMessage('修改成功！')
        }
      }

      this.$emit('colEdit')
    },

    // switch 开、关
    async colSwitch ({ data, index }) {
      this.editConfig.operation = 'edit'
      await this.submitColEdit(data)
    },

    // 链接类型字段 => operation
    colLink ({ field, data }) {
      this.$emit('colLink', { field, data })
    },

    // 删除行数据
    colDelete (row) {
      if (!this.deleteUrl) return

      this.showWarning('确定删除该数据？', () => {
        let reqUrl = this.deleteUrl + row.data.F_Id
        Request.get(reqUrl).then((response) => {
          if (response && !response.resultCode) {
            this.opSearch().then(() => {
              this.showMessage('删除成功！')
            })
          }
        })

        this.$emit('colDelete')
      }, () => {
        console.log('cancel delete...')
      })
    },

    // 权限控制
    userHasControl (operate = '') {
      // 没有配置权限
      if (!this.authControl ||
      !Object.keys(this.authControl).length ||
      !this.operator ||
      !this.authControl.hasOwnProperty(operate) ||
      !operate) return true

      return this.authControl[operate] &&
        this.authControl[operate].length &&
        this.authControl[operate].filter(x => x !== '').includes(this.operator.value)
    }
  }
}
</script>

<style lang="stylus" scoped>
.g_query
  &_left
    width 80%
    display flex
    align-items center
    flex-wrap wrap
    &_item
      margin-right 4px
      margin-bottom 4px
      >>>.el-select--mini
        width 150px
  &_right
    width 20%
    text-align right
    button
      margin-bottom 4px
</style>
