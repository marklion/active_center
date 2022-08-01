import request from '@/utils/request'

export function getList(query) {
  return request({
    url: '/api/v1/user',
    method: 'get',
    params : query
  })
}
export function getClubPlayers(club){
  return request({
    url: '/api/v1/user',
    method : 'get',
    params : {
      club,
      roleType : 3
    }
  })
}

export function getClubLeaders(club){
  return request({
    url: '/api/v1/user',
    method : 'get',
    params : {
      club,
      roleType : 2
    }
  })
}

export function getById(id){
  return request({
    url : '/api/rest/user/' + id,
    method : 'get'
  })
}

export function add(data) {
  return request({
    url: '/api/v1/user',
    method: 'post',
    data
  })
}

/**
 * 修改账号密码
 * @param id 目标id
 * @param data {curPwd, newPwd, confirmPwd}
 */
export function resetPwd(id, data) {
  data = Object.assign({type : 'reset_pwd'}, data)
  return request({
    url: '/api/v1/user/'+ id,
    method: 'put',
    data
  })
}

export function remove(id){
  return request({
    url: '/api/v1/user/'+ id,
    method: 'delete'
  })
}


