<template>
  <div :id="elementId" class="g-edit-dialog">
    <el-dialog :title="title" :visible.sync="showDialog" @close="handleDialogClose" @opened="handleDialogOpen" :close-on-click-modal="false">
      <el-form style="margin-top:4px" :model=" localEditModel" :rules="formValidations" :ref="refFormName">
        <p v-for="(item, index) of fieldObjArray" :key="index">
          <el-form-item v-if="item.type !== 'template' && !item.disEdit" :prop="item.field">
            <!-- Boolean 类型 -->
            <div v-if="item.type === 'switch' || item.type === 'boolean'" class="text-align-l g_prepend">
              <p class="switch-label" style="margin-right: 8px">{{item.label}}</p>
              <el-switch v-model=" localEditModel[item.field]"
              :active-value="item.valueMapper[0]" :inactive-value="item.valueMapper[1]"
              active-color="#67C23A" inactive-color="#909399"
              :active-text="item.activeText" :inactive-text="item.inActiveText"></el-switch>
            </div>
            <!-- 下拉框选项 -->
            <div v-else-if="item.type === 'select'" class="text-align-l g_prepend">
              <p class="switch-label">{{item.label}}</p>
              <el-select @change="(value) => optionSelectChange(item, value)"
                v-model="localEditModel[item.field]"
                :placeholder="item.placeholder || ''"
                :multiple="item.multiple" filterable clearable>
                <el-option v-for="(option, index) of item.options"
                :key="index"
                :label="option.label"
                :value="option.value ? option.value : option.label"></el-option>
              </el-select>
              <span class="endWithNotice"> {{item.noticeMsg ? ' * ' + item.noticeMsg : ''}}</span>
            </div>
            <!-- 日期类型 -->
            <div v-else-if="item.type === 'date'" class="text-align-l g_prepend">
              <p class="switch-label">{{item.label}}</p>
              <el-date-picker v-model=" localEditModel[item.field]" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" ></el-date-picker>
            </div>
            <!-- 日期时间类型 -->
            <div v-else-if="item.type === 'datetime'" class="text-align-l g_prepend">
              <p class="switch-label">{{item.label}}</p>
              <el-date-picker v-model=" localEditModel[item.field]" type="datetime" value-format="yyyy-MM-dd" placeholder="选择日期" ></el-date-picker>
            </div>

            <!-- 关联属性，由其父项值决定 -->
            <div v-else-if="item.type === 'relative'" class="text-align-l">
              <p v-show=" localEditModel[item.parentField] === item.relativeValue">
                <el-input v-model=" localEditModel[item.field]" :placeholder="item.placeholder || ''">
                  <template slot="prepend">{{item.label}}</template>
                </el-input>
              </p>
            </div>

            <!-- 日期时间类型 -->
            <div v-else-if="item.type === 'textarea'" class="text-align-l g_prepend">
              <p class="switch-label">{{item.label}}</p>
              <el-input type="textarea" v-model=" localEditModel[item.field]" :placeholder="item.placeholder || ''" :maxlength="item.maxlength" show-word-limit autosize>
                <template slot="prepend">{{item.label}}</template>
              </el-input>
            </div>

            <!-- 上传文件 -->
            <p v-else-if="item.type === 'file'" class="text-align-l">
              <!-- <span class="switch-label">{{item.label}}</span> -->
              <el-upload
                :multiple="false"
                :limit="1"
                class="upload-demo"
                :action="item.uploadUrl"
                :on-change="uploadFileChange"
                :on-success="(response, file, fileList) => uploadFileSuccess(item.field, response)"
                :on-remove="(file, fileList) => removeFile(item.field, file, fileList)"
                :file-list="uploadFiles">
                <el-button size="mini" type="primary" icon="el-icon-upload" :disabled="uploadFiles && uploadFiles.length >= 1">{{item.label}}</el-button>
                <div slot="tip" class="el-upload__tip" style="margin-top: 0">{{item.noticeMsg}}</div>
              </el-upload>
            </p>

            <div v-else-if="item.type === 'upload'" class="text-align-l">
              <span class="switch-label">{{item.label}}</span>
              <span>
                <el-upload class="avatar-uploader"
                  action="http://stsuzhou.xdf.cn/StuInfoManagement/QRCode/UploadMock"
                  :show-file-list="false"
                  :on-success="handleSuccessUpload"
                  :before-upload="validateUploadImg">
                  <i title="上传图片" class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
              </span>
              <div v-if="uploadImgList && uploadImgList.length" class="avaterList">
                <span class="display-flex-center" v-for="(img, index) in uploadImgList" :key="index">
                  <the-img @delImg="delImg" :imgSrc="img"></the-img>
                </span>
              </div>
            </div>

            <el-input v-else v-model=" localEditModel[item.field]" :placeholder="item.placeholder || ''" :readonly="item.readonly">
              <template slot="prepend">{{item.label}}</template>
              <template v-if="item.type === 'money'" slot="append">￥</template>
            </el-input>
          </el-form-item>
        </p>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" @click="handleDialogClose" size="small" plain>取 消</el-button>
        <el-button type="primary" @click="handleDialogSubmit" size="small">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TheImg from '@/components/Img'
