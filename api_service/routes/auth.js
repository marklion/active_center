/**
 * Created by dongchen on 2017/6/26.
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
    let admin = ctx.session.admin;
    return admin;
}));

/**
 * 登录逻辑
 */
router.post('/login', httpResult.resp(async ctx => {

    let name = ctx.request.body['username'];
    let pwd = ctx.request.body['password'];
    let clientIP = ctx.requestIP;
    let err = '';
    log.info('login form : ' + clientIP);
    log.info(ctx.request.body);
    let adminUser = await models.adminUser.findOne({account : name});
    if (!adminUser) {
        err = "用户名不存在";
    } else if (!adminUser.comparePassword(pwd)) {
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
        ctx.session.admin = adminUser;
        return adminUser
    }
}));

/**
 * 获取登录用户信息
 */
router.get('/user', httpResult.resp(async ctx => {
    let user = Object.assign({}, ctx.session.admin);
    delete user.pwd;
    return user;
}));

/**
 * 登出逻辑
 */
router.get('/out', httpResult.resp(async function (ctx) {
    let admin = ctx.session.admin;
    delete ctx.session.admin;
    return admin;
}));

module.exports = router;
