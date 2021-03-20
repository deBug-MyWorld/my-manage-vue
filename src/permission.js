import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/token' // get token from cookie
import { buildMenus } from '@/api/menu'
import { filterAsyncRouter } from '@/store/modules/permission'
NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist


router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) { 
    if (to.path === '/login') {
      // 已经登录且要跳转的页面是登录页
      next({ path: '/' })
      NProgress.done()
    } else {
      if (store.getters.roles.length === 0) { // 判断当前用户是否已获取用户信息  页面刷新，vuex中的数据会丢失，重新拉取
        store.dispatch('user/GetInfo').then(res =>{
          loadMenu(next,to)
        }).catch(error =>{
          console.log(error)
          store.dispatch('user/LogOut').then(()=>{
            location.reload() // 重新实例化vue-router对象，避免bug
          })
        })
      } else if (store.getters.loadMenus){  // 登录时未拉取菜单， 在此处拉取
        store.dispatch('user/updateLoadMenus').then(res=>{})
        loadMenu(next,to)
      } else{
        next()
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      // 否则全部重定向到登录页
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

export const loadMenu = (next,to) =>{
  buildMenus().then(res =>{
    const asyncRouter = filterAsyncRouter(res.data)
    asyncRouter.push({ path: '*', redirect: '/404', hidden: true }) 
    store.dispatch('permission/GenerateRoutes',asyncRouter).then(() => {
      router.addRoutes(asyncRouter) // addRoutes 只是添加能访问的url，菜单的渲染还得用store
      next({ ...to,replace:true }) // 不能通过浏览器后退按钮，返回前一个路由。
    })
  })
}

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
