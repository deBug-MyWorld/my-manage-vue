import request from '@/utils/request'

export function buildMenus(){
    return request({
        url:'api/menu/build',
        method: 'get'
    })
}