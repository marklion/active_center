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
    let user = await models.user.findOne({account : name});
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
