import request from '@/utils/request'

export function getRoleList(){
    return request({
        url:'api/role/all',
        method:'get',
    })
}

export function getMenuIdsByRoleId(roleId){
    return request({
        url:`api/role/menuIds/${roleId}`,
        method:'get',
    })
}

export function permission(params){
    return request({
        url:'api/role/permission',
        method:'post',
        data:params,
    })
}