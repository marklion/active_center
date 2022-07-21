import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/icon.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

//点击选择图标的插件
import iconPicker from 'e-icon-picker'
import 'e-icon-picker/lib/index.css'
import 'e-icon-picker/lib/symbol.js'
Vue.use(iconPicker);

import moment from 'moment'
Vue.filter('formatDate', value => {
  return moment(value).format('YYYY-MM-DD');
});
Vue.filter('formatTime', value => {
  return moment(value).format('YYYY-MM-DD HH:mm:ss');
});
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// console.log(process.env.NODE_ENV);
// if (process.env.NODE_ENV === 'development') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }


// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

Vue.directive('permission', {
// 当被绑定的元素插入到 DOM 中时……
  inserted(el, binding, node) {
    const {      value    } = binding
    const roles = node.child.$route.meta.roles
    // if (roles.indexOf(value) >= 0) {
    //   return value
    // } else {
    //   el.parentNode && el.parentNode.removeChild(el)
    // } //使用方式： v-permission="'add'"

    if (value && value instanceof Array && value.length > 0) {
      const permissionRoles = value
      const hasPermission = roles.some(role => {
        return permissionRoles.includes(role)
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`使用方式： v-permission="['admin','editor']"`)
    }
  }
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
