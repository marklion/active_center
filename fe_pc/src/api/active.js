import request from '@/utils/request'

export function create(data){
  return request ({
    url: '/api/v1/active/',
    method : 'post',
    data
  })
}

export function getList(params){
  return request({
    url: '/api/rest/active',
    method : 'get',
    params
  });
}

export function getById(id){
  return request({
    url: '/api/rest/active/' + id,
    method : 'get'
  });
}

export function remove(id){
  return request({
    url: '/api/rest/active/' + id,
    method : 'delete'
  });
}

export function update(id, data){
  return request({
    url: '/api/rest/active/' + id,
    method : 'put',
    data
  })
}
