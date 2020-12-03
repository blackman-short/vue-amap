import Convertor from './convertor'
import Formate from './formate'
import Validator from './validator'
import ExcelUtil from './excel'

export default function deepClone (source) { // 引用类型深拷贝
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

function storeLocalStorage (toStoreData, fieldName = 'funny') { // vuex持久化
  window.sessionStorage.setItem(fieldName, JSON.stringify(toStoreData))
}

export {
  Convertor,
  Formate,
  Validator,
  ExcelUtil,
  storeLocalStorage
}
