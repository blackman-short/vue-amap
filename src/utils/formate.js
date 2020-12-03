import moment from 'moment'
import uuidv1 from 'uuid/v1'

/**
 * 格式化时间
 * @param {String} date 时间
 * @param {String} formateString 格式
 */
function formatDate (date, formateString = 'YYYY-MM-DD HH:mm:ss') {
  return moment(date).format(formateString)
}

/**
 * 获取当前时间
 * @param {String} formateString 格式
 */
function getCurrentDate (formateString = 'YYYY-MM-DD HH:mm:ss') {
  return moment().format(formateString)
}

/**
 * 生成UUID
 */
function generateUUID () {
  return uuidv1()
}

/**
 * 格式化数值
 * @param {String} value 值
 * @param {Number} numberBits 小数点位数
 */
function fixedDecimalBits (value, numberBits = 2) {
  return (Number(value) * 100).toFixed(2)
}

/**
 * 格式化导入错误信息
 * @param {Number} index 下标
 * @param {String} field 字段
 * @param {String} value 值
 * @param {String} msg 错误信息
 */
function generateImportErrorMsg (index, field, value, msg = '') {
  return `第${index}行 【${field}】值【${value}】不合法！${msg}`
}

/**
 * 清除空格
 * @param {String} value
 */
function clearWhiteSpace (value) {
  return value.toString().replace(/ /g, '')
}

function formatAddTargtTime (numb, format) {
  const time = new Date((numb - 1) * 24 * 3600000 + 1)
  time.setYear(time.getFullYear() - 70)
  const year = time.getFullYear() + ''
  const month = time.getMonth() + 1 + ''
  const date = time.getDate() + ''
  if (format && format.length === 1) {
    return year + format + month + format + date
  }
  return year + (month < 10 ? '0' + month : month) + (date < 10 ? '0' + date : date)
}

/**
 * 中文排序
 * @param {String} param1 比较参数1
 * @param {String} param2 比较参数2
 */
function zhCompare (param1, param2) {
  return param1.localeCompare(param2, 'zh-Hans-CN', { sensitivity: 'accent' })
}

/**
 * 格式化文件名，如果文件名称过长
 * @param {String} fileName 文件名
 */
function formateFileName (fileName, MAX = 30, START = 5, linkDot = '...') {
  if (!fileName) return ''

  let name = fileName.substring(fileName.lastIndexOf('/') + 1)

  if (name.length > MAX) {
    name = name.substring(0, START) + linkDot + name.substring(START + name.length - MAX)
  }
  return name
}

/**
 * 根据文件名匹配相应图标：excel/word/pdf
 * @param {String} fileName 文件名
 */
function mapFileType (fileName) {
  let icon = 'FileIcon'

  if (!fileName) return

  let fileType = fileName.substring(fileName.lastIndexOf('.') + 1)

  switch (fileType) {
    case 'doc':
    case 'docx':
    case 'dot':
    case 'dotx':
      icon = 'WordIcon'
      break
    case 'xls':
    case 'xlt':
    case 'xlsx':
      icon = 'ExcelIcon'
      break
    case 'pdf':
      icon = 'PdfIcon'
      break
    case 'ppt':
    case 'pot':
    case 'pps':
      icon = 'PptIcon'
      break
    default:
      break
  }

  return icon
}

export default {
  zhCompare,
  formatDate,
  mapFileType,
  generateUUID,
  getCurrentDate,
  formateFileName,
  clearWhiteSpace,
  fixedDecimalBits,
  formatAddTargtTime,
  generateImportErrorMsg
}
