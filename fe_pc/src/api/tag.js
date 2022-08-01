import request from '@/utils/request'

//rest get by id
export function getList(query) {
  return request({
    url: `/api/rest/tag`,
    method: 'get',
    query
  })
}


export function add(data) {
  return request({
    url: `/api/v1/tag`,
    method: 'post',
    data
  })
}

export function remove(id) {
  return request({
    url: `/api/v1/tag/${id}`,
    method: 'delete',
  })
}
