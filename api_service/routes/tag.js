/**
 * tag相关接口
 * Created by dongchen on 2022-03-02.
 */
const router = require('koa-router')();
const _ = require('lodash');
/**
 * 新建角色
 */
router.post('/', httpResult.resp(async ctx => {
    let {club, _id} = ctx.session.user;
    let { name, type = 'toy' } = ctx.request.body;

    return await models.tag.create({name, type, club, creator : _id, create_time : new Date()});
}));

router.del('/:id', httpResult.resp(async ctx => {
    let {club} = ctx.session.user;
    let _id = ctx.params.id;

    let tag = await models.tag.findOne(_.assign({_id, removed : 0}, appCache.getClubQueryCondition(club)));
    ctx.assert(tag, '数据不存在或没有权限');
    ctx.assert(tag.ref_count === 0, '标签在使用中，无法删除');
    return await tag.remove();
}))

module.exports = router;
