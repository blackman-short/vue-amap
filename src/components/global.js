import Vue from 'vue'

function capitalizeFirstLetter (string = '') {
  return string.charAt(0).toUpperCase() + string.slice(0)
}

let requireComponent = require.context('.', false, /\.vue$/)

requireComponent.keys().forEach(fileName => {
  let componentConfig = requireComponent(fileName)

  let componentName = capitalizeFirstLetter(fileName.replace(/^\.\//, '').replace(/\.\w+$/, ''))
  Vue.component(componentName, componentConfig.default || componentConfig)
})
