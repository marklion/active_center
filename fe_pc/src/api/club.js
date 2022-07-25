import request from '@/utils/request'

export function getById(id){
  return request ({
    url: '/api/rest/club/' + id,
    method : 'get'
  })
}

export function getList(query) {
  return request({
    url: '/api/rest/club',
    method: 'get',
    query
  })
}

export function save(data){
  return request({
    url : '/api/v1/club',
    method : 'post',
    data
  })
}

export function updateById(id, data){
  return request({
    url : '/api/v1/club/' + id,
    method : 'put',
    data
  })
}

export function total(){
  return request({
    url: '/api/rest/club/total',
    method: 'get'
  })
}

export function remove(id){
  return request({
    url: '/api/v1/club/' + id,
    method: 'delete'
  })
}
