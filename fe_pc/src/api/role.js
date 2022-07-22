import request from '@/utils/request'

export function getList(query) {
  return request({
    url: '/api/v1/role/list',
    method: 'get',
    params : query
  })
}
export function getById(id) {
  return request({
    url: '/api/rest/role/' + id,
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/api/v1/role/add',
    method: 'post',
    data
  })
}

export function update(id, data) {
  return request({
    url: '/api/v1/role/edit/' + id,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: '/api/v1/role/' + id,
    method: 'delete',
  })
}

export let role = {

}
