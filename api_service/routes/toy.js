/**
 * contact相关接口
 * Created by dongchen on 2022-03-02.
 */
const router = require('koa-router')();
const _ = require('lodash');
import {updateTagRefCount} from '../services/tag'
import {doSomeCheckAndReturnQuery} from '../services/toy'

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
    let q = await doSomeCheckAndReturnQuery(ctx);
    return await models.toy.find(q).populate('player').populate('leader').populate('club');
}));

/**
 * 分页获取鸽子列表
 * populate with player leader club
 * query : {page : index, size : pageSize}
 * body : {total : totalSize, list : []}
 */
router.get('/page', httpResult.resp(async ctx => {
    let q = await doSomeCheckAndReturnQuery(ctx)

    let pageSize = +q.pageSize || 10;
    let offset = ((+q.page || 1) - 1) * pageSize;

    delete q.page;
    delete q.pageSize;

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
    let leader = await models.user.findOne({_id: toy.leader})
    let obj = _.assign(toy, {creator : _id, create_time : new Date(), house_no: leader.house_code});

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
    let leader = await models.user.findOne({_id: toy.leader})
    toy.house_no = leader.house_code;

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