import { Formate } from '@/utils'

export default {
  name: 'GEditDialog',

  components: {
    TheImg
  },

  props: {
    title: {
      type: String,
      default: 'This is a title'
    },

    titleTextAlign: {
      type: String,
      default: 'left'
    },

    fieldObjArray: {
      type: Array,
      default: () => {
        return [
          {
            label: '姓名',
            field: 'userName'
          },
          {
            label: '年龄',
            field: 'age'
          }
        ]
      }
    },

    editModel: {
      type: Object,
      default: () => {
        return {
          userName: 'tom',
          age: 20
        }
      }
    },

    validations: {
      type: [Object],
      default: () => {
        return {}
      }
    },

    dialogVisible: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      showDialog: false,
      localEditModel: {}, // 本地编辑实体
      // 上传文件的文件列表
      uploadFiles: [],
      // 上传图片的列表
      uploadImgList: []
    }
  },

  computed: {
    elementId () {
      return Formate.generateUUID()
    },

    refFormName () {
      return `Form-${this.elementId}`
    },

    formValidations () {
      if (this.validations) {
        return this.validations
      } else {
        let rules = {}
        for (let f of this.fieldObjArray.fields) {
          let trigger = ['select', 'date', 'datetime', 'file'].includes(f.type) ? 'change' : 'blur'
          // 可为空
          if (!f.nullable) {
            rules[f.field] = [{ required: true, message: `请输入[${f.label}]！`, trigger: trigger }]
          }
        }

        return rules
      }
    }
  },

  methods: {
    // 打开编辑框
    handleDialogOpen () {
      this.$refs[this.refFormName].clearValidate()
    },

    // 关闭编辑框
    handleDialogClose () {
      this.showDialog = false
      this.localEditModel = {...this.editModel}
      this.filterUploadImgList(this.editModel)
      this.$refs[this.refFormName].clearValidate()
      this.$emit('dialogCloseFun', false)
    },

    // 提交编辑框
    handleDialogSubmit () {
      this.$refs[this.refFormName].validate(isRight => {
        if (!isRight) {
          return
        }

        // 上传的图片
        const imgUpload = this.fieldObjArray.find(x => x.type === 'upload')
        if (imgUpload && imgUpload.field) {
          this.localEditModel[imgUpload.field] = this.uploadImgList
          if (!this.localEditModel[imgUpload.field]) {
            this.showMessage('文件正在上传，请稍后...', 'warning')
            return
          }
        }

        this.showDialog = false
        this.$emit('dialogCloseFun', false)
        this.$emit('dialogEditSubmit', this.localEditModel)
      })
    },

    // field.type === 'select', option change event.
    optionSelectChange (field, value) {
      if (field.relativeSelectField) {
        let childSelect = this.fieldObjArray.find(x => x.field === field.relativeSelectField)
        if (childSelect) {
          childSelect.options = childSelect.optionsObj[value]
        }
      }
    },

    // 上传文件
    uploadFileChange (file, fileList) {

    },

    // 删除上传文件
    removeFile (field, file, fileList) {
      this.uploadFiles = []
      this.localEditModel[field] = ''
    },

    // 上传文件请求成功
    uploadFileSuccess (field, response) {
      console.log(response)
      if (response === '上传的文件格式不是文档') {
        this.uploadFiles = []
        this.showMessage('请上传word文件！', 'error')
        return
      }
      this.localEditModel[field] = response
      this.$refs[this.refFormName].clearValidate(field)
    },

    // Map uploadFiles: 暂支持单个文件字段
    mapUploadFiles () {
      let f = this.fieldObjArray.find(x => x.type === 'file')
      if (f && f.field) {
        let value = this.localEditModel[f.field]
        if (!value) return
        let fileName = value.substring(value.lastIndexOf('/') + 1, value.length)
        this.uploadFiles = [
          { name: fileName, url: value }
        ]
      }
    },

    handleSuccessUpload (response, file, fileList) {
      const self = this
      var r = new FileReader() // 本地预览
      r.onload = function () {
        if (self.uploadImgList.indexOf(r.result) < 0) {
          self.uploadImgList.push(r.result)
        }
      }
      r.readAsDataURL(file.raw)
    },

    validateUploadImg (file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
        return false
      }
      return isJPG && isLt2M
    },

    delImg (img) {
      this.uploadImgList.pop(img)
    },

    // set uploadImgList
    filterUploadImgList (model) {
      const imgUpload = this.fieldObjArray.find(x => x.type === 'upload')
      if (imgUpload && model[imgUpload.field]) {
        this.uploadImgList = [...model[imgUpload.field]]
      } else {
        this.uploadImgList = []
      }
    }
  },

  watch: {
    dialogVisible (newValue) {
      this.showDialog = newValue
      if (newValue) {
        this.localEditModel = {...this.editModel}
        this.mapUploadFiles()
        this.filterUploadImgList(this.editModel)
      } else {
        this.uploadFiles = []
      }
    }
  }
}
</script>

