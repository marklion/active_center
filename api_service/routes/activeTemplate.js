/**
 * template相关接口
 * Created by dongchen on 2022-08-07
 */
const router = require('koa-router')();
const _ = require('lodash');

/**
 * 新增比赛模板
 */
router.post('/', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let tmpl = ctx.request.body;
    tmpl.club = user.club;
    tmpl.creator = user._id;
    tmpl.create_time = new Date();

    let result = await models.activeTemplate.create(tmpl);
    return result;
}));

module.exports = router;
