/**
 * adminUser相关接口
 * Created by dongchen on 2017-12-26.
 */
const router = require('koa-router')();
const _ = require('lodash');
const cacheService = require("../services/cache");

/**
 * 新增俱乐部，绑定pid
 */
router.post('/', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let newClub = ctx.request.body;
    newClub.pid = user.club;
    let result = await models.club.create(newClub);
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
