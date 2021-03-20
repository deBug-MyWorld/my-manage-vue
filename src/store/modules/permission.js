import Layout from '@/layout/index'
import { constantRoutes} from '@/router/index'

const state = {
    routers: constantRoutes,
    addRouters:[]
}
const getters = {}
const mutations = {
    SET_ROUTERS: (state,routers) =>{
        state.addRouters = routers
        state.routers = constantRoutes.concat(routers)
    }
}
const actions = {
    GenerateRoutes( { commit },asyncRouter){
        commit('SET_ROUTERS',asyncRouter)
    }
}

export const filterAsyncRouter = (routers) =>{
    // 遍历后台传来的路由字符串，转换为组件对象
    return routers.filter(router =>{ 
        if (router.component) {
            if (router.component === 'Layout'){
                router.component = Layout
            } else {
                const component = router.component
                router.component = loadView(component)
            }
        }
        if (router.children && router.children.length) { 
            router.children = filterAsyncRouter(router.children)
        }
        return true
    })
}

export const loadView = (view) => {
    return (resolve) => require([`@/views/${view}`],resolve)
}

export default{
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}