import Vue from 'vue'
import Router from 'vue-router'

const Index = () => import('@/views/index')
const Home = () => import('@/views/home')
const ChartDemoIndex = () => import('@/views/chartDemo/index')
const ChartDemoTrans = () => import('@/views/chartDemo/transform')

const KendoDemoIndex = () => import('@/views/kendoUIDemo/index')
const KendoDemoUI = () => import('@/views/kendoUIDemo/ui')

const TableIndex = () => import('@/views/excelTable/index')
const TableTransform = () => import('@/views/excelTable/transform')
const TableTransform2 = () => import('@/views/excelTable/transform2')

const CreateQrCode = () => import('@/views/qrCode/index')

const TestPage = () => import('@/views/Test')

Vue.use(Router)

let router = new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      component: Index,
      children: [
        {
          path: '',
          redirect: 'home'
        },
        {
          path: 'home',
          component: Home,
          meta: {
            title: '在线工具使用集合'
          }
        },
        // v-chart
        {
          path: 'chart',
          component: ChartDemoIndex,
          children: [
            {
              path: 'transform',
              component: ChartDemoTrans,
              meta: {
                title: '数据图表在线转化'
              }
            },
            {
              path: '',
              redirect: 'transform'
            }
          ]
        },

        {
          path: 'qr-code',
          component: CreateQrCode,
          meta: {
            title: '在线生成二维码'
          }
        },

        // kendoUI
        {
          path: 'kendo',
          component: KendoDemoIndex,
          children: [
            {
              path: 'ui',
              component: KendoDemoUI
            }
          ]
        },

        {
          path: 'table',
          component: TableIndex,
          children: [
            {
              path: 'transform',
              component: TableTransform,
              meta: {
                title: '手机实名信息提取'
              }
            },
            {
              path: 'transform_v.2',
              component: TableTransform2,
              meta: {
                title: '数据图表在线转化'
              }
            }
          ]
        },

        {
          path: 'test',
          component: TestPage
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) document.title = to.meta.title
  next()
})

export default router
