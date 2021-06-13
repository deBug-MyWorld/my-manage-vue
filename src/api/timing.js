import request from '@/utils/request'
import qs from 'qs'

export function addORsave(data){
    return request({
        url:'api/quartz',
        method:'post',
        data:data
    })
}


export function del(data){
    return request({
        url:'api/quartz',
        method:'delete',
        data:data
    })
}

export function page(params){
    return request({
        url:'api/quartz?'+qs.stringify(params, { indices: false }),
        method:'get',
    })
}

export function execution(data){
    return request({
        url: 'api/quartz/trigger',
        method: 'put',
        data:data
    })
}

export function pause(data){
    return request({
        url: 'api/quartz/pause',
        method: 'put',
        data:data
    })
}

export function resume(data){
    return request({
        url: 'api/quartz/resume',
        method: 'put',
        data:data
    })
}

export function check(cron){
    return request({
        url:'api/quartz/check?'+qs.stringify(cron, { indices: false }),
        method:'get',
    })
}

export default{addORsave,del,page,execution,pause,resume,check}