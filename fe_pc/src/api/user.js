import request from '@/utils/request'
import {
  PhoneNumberServer
} from 'aliyun_numberauthsdk_web';
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

export function phone_login(_phone) {
  return new Promise((resolve, reject) => {
    request({ url: '/api/v1/auth/get_token', method: 'get' }).then(function (resp) {
      if (resp.ok == true) {
        var j_token = resp.j_token;
        var a_token = resp.a_token;
        var phoneNumberServer = new PhoneNumberServer();
        phoneNumberServer.setLoggerEnable(true);
        phoneNumberServer.checkAuthAvailable({
          phoneNumber: _phone,
          accessToken: a_token,
          jwtToken: j_token,
          success: function () {
            phoneNumberServer.getVerifyToken({
              success: function (vr_token_resp) {
                if (vr_token_resp.code == 600000) {
                  request({ url: '/api/v1/auth/phone_auth', method: 'post', data: { token: vr_token_resp.spToken, phone: _phone } }).then(function (login_resp) {
                    resolve(login_resp);
                  }).catch(function (err) {
                    reject(err);
                  });
                }
                else {
                  reject(vr_token_resp.content);
                }
              },
              error: function (res) {
                console.log(res);
                reject('请关闭wifi后再试,或使用短信验证码登录');
              }
            });

          },
          error: function (res) {
            console.log(res);
            reject('系统错误，请使用短信验证码登录');
          }
        });
      }
      else {
        reject('获取认证令牌失败');
      }
    }).catch(err => reject(err));
  });
}

export function send_sms_code(_phone) {
  return request({
    url: '/api/v1/auth/send_verify_code',
    method: 'post',
    data:{phone:_phone}
  })
}

export function verify_login(_phone, _code) {
  return request({
    url: '/api/v1/auth/verify_login',
    method: 'post',
    data: { phone: _phone, code: _code }
  })
}
