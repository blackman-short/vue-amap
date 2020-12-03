import moment from 'moment'

let Validator = {
  isPhoneNumber (phone) {
    let regExp = new RegExp(/^1(3|4|5|6|7|8|9)\d{9}$/)
    return regExp.test(phone)
  },

  isEmail (email) {
    let regExp = new RegExp(/^[a-zA-Z_0-9]+@xdf.cn$/)
    return regExp.test(email)
  },

  isDate (date) {
    const dateValue = new Date(date)
    return moment(dateValue.toISOString()).isValid()
  },

  isBoolean (data, bValues = ['Y', 'N']) {
    return bValues.indexOf(data.toUpperCase()) >= 0
  },

  isNumber (data) {
    const regEx = /^-?[1-9]\d*$/
    return regEx.test(data)
  },

  // 身份证号码、护照号码
  isCardId (data) {
    const regEx = /(^\d{9}$)|(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return regEx.test(data)
  },
  // svg 图标路径
  isExternal (path) {
    return /^(https?:|mailto:|tel:)/.test(path)
  }
}

export default Validator
