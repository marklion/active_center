/**
 * Created by dongchen on 2017/6/26.
 * 鉴权接口
 * 除白名单外的接口都需要登录鉴权，登录成功后session中创建user对象表示其登录状态
 * session有效期在app.js中设置
 */
const router = require('koa-router')();

router.get('/view', async function (ctx, next) {
    ctx.state = {
        title: 'koa2 title'
    };
    await ctx.render('index', {
    });
});
/**
 * 查看登录状态
 */
router.get('/islogin', httpResult.resp(async ctx => {
    let admin = ctx.session.user;
    return admin;
}));

/**
 * 登录逻辑
 * role.type = 0(超管)，1(manager)可以登录
 */
router.post('/login', httpResult.resp(async ctx => {

    let name = ctx.request.body['username'];
    let pwd = ctx.request.body['password'];
    let clientIP = ctx.requestIP;
    let err = '';
    log.info('login form : ' + clientIP);
    log.info(ctx.request.body);
    let user = await models.user.findOne({ account: name });
    if (!user) {
        err = "用户名不存在";
    } else if (!user.comparePassword(pwd)) {
        err = "密码错误";
    }

    // let record = {
    //     // admin_id : {type : ObjectId, ref : 'admin_user'},
    //     // customer_chain  : {type : String, default : '', index : true},
    //     account : name,
    //     from_ip : clientIP,
    //     operation_type : 'login', //login logout ...
    //     desc : err,                                     //可能需要的添加的描述
    // };

    if (err) {
        throw err;
    } else {
        //用户登录成功
        ctx.session.user = user;
        return user;
    }
}));


function get_token() {
    const Core = require('@alicloud/pop-core');

    var client = new Core({
        accessKeyId: process.env.ALI_KEY_ID,
        accessKeySecret: process.env.ALI_KEY_SECRET,
        // securityToken: '<your-sts-token>', // use STS Token
        endpoint: 'https://dypnsapi.aliyuncs.com',
        apiVersion: '2017-05-25'
    });

    var params = {
        "Url": "https://active.d8sis.cn/",
        "Origin": "https://active.d8sis.cn"
    }

    var requestOption = {
        method: 'POST',
        formatParams: false,

    };

    return new Promise(function (resolve, reject) {
        console.log(client);
        client.request('GetAuthToken', params, requestOption).then((result) => {
            resolve(result.TokenInfo);
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });

}

router.get('/get_token', httpResult.resp(async ctx => {
    var ret = { j_token: '', a_token: '', ok: false };
    try {
        var token_info = await get_token();
        console.log(token_info);
        ret.j_token = token_info.JwtToken;
        ret.a_token = token_info.AccessToken;
        ret.ok = true;
    } catch (error) {
        console.log('failed to get token');
        console.log(error);
    }
    return ret;
}));

router.post('/phone_auth', httpResult.resp(async ctx => {
    const Core = require('@alicloud/pop-core');

    var client = new Core({
        accessKeyId: process.env.ALI_KEY_ID,
        accessKeySecret: process.env.ALI_KEY_SECRET,
        // securityToken: '<your-sts-token>', // use STS Token
        endpoint: 'https://dypnsapi.aliyuncs.com',
        apiVersion: '2017-05-25'
    });

    var params = {
        "PhoneNumber": ctx.request.body.phone,
        "SpToken": ctx.request.body.token
    }

    var requestOption = {
        method: 'POST',
        formatParams: false,
    };

    var user_phone = '';
    try {
        var call_ret = await client.request('VerifyPhoneWithToken', params, requestOption);
        if (call_ret.Code == 'OK' && call_ret.GateVerify.VerifyResult == 'PASS') {
            user_phone = ctx.request.body.phone;
        }
    } catch (error) {
        console.log("failed to verify phone");
        console.log(error);
    }

    if (user_phone) {
        let user = await models.user.findOne({ mobile: user_phone })
        if (user) {
            ctx.session.user = user;
            return user;
        }
        else {
            throw ("用户未注册");
        }
    }
    else {
        throw ("手机号验证失败，请使用本机手机号登录");
    }

}));

router.post('/send_verify_code', httpResult.resp(async (ctx) => {
    var sms_helper = require('../lib/sms');
    var utils = require('../lib/utils');
    var verify_code = utils.randomStr(6);
    var send_ret = await sms_helper.sendSMS({ mobile: ctx.request.body.phone, content: '您的验证码是：' + verify_code + ',验证码5分钟内有效' });
    var resp = { ok: false };
    if (send_ret) {
        ctx.session.verify_code = verify_code;
        ctx.session.verify_expiration = new Date().getTime() / 1000 + 300;
        resp.ok = true;
    }
    return resp;
}));


router.post('/verify_login', httpResult.resp(async (ctx) => {
    var input_code = ctx.request.body.code;
    var stored_code = ctx.session.verify_code;
    if (input_code == stored_code && ctx.session.verify_expiration > new Date().getTime() / 1000) {
        ctx.session.verify_code = '';
        let user = await models.user.findOne({ mobile: ctx.request.body.phone })
        if (user) {
            ctx.session.user = user;
            return user;
        }
        else {
            throw ("用户未注册");
        }
    }
    else {
        throw ("验证码输入错误,或已失效");
    }
}));

/**
 * 获取登录用户信息
 */
router.get('/user', httpResult.resp(async ctx => {
    let user = Object.assign({}, ctx.session.user);
    delete user.pwd;
    return user;
}));

/**
 * 登出逻辑
 */
router.get('/out', httpResult.resp(async function (ctx) {
    let user = ctx.session.user;
    delete ctx.session.user;
    return user;
}));

module.exports = router;
