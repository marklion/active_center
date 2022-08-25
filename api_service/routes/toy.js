/**
 * contact相关接口
 * Created by dongchen on 2022-03-02.
 */
const router = require('koa-router')();
const _ = require('lodash');
const qs = require('qs');
const utils = require('../lib/utils');
import {updateTagRefCount} from '../services/tag'

/**
 * 批量操作，更新鸽子标签
 */
router.put('/batch', httpResult.resp(async ctx => {
    let {club, _id} = ctx.session.user;
    let body = ctx.request.body;

    let toys = await models.toy.find(_.assign({_id : {$in : body.ids}}, appCache.getClubQueryCondition(club)));
    ctx.assert(toys.length === body.ids.length, '目标数据不存在');

    if(body.type === 'cover'){
        await models.toy.updateMany({_id : {$in : body.ids}}, {$set : {tags : body.tags}})
    }else if(body.type === 'append'){
        for(let c of toys){
            let updateResult = await c.updateOne({$addToSet : {tags: {$each: body.tags}}});
        }
    }
    await updateTagRefCount('toy');
    return 1;
}));

router.del('/batch', httpResult.resp(async ctx => {
    let {club} = ctx.session.user;
    let ids = ctx.request.body;

    let result = await models.toy.remove(_.assign({_id : {$in : ids}},appCache.getClubQueryCondition(club)));
    await updateTagRefCount('toy');
    return result;
}));

 /**
  * 获取鸽子列表
  * populate with player leader club
  */
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
    return await models.toy.find(q).populate('player').populate('leader').populate('club');
}));

/**
 * 分页获取鸽子列表
 * populate with player leader club
 * query : {page : index, size : pageSize}
 * body : {total : totalSize, list : []}
 */
router.get('/page', httpResult.resp(async ctx => {
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
    let pageSize = +query.pageSize || 10;
    let offset = ((+query.page || 1) - 1) * pageSize;

    delete query.page;
    delete query.pageSize;

    let q = _.assign(query, {removed : 0}, appCache.getClubQueryCondition(user.club));
    let total = await models.toy.countDocuments(q);
    let list = await models.toy.find(q).skip(offset).limit(pageSize).populate('player').populate('leader').populate('club');
    return { total, list }
}));

/**
 * 新建鸽子条目
 */
router.post('/add', httpResult.resp(async ctx => {
    let {club, _id} = ctx.session.user;
    let toy = ctx.request.body;
    let obj = _.assign(toy, {creator : _id, create_time : new Date()});

    let result = await models.toy.create(obj);
    if(result.tags.length > 0){
        for (const tagId of result.tags) {
            await models.tag.updateOne({_id : tagId}, {$inc: {ref_count: 1}});
        }
    }
    return result
}));

/**
 * 更新鸽子条目
 */
router.put('/:id', httpResult.resp(async ctx => {
    let {club} = ctx.session.user;
    let toy = ctx.request.body;
    let _id = ctx.params.id;

    let oldData = await models.toy.findOneAndUpdate({_id}, toy);
    if(oldData.tags.length > 0){
        oldData.tags.forEach(async (tagId) => {
            await models.tag.updateOne({_id : tagId}, {$inc: {ref_count: -1}});
        })
    }
    if(toy.tags.length > 0){
        toy.tags.forEach(async (tagId) => {
            await models.tag.updateOne({_id : tagId}, {$inc: {ref_count: 1}});
        })
    }
    return 'OK'
}));

router.del('/:id', httpResult.resp(async ctx => {
    let {club} = ctx.session.user;
    let _id = ctx.params.id;

    let toy = await models.toy.findOne(_.assign({_id, removed: 0}, appCache.getClubQueryCondition(club)));
    ctx.assert(toy, '数据不存在或没有权限');
    //此处如果要维护ref_count准确，需要分布式锁
    if(toy.tags.length > 0){
        for (const tagId of toy.tags) {
            await models.tag.updateOne({_id : tagId}, {$inc: {ref_count: -1}});
        }
    }
    return await toy.remove();
}))

module.exports = router;
