import request from '@/utils/request'

export function getActiveItemById(id){
  return request({
    url: '/api/rest/activeItem',
    method : 'get',
    query : {active : id}
  });
}
