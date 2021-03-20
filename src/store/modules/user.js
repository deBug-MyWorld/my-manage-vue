import {login,logout,getInfo,usernameCheck,userRoles} from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/token'
const state = {
    token: getToken(),
    user: {},
    roles:[],
    permissions:[],
    // 第一次加载菜单时用到,防止死循环
    loadMenus:false
}
const getters = {}
const mutations = {
    SET_TOKEN: (state,token) =>{
        state.token = token
    },
    SET_USER: (state,user) =>{
        state.user = user
    },
    SET_ROLES: (state,roles) =>{
        state.roles = roles
    },
    SET_PERMISSIONS:(state,permissions) =>{
        state.permissions = permissions
    },
    SET_LOAD_MENUS: (state,loadMenus) =>{
        state.loadMenus = loadMenus
    }
}
const actions = {
    // 登录方法
    Login({ commit },params){ 
        return new Promise((resolve,reject) =>{
            login(params).then(res =>{
                commit('SET_TOKEN',res.data.token)
                setToken(res.data.token)
                commit('SET_ROLES',res.data.roles)
                commit('SET_USER',res.data.user)
                commit('SET_PERMISSIONS',res.data.permissions)
                commit('SET_LOAD_MENUS',true)
                resolve(res)
            }).catch(error=>{
                reject(error)
            })
        })
    },
    // 退出方法
    LogOut({commit}){
        return new Promise((resolve,reject) =>{
            logout().then(res => {
                commit('SET_TOKEN','')
                commit('SET_ROLES',[])
                removeToken()
                resolve(res)
            }).catch(error =>{
                reject(error)
            })
        })
    },
    // 获取当前登录用户的信息
    GetInfo({commit}){
        return new Promise((resolve,reject) =>{
            getInfo().then(res =>{
                commit('SET_ROLES',res.data.roles)
                commit('SET_USER',res.data.user)
                commit('SET_PERMISSIONS',res.data.permissions)
                resolve(res)
            }).catch(error =>{
                reject(error)
            })
        })
    },
    updateLoadMenus({commit}){
        return new Promise((resolve,reject) =>{
            commit('SET_LOAD_MENUS',false)
        })
    },
    UserNameCheck({commit},username){
        return new Promise((resolve,reject) =>{
            usernameCheck(username).then(res=>{
                resolve(res)
            }).catch(error =>{
                reject(error)
            })
        })
    },
    UserRoles({commit},userId){
        return new Promise((resolve,reject) =>{
            userRoles(userId).then(res =>{
                resolve(res)
            }).catch(error =>{
                reject(error)
            })
        })
    },
}

export default{
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}