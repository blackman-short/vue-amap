<template>
  <div class="self-upload-dialog">
    <el-dialog :title="title" :visible.sync="isShowUploadDialog" @close="handleDialogClose" :close-on-click-modal="false">
      <p class="font-size-12 m-bottom8">请上传Excel文件:</p>
      <el-upload class="uploadDemo" drag accept=".xls,.xlsx"
        :file-list="importFiles"
        :ref="uploadRef"
        :limit="1"
        :multiple="false"
        :auto-upload="false"
        :action="uploadRequestUrl"
        :http-request="httpRequestFun"
        :on-change="importChangeFun"
        :on-remove="removeImportFun"
        :on-success="uploadSuccess"
        :on-error="errorImportFun">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传[xls/xlsx]文件</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="dialogConfigCancel" size="small" plain>取 消</el-button>
        <el-button type="primary" @click="importSubmitFunc" size="small"
        :disabled="!importFiles || !importFiles.length"
        :title="(!importFiles || !importFiles.length) ? '请先上传文件' : ''">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { Formate, ExcelUtil, Validator } from '@/utils'

export default {
  name: 'UploadDialog',

  props: {
    title: {
      type: String,
      default: '上传文件'
    },

    uploadRequestUrl: {
      type: String,
      default: ''
    },

    dialogVisible: {
      type: Boolean,
      default: false
    },

    /**
     * {
     *    姓名: {
     *      field: 'name',
     *      isRequired: true/false,
     *      type: email/mobile/number/boolean/date/cardid,
     *      valueMapper: (type === boolean) ['是', '否']
     *    }
     * }
     */

    excelFieldsMapper: {
      type: Object,
      default: () => {
        return null
      }
    }
  },

  computed: {
    uploadRef () {
      return `uploadRef-${Formate.generateUUID()}`
    }

  },

  data () {
    return {
      importFiles: [],
      importEntityList: [],
      isShowUploadDialog: false,
      DataType: {
        Email: 'EMAIL',
        Mobile: 'MOBILE',
        Number: 'NUMBER',
        Boolean: 'BOOLEAN',
        Date: 'DATE',
        CardId: 'CARDID' // 身份证号
      }
    }
  },

  created () {
    this.isShowUploadDialog = false
  },

  methods: {
    ...mapActions(['setLoading']),
    handleDialogClose () {
      this.$refs[this.uploadRef].clearFiles()
      this.$emit('closeUploadFun', false)
    },

    dialogConfigCancel () {
      this.$emit('closeUploadFun', false)
    },

    importChangeFun (file, fileList) {
      this.importFiles = fileList
    },

    removeImportFun (file, fileList) {
      this.importFiles = fileList
    },

    errorImportFun (error, file, fileList) {
      this.setLoading(false)
      this.NotifyError('上传错误。。。')
      console.log(error)
    },

    uploadSuccess (response, file, fileList) {
      console.log(response)
      this.isShowUploadDialog = false
    },

    async httpRequestFun (fileContent) {
      if (this.excelFieldsMapper) {
        this.setLoading(true)
        const excelTitleFields = Object.keys(this.excelFieldsMapper)

        const excelJsonData = await ExcelUtil.File2Json(fileContent.file, excelTitleFields, 'Sheet1')
        console.log('start validate')
        const validate = this.validateExcelData(excelJsonData)
        console.log('end validate')
        console.log('validate: ' + validate.isRight)
        if (!validate.isRight) {
          this.setLoading(false)
          this.NotifyError(validate.msg)
          return
        }

        const importJsonData = this.exchangeFieldkeyZh2En(excelJsonData)
        console.log('------- 数据转化成功 --------')
        this.setLoading(false)
        this.isShowUploadDialog = false
        this.$emit('transferImportData', importJsonData)
      }
    },

    importSubmitFunc () {
      // this.isShowUploadDialog = false

      if (!this.excelFieldsMapper) {
        this.setLoading(false)
        this.NotifyError('导入数据无匹配实体，请联系IT人员！')
        return
      }

      this.$refs[this.uploadRef].submit()
    },

    validateExcelData (excelJsonData) {
      console.log(excelJsonData)
      let validateResult = {
        isRight: true,
        msg: ''
      }

      if (!excelJsonData || !excelJsonData.length) {
        this.setLoading(false)
        validateResult = {
          isRight: false,
          msg: '导入数据为空，请检查Excel文件以及【SheetName】是否为【Sheet1】？'
        }

        return validateResult
      }

      for (let i = 0; i < excelJsonData.length; i++) {
        const data = excelJsonData[i]
        const keys = Object.keys(this.excelFieldsMapper)
        for (let key of keys) {
          // validate type
          const fieldObj = this.excelFieldsMapper[key]
          const validateValue = data[key] ? data[key].toString().trim() : ''
          if (fieldObj.isRequired && !validateValue) {
            validateResult = {
              isRight: false,
              msg: Formate.generateImportErrorMsg(i + 1, key, '空', '[必填参数]')
            }
            return validateResult
          }

          if (validateValue && fieldObj.type) {
            const fieldType = fieldObj.type.toUpperCase()
            if (fieldType === this.DataType.Mobile && !Validator.isPhoneNumber(validateValue)) {
              validateResult = {
                isRight: false,
                msg: Formate.generateImportErrorMsg(i + 1, key, validateValue, '[手机号]')
              }
              return validateResult
            }

            if (fieldType === this.DataType.Email && !Validator.isEmail(validateValue)) {
              validateResult = {
                isRight: false,
                msg: Formate.generateImportErrorMsg(i + 1, key, validateValue, '[员工邮箱]')
              }
              return validateResult
            }

            if (fieldType === this.DataType.Date && !Validator.isDate(validateValue)) {
              validateResult = {
                isRight: false,
                msg: Formate.generateImportErrorMsg(i + 1, key, validateValue, '[时间]')
              }
              return validateResult
            }

            if (fieldType === this.DataType.Boolean && !Validator.isBoolean(validateValue, fieldObj.valueMapper)) {
              if (!fieldObj.valueMapper) fieldObj.valueMapper = ['Y', 'N']

              if (!Validator.isBoolean(validateValue, fieldObj.valueMapper)) {
                validateResult = {
                  isRight: false,
                  msg: Formate.generateImportErrorMsg(i + 1, key, validateValue, `[${fieldObj.valueMapper[0]} & ${fieldObj.valueMapper[1]}]`)
                }
                return validateResult
              }
            }

            if (fieldType === this.DataType.CardId && !Validator.isCardId(validateValue)) {
              validateResult = {
                isRight: false,
                msg: Formate.generateImportErrorMsg(i + 1, key, validateValue, '[身份证号]')
              }
              return validateResult
            }
          }
        }
      }

      return validateResult
    },

    exchangeFieldkeyZh2En (dataList) {
      if (!dataList || !dataList.length) return []

      let newList = []
      for (let item of dataList) {
        newList.push(this.generateEnObjAccordingToKeys(item, this.excelFieldsMapper))
      }

      return newList
    },

    generateEnObjAccordingToKeys (item, fieldMapper) {
      let newObj = {}

      const itemKeys = Object.keys(item)
      for (let key of itemKeys) {
        if (fieldMapper[key]) {
          newObj[fieldMapper[key].field] = Formate.clearWhiteSpace(item[key])
        }
      }

      return newObj
    },

    setIsShowUploadDialog () {
      this.isShowUploadDialog = this.dialogVisible
    }
  },

  watch: {
    dialogVisible: {
      handler: 'setIsShowUploadDialog',
      immediate: true
    }
  }
}
</script>

<style>
.self-upload-dialog .el-dialog {
  width: 50% !important;
  min-width: 360px !important;
  max-width: 550px !important;
  border-radius: .25rem
}

.el-upload {
  width: 100% !important;
}

.el-upload-dragger {
  width: 85% !important;
  margin: 0 auto
}

.self-upload-dialog .el-dialog__body {
  padding:  0 !important;
  text-align: center !important;
}

.self-upload-dialog .el-dialog__header, .el-dialog__footer {
  padding: .875rem
}
</style>
