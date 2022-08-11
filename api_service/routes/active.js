/**
 * active相关接口
 * Created by dongchen on 2022-08-10
 */
const router = require('koa-router')();
const _ = require('lodash');

/**
 * 新增比赛, 同步创建鸽群投注表
 */
router.post('/', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let activeData = ctx.request.body;

    activeData.creator = user._id;
    activeData.club = user.club;
    activeData.create_time = new Date();

    ctx.assert(activeData.template, 'missing field : templdate');
    let templateObj = await models.activeTemplate.findOne({_id : activeData.template});
    ctx.assert(templateObj, 'system error: template not exist : ' + activeData.template);
    activeData.template_copy = templateObj;
    delete activeData.template;

    ctx.assert(activeData.involved_leader && activeData.involved_leader.length > 0, 'field missing: involved leader')
    // let involvedToys = await models.toy.find({leader : {$in : activeData.involved_leader}});
    // ctx.assert(involvedToys, 'system error: no toys match for this game');
    let result = await models.active.create(activeData);
    let activeItems = [];
    for (const item of templateObj.items) {
        for(const bet_value of item.bet_values){
            activeItems.push({
                active: result._id,
                code: item.code,
                name: item.name,
                toy_limit: item.toy_limit,
                bet_value: bet_value,
                create_time: new Date()
            });
        }
    }
    await models.activeItem.insertMany(activeItems);
    return result;
}));

module.exports = router;
