import request from '@/utils/request'

export function downloadTemplate(params) {
  return request({
    url: '/api/v1/download/template',
    method: 'get',
    params
  })
}
