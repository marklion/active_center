import request from '@/utils/request'

export function save(data){
  return request({
    url: '/api/v1/activePlayer',
    method : 'post',
    data
  });
}

export function getList(params){
  return request({
    url: '/api/v1/activePlayer',
    method: 'get',
    params
  })
}
export function remove(id){
  return request({
    url: '/api/rest/activePlayer/' + id,
    method: 'delete',
  })
}

export function removeBatch(ids){
  return request({
    url: '/api/v1/activePlayer',
    method: 'delete',
    data : ids
  })
}

export function exportByActive(activeId){
  return request({
    url: '/api/v1/activePlayer/export',
    method: 'get',
    params : {active : activeId},
    responseType: 'blob'
  })
}
