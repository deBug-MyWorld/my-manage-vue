import axios from 'axios'
import { getToken } from '@/utils/token'
import { Message } from 'element-ui'
import store from '../store'
import router from '../router'
 
// 创建axios实例
const service = axios.create({
    baseURL:'/',
    timeout:1200000
})

// request拦截器
service.interceptors.request.use(
    config =>{
        if(getToken()){
            config.headers['Authorization'] = getToken()
        }
        if(config.url == 'api/certification'){
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
        } else {
            config.headers['Content-Type'] = 'application/json'
        }
        return config
    },
    error =>{
        console.log(error);
        Promise.reject(error)
    }
)

// response 拦截器
service.interceptors.response.use(
    response =>{ // 请求成功的响应数据 
        let {data:{ code }} = response
        if (code !== 200){
            Message.error(response.data.message)
            if (code === 401){
                store.dispatch('user/LogOut').then(() =>{
                    location.reload()
                })
            }
            return Promise.reject('response error')
        } else {
            return response.data
        }
    },
    error =>{
        let {data:{ code }} = error.response
        if(!window.navigator.onLine){
            Message.error('断网了~~~')
            return Promise.reject(error)
        }
        if (code){
            if (code === 400) {
                Message.error(error.response.data.message)
                return Promise.reject(error.response.data)
            } else if (code === 401) {
                console.log("401")
                store.dispatch('user/LogOut').then(() =>{
                    location.reload()
                })
            } else if (code === 403){
                Message.error(error.response.data.message)
                router.push({path:'/401'})
            }
        } else {
            Message.error("接口请求失败")
            return Promise.reject(error)
        }
    }

)
export default service