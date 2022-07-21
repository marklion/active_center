import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/v1/auth/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/api/v1/auth/user',
    method: 'get',
    params: { token }
  })
  // params for dev temp
}

export function logout() {
  return request({
    url: '/api/v1/auth/out',
    method: 'get'
  })
}
