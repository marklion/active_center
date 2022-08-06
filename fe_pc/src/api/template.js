import request from '@/utils/request'

export function getById(id) {
  return request({
    url: '/api/rest/activeTemplate/' + id,
    method: 'get'
  })
}

export function getList(query) {
  return request({
    url: '/api/rest/activeTemplate',
    method: 'get',
    params: query
  })
}

export function saveTemplate(tmpl) {
  return request({
    url: '/api/v1/activeTemplate',
    method: 'post',
    data : tmpl,
  })
  // params for dev temp
}
//
// // export function save(media_id, list) {
// //   return request({
// //     url: '/api/v1/menu/list',
// //     method: 'post',
// //     data : {media_id, list},
// //   })
//   // params for dev temp
// // }
//

// //
// export function remove(id) {
//   return request({
//     url: '/api/v1/template',
//     method: 'delete',
//     data : {id}
//   })
// }
