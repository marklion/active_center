/**
 * adminUser相关接口
 * Created by dongchen on 2017-12-26.
 */
const router = require('koa-router')();
const _ = require('lodash');

const httpResult = require('../lib/httpResult');


router.get('/:id', httpResult.resp(async ctx => {
    let admin = ctx.session.admin;
    let id = ctx.params.id;
    let q = _.assign({_id : id}, {status : 1, customer_chain: new RegExp(`^${admin.customer_chain}`)});
    return await models.adminUser.findOne(q);
}));
/**
 * 按条件获取当前账号可见的账号列表
 */
router.get('/', httpResult.resp(async ctx => {
    let admin = ctx.session.admin;
    let query = ctx.query;
    let q = _.assign(query, {status : 1, customer_chain: new RegExp(`^${admin.customer_chain}`)});
    return await models.adminUser.find(q).populate('role');
}));

router.post('/', httpResult.resp(async ctx => {
    let data = ctx.request.body;
    let admin = ctx.session.admin;

    let adminUser = {
        account         : data.account,       //登录名
        pwd             : data.pwd,
        name            : data.name,                               //昵称
        role            : data.role,  
        mobile          : data.mobile,
        privilege       : [],
    };
    if(data.customer){
        let customer = await models.customer.findOne({_id : data.customer});
        adminUser.customer = customer._id;
        adminUser.customer_name = customer.name;
        adminUser.customer_chain = customer.chain;
    }

    if(data._id){
        await models.adminUser.findOneAndUpdate({_id: data._id}, {$set : adminUser}, {new: true});   
    }else{
        adminUser.creator = admin._id;
        adminUser.create_time = Date.now();
        await models.adminUser.create(adminUser);
    }
    return 'ok'
}));

router.put('/:id', httpResult.resp(async ctx => {
    let admin = ctx.session.admin;
    let id = ctx.params.id;
    let body = ctx.request.body;
    ctx.assert(id, 'missing request url param : id');
    let target = await models.adminUser.findOne({_id : id});
    ctx.assert(target, 'account is not exsit');

    ctx.assert(['reset_pwd'].includes(body.type), 'update type is not supported yet : ' + body.type);
    switch(body.type){
        case 'reset_pwd' : {
            ctx.assert(target.comparePassword(body.curPwd), '当前密码错误');
            ctx.assert(body.newPwd && body.newPwd.length >=6, '设置密码长短不能少于6位');
            ctx.assert(body.newPwd == body.confirmPwd, '新密码与确认密码结果不一致，请核对');
            target.pwd = body.newPwd;
            return await target.save();
            break;
        }
    }
}));

router.del('/:id', httpResult.resp(async ctx => {
    let admin = ctx.session.admin;
    let id = ctx.params.id;
    ctx.assert(id, 'missing request url param : id');
    let target = await models.adminUser.findOne({_id : id, customer_chain: new RegExp(`^${admin.customer_chain}`)});
    ctx.assert(target, 'account is not exsit or no permissions');
    target.status = 0;
    return await target.save();
}));

module.exports = router;
