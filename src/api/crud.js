import request from '@/utils/request'
import qs from 'qs'

export function add(url,data){
    return request({
        url:url,
        method:'post',
        data:data
    })
}

export function edit(url,data){
    return request({
        url:url,
        method:'put',
        data:data
    })
}

export function list(url){
    return request({
        url:url,
        method:'get'
    })
}

export function del(url,id){
    return request({
        url:url,
        method:'delete',
        data:id
    })
}

export function page(url,params){
    return request({
        url:url+'?'+qs.stringify(params, { indices: false }),
        method:'get',
    })
}