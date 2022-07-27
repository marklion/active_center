/**
 * adminUser相关接口
 * Created by dongchen on 2017-12-26.
 */
const router = require('koa-router')();
const _ = require('lodash');
const cacheService = require("../services/cache");
const roleService = require('../services/role');

/**
 * 新增俱乐部，绑定pid
 * 同时创建该俱乐部3个固定角色，manager，leader，player
 */
router.post('/', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let newClub = ctx.request.body;
    newClub.pid = user.club;
    let result = await models.club.create(newClub);
    await roleService.createDefaultRolesInClub(result._id);
    await cacheService.refreshClubCache();
    return result;
}));

router.put('/:id', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let id = ctx.params.id;
    let data = ctx.request.body;

    ctx.assert(id, 'request url param [id] missing');
    ctx.assert(appCache.canEditClub(user.club.toString(), id), 'you can not do this operation')
    let result = await models.club.findOneAndUpdate({_id : id}, {$set : data}, {new : true});
    console.log(result);
    return result;
}))

router.del('/:id', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let id = ctx.params.id;

    ctx.assert(id, 'request url param [id] missing');
    ctx.assert(appCache.canEditClub(user.club.toString(), id), 'you can not do this operation')
    let result = await models.club.deleteOne({_id : id});
    await cacheService.refreshClubCache();
    return result;
}))

module.exports = router;
