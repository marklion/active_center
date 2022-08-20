/**
 * active相关接口
 * Created by dongchen on 2022-08-17
 */
const router = require('koa-router')();
const _ = require('lodash');
const moment = require("moment");
const utils = require('../lib/utils')

/**
 * 保存比赛记录
 */
router.post('/', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let data = ctx.request.body;

    ctx.assert(data.item, 'missing field : item');
    let activeItem = await models.activeItem.findOne({_id : data.item});
    ctx.assert(activeItem, 'active item error: not exist');
    let active = await models.active.findOne({_id: activeItem.active});
    ctx.assert(active, 'system error: active not exist');
    ctx.assert(active.canJoin(data), 'active is not available');

    ctx.assert(data.toys, 'missing field : toys');
    ctx.assert(data.toys.length === activeItem.toy_limit, `toy limit error: you should submit ${activeItem.toy_limit} but ${data.toys.length}`);

    let group_id = utils.timeStr_random6();
    for(let toyId of data.toys){
        let toy = await models.toy.findOne({_id: toyId});
        await models.activePlayer.create({
            toy: toy._id,
            player: toy.player,
            leader: toy.leader,
            club: toy.club,
            active : activeItem.active,
            item: activeItem._id,
            group_id : group_id,
            creator : user._id,
            create_time : new Date()
        });
    }

    return 'ok';
}));

router.get('/', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let role = await models.role.findOne({_id : user.role});
    ctx.assert(role, 'system error: login user role = ' + role);
    let query = ctx.query;
    if(role.type === constant.ROLE_TYPE.PLAYER){
        query.player = user._id;
    }
    if(role.type === constant.ROLE_TYPE.LEADER){
        query.leader = user._id;
    }
    let q = _.assign(query, {removed : 0}, appCache.getClubQueryCondition(user.club));
    return await models.activePlayer.find(q).populate('toy');
}))

module.exports = router;
