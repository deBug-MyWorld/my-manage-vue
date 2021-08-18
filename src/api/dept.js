import request from '@/utils/request'

export function getDeptIdsByRoleId(roleId){
    return request({
        url:`api/dept/deptIds/${roleId}`,
        method:'get',
    })
}