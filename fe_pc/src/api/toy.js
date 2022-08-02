import request from '@/utils/request'

export function getList(query) {
  return request({
    url: '/api/v1/toy',
    method: 'get',
    params : query
  })
}
export function add(data) {
  return request({
    url: '/api/v1/toy/add',
    method: 'post',
    data
  })
}
export function remove(id) {
  return request({
    url: '/api/v1/toy/' + id,
    method: 'delete'
  })
}

export function updateById(id, data) {
  return request({
    url: '/api/v1/toy/' + id,
    method: 'put',
    data
  })
}

export function updateBatch(data) {
  return request({
    url: '/api/v1/toy/batch',
    method: 'put',
    data
  })
}

export function deleteBatch(data) {
  return request({
    url: '/api/v1/toy/batch',
    method: 'delete',
    data
  })
}

// export let role = {
//
// }
