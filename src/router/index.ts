import { useUserStore } from '@/stores'
import { createRouter, createWebHistory } from 'vue-router'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  showSpinner: false,
})

// 如何得到路由实例 createRouter()
// 如何设置路由模式 history
// history 模式 createWebHistory()
// hash 模式 createWebHashHistory()
const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  // 默认参数 '/' 路由的基础路由
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/index.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/user/patient',
      component: () => import('@/views/user/PatientPage.vue'),
      meta: { title: '家庭档案' },
    },
    // 极速问诊界面
    {
      path: '/consult/fast',
      component: () => import('@/views/consult/ConsultFast.vue'),
      meta: { title: '极速问诊' },
    },
    {
      path: '/consult/dep',
      component: () => import('@/views/consult/ConsultDep.vue'),
      meta: { title: '选择科室' },
    },
    {
      path: '/consult/illness',
      component: () => import('@/views/consult/ConsultIllness.vue'),
      meta: { title: '病情描述' },
    },
    // 支付页面
    {
      path: '/consult/pay',
      component: () => import('@/views/consult/ConsultPay.vue'),
      meta: { title: '问诊支付' },
    },
    // 问诊室
    {
      path: '/room',
      component: () => import('@/views/room/index.vue'),
      meta: { title: '问诊室' },
      beforeEnter(to) {
        if (to.query.payResult === 'false') return '/user/consult'
      },
    },
    {
      path: '/user/consult',
      component: () => import('@/views/user/ConsultOrder.vue'),
      meta: { title: '问诊记录' },
    },
    {
      path: '/user/consult/:id',
      component: () => import('@/views/user/ConsultDetail.vue'),
      meta: { title: '问诊详情' },
    },
    {
      path: '/medicine/pay',
      component: () => import('@/views/medicine/OrderPay.vue'),
      meta: { title: '药品支付' },
    },
    {
      path: '/medicine/pay/result',
      component: () => import('@/views/medicine/OrderPayResult.vue'),
      meta: { title: '药品支付结果' },
    },
    {
      path: '/medicine/:id',
      component: () => import('@/views/medicine/OrderDetail.vue'),
      meta: { title: '药品订单详情' },
    },
    {
      path: '/medicine/express/:id',
      component: () => import('@/views/medicine/OrderExpress.vue'),
      meta: { title: '物流详情' },
    },
    // {
    //   path: '/login/callback',
    //   component: () => import('@/views/Login/LoginCallback.vue'),
    //   meta: { title: '三方登录' },
    // },
    // tabBar页面
    {
      // 父路由 layout公共布局页面
      path: '/',
      redirect: '/home',
      component: () => import('@/views/layout/index.vue'),
      children: [
        {
          path: '/home',
          component: () => import('@/views/home/index.vue'),
          meta: { title: '首页' },
        },
        {
          path: '/article',
          component: () => import('@/views/article/index.vue'),
          meta: { title: '健康百科' },
        },
        {
          path: '/notify',
          component: () => import('@/views/notify/index.vue'),
          meta: { title: '消息通知' },
        },
        {
          path: '/user',
          component: () => import('@/views/user/index.vue'),
          meta: { title: '个人中心' },
        },
      ],
    },
  ],
})

// 全局的前置导航守卫
router.beforeEach((to) => {
  NProgress.start()
  // 获取 token 的
  const store = useUserStore()
  // 白名单
  const wihteList = ['/login', '/login/callback']
  // 如果你没有token并且不在白名单里面，重定向到登录
  if (!store.user?.token && !wihteList.includes(to.path)) return '/login'
})

// 全局的后置导航
router.afterEach((to) => {
  document.title = `${to.meta.title || ''}-${import.meta.env.VITE_APP_TITLE}`
  NProgress.done()
})

export default router