<style>
.g-edit-dialog .el-dialog {
  width: 50% !important;
  min-width: 460px !important;
  max-width: 550px !important;
  border-radius: .25rem
}

.g-edit-dialog .el-dialog .el-dialog__header {
  text-align: left
}

.g-edit-dialog .el-dialog .el-dialog__body {
  width: 80%;
  max-height: 35rem;
  margin: 0 auto;
  padding: 0 20px 0 0;
  overflow: auto;
}

.g-edit-dialog .switch-label {
  background-color: #F5F7FA;
  border: 1px solid #DCDFE6;
  border-radius: 4px 0 0 4px;
  padding: 0 20px;
  color: #909399;
  line-height: 26px;
  height: 26px;
  min-width: 50px;
}

.g_prepend {
  font-size: 12px;
  display: flex;
}

.g-edit-dialog .el-switch__label .is-active {
  color: #409eff;
}

.g-edit-dialog .el-dialog .el-dialog__body .el-form .el-form-item .el-form-item__content>p{
  margin: 0 !important
}

.endWithNotice {
  font-size: 12px;
  color: #E6A23C
}

.upload-demo {
  border: 1px solid #F5F7FA;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 7px 4px #F5F7FA;
}

.avatar-uploader {
  display: inline-block !important;
}

.avatar-uploader .el-upload {
  cursor: pointer;
}

.avatar-uploader-icon {
  color: #8c939d;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
}

.avatar-uploader-icon:hover {
  font-weight: bold;
  color: #00896C
}

.avatar {
  width: 40px;
  margin: 0 .25rem;
  display: block;
}

.avaterList {
  display: flex;
  align-items: center;
  margin-top: .5rem;
  padding: .5rem;
  border: 1px dashed #00896C;
}
</style>
