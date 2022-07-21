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
// export function getRoleMenus() {
//   return request({
//     url: '/api/v1/menu/role',
//     method: 'get'
//   })
// }
//
// export function getList(params) {
//   return request({
//     url: '/api/v1/menu/list',
//     method: 'get',
//     responseType : 'json',
//     params
//   })
// }
// //  新增菜单
// export function add(data) {
//   return request({
//     url: '/api/v1/menu/add',
//     method: 'post',
//     data
//   })
// }
// //   修改菜单
// export function update(id, data) {
//   return request({
//     url: `/api/v1/menu/update/${id}`,
//     method: 'put',
//     data
//   })
// }
// //   删除菜单

