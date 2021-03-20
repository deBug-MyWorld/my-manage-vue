import request from '@/utils/request'
import qs from 'qs'
export function login(params){
    return request({
        url:'api/certification',
        method: 'post',
        data:qs.stringify(params)
    })
}

export function logout() {
    return request({
        url: 'api/signout',
        method: 'get'
    })
}

export function getInfo(){
    return request({
        url:'api/user/info',
        method:'get'
    })
}

// export function getUserList(params){
//     return request({
//         url:'api/user?'+qs.stringify(params, { indices: false }),
//         method:'get',
//     })
// }


export function usernameCheck(username){
    return request({
        url:(`api/user/checkName/${username}`),
        method:'get'
    })
}


export function userRoles(userId){
    return request({
        url:`api/user/userRoles/${userId}`,
        method:'get'
    })
}

