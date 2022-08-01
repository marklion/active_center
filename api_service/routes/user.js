/**
 * adminUser相关接口
 * Created by dongchen on 2017-12-26.
 */
const router = require('koa-router')();
const _ = require('lodash');
const cacheService = require('../services/cache');

const httpResult = require('../lib/httpResult');

router.get('/:id', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let id = ctx.params.id;
    let q = _.assign({_id : id}, {removed : 0}, appCache.getClubQueryCondition(user.club));
    return await models.user.findOne(q);
}));
/**
 * 按条件获取当前账号可见的账号列表
 */
router.get('/', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let query = ctx.query;
    if(query.roleType){
        let role = await models.role.findOne({type : +query.roleType, club : query.club});
        delete query.roleType;
        query.role = role && role._id;
    }
    let q = _.assign(query, {removed : 0}, appCache.getClubQueryCondition(user.club));
    return await models.user.find(q).populate('role').populate('club');
}));

router.post('/', httpResult.resp(async ctx => {
    let data = ctx.request.body;
    let admin = ctx.session.user;

    let adminUser = {
        account         : data.account,       //登录名
        pwd             : data.pwd,
        name            : data.name,                               //昵称
        club            : data.club,
        role            : data.role,
        mobile          : data.mobile,
        privilege       : [],
    };

    if(data._id){
        await models.user.findOneAndUpdate({_id: data._id}, {$set : adminUser}, {new: true});
    }else{
        adminUser.creator = admin._id;
        adminUser.create_time = Date.now();
        await models.user.create(adminUser);
    }
    await cacheService.refreshClubCache();
    return 'ok'
}));

router.put('/:id', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let id = ctx.params.id;
    let body = ctx.request.body;
    ctx.assert(id, 'missing request url param : id');
    let target = await models.user.findOne(_.assign({_id : id}, appCache.getClubQueryCondition(user.club)));
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
    let user = ctx.session.user;
    let id = ctx.params.id;
    ctx.assert(id, 'missing request url param : id');
    let target = await models.user.findOne(_.assign({_id : id}, appCache.getClubQueryCondition(user.club)));
    ctx.assert(target, 'account is not exsit or no permissions');
    return await target.remove();
}));

router

module.exports = router;
