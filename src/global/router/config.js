import {createDefaultRouterInterceptor} from 'happykit'

const modules = import.meta.glob("/src/views/**/**.vue")

import happyFramework from '../framework'
import routerData from '@/mock/routerData'
import security from '../security';


// 创建默认的拦截器
const beforeInterceptor = createDefaultRouterInterceptor({
  interceptorType: 'before',
  framework: happyFramework,
  async dataLoader(to, from, next) {
    const result = {rawData: null, message: ''}
    try {
      // 实际开发环境应该从服务端拉取数据
      const data = await new Promise((resolve,reject) => {
        resolve({
          code:0,
          data:routerData,
          message:'success'
        })
      })
      result.rawData = data.data
      result.message = data.message
    }catch (e) {
      result.rawData = null
      result.message = e.message
    }
    return result
  },
  dataLoadFailureHandler(result, to, from, next) {
    console.log('菜单数据加载失败', result)
    window.$message.error(result.message)
    next('/error')
  },
  routerInjectOption: {
    randomName: true,
    parentRoute: {
      name: 'home',
      path: '/',
      component: () => import('/src/views/home/index.vue')
    },
    routes: [],
    viewLoader(view) {
      return modules[`/src/views${view}`]
    }
  }
})

const routes = [
  {
    name: 'login',
    path: '/login',
    component: () => import('/src/views/login/index.vue')
  },
  {
    name: 'quick-login',
    path: '/quick-login',
    component: () => import('/src/views/quick-login/index.vue')
  },
  {
    name: 'signup',
    path: '/signup',
    component: () => import('/src/views/signup/index.vue')
  },
  {
    name: 'recover',
    path: '/recover',
    component: () => import('/src/views/recover/index.vue')
  },
  {
    name: 'error',
    path: '/:pathMatch(.*)*',
    component: () => import('/src/views/error/index.vue')
  }
]

const whiteList = [
  '/login',
  '/quick-login',
  '/recover',
  '/signup',
  '/error',
]


export const beforeEachHandler = (to, from, next) => {
  if (!security.getToken()) {
    if (!whiteList.includes(to.path)) {
      next('/login')
      return
    }
    next()
    return
  }

  if (!whiteList.includes(to.path)) {
    beforeInterceptor.filter(to, from, next)
  } else {
    next()
  }
}

// eslint-disable-next-line no-unused-vars
export const afterEachHandler = (to, from) => {
  // 使用拦截器
  // afterInterceptor.filter(to,from)
}


export default routes
