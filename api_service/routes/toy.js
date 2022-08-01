/**
 * contact相关接口
 * Created by dongchen on 2022-03-02.
 */
const router = require('koa-router')();
const _ = require('lodash');
// const toyService = require('../service/toy');
const qs = require('qs');
const utils = require('../lib/utils');

 /**
  * 获取鸽子列表
  * populate with player leader club
  */
router.get('/', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let query = ctx.query;
    let q = _.assign(query, {removed : 0}, appCache.getClubQueryCondition(user.club));
    return await models.toy.find(q).populate('player').populate('leader').populate('club');
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
        for (const tagId of result) {
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
//
// /**
//  *
//  */
// router.get('/brief', httpResult.resp(async ctx => {
//     let admin = ctx.session.admin;
//     let query = qs.parse(ctx.querystring);//此处特殊处理，方式array 格式的qs koa解析错误
//     let q = _.assign(query, {status : 1, customer_chain: new RegExp(`^${admin.customer_chain}`)});
//
//     let resp;
//     if(query.input){
//         resp = utils.getMobilesBriefStat(query.input);
//     }else{
//         if(query.tags && query.tags.length > 0){
//             q.$or = query.tags.map(tagId => {return {tags : tagId}});
//             delete q.tags;
//         }
//         let contacts = await models.contact.find(q);
//         resp = utils.getMobilesBriefStat(contacts.map(c => c.mobile));
//     }
//
//     return resp;
// }));


router.put('/batch', httpResult.resp(async ctx => {
    let {customer_chain, customer_name, _id} = ctx.session.admin;
    let body = ctx.request.body;

    let contacts = await models.contact.find({_id : {$in : body.ids}, customer_chain: new RegExp(`^${customer_chain}`)});
    ctx.assert(contacts.length === body.ids.length, '目标数据不存在');

    if(body.type === 'cover'){
        await models.contact.updateMany({_id : {$in : body.ids}}, {$set : {tags : body.tags}})
    }else if(body.type === 'append'){
        for(let c of contacts){
            let updateResult = await c.updateOne({$addToSet : {tags: {$each: body.tags}}});
        }
    }
    await contactService.updateTagRefCount();
    return 1;
}));

router.del('/batch', httpResult.resp(async ctx => {
    let {customer_chain} = ctx.session.admin;
    let ids = ctx.request.body;

    let result = await models.contact.remove({_id : {$in : ids}, customer_chain: new RegExp(`^${customer_chain}`), status : 1});
    await contactService.updateTagRefCount();
    return result;
}));


// /**
//  * 编辑角色名称和权限
//  */
// router.put('/edit/:id', httpResult.resp(async ctx => {
//     let _id = ctx.params.id;
//     let { name,menus } = ctx.request.body;
//     let info = {};
//     if(name){
//         info.name = name;
//     }
//     if(menus){
//         info.menus = menus;
//     }
//     return await models.role.findOneAndUpdate({_id}, {$set : info}, {new: true});
// }));

// /**

// /**
//  * 删除角色
//  */
// router.del('/:id', httpResult.resp(async ctx => {
//     let admin = ctx.session.admin;
//     let roleId = ctx.params.id;

//     let accounts = await models.adminUser.find({role : roleId});
//     if(accounts && accounts.length > 0){
//         throw new Error("Can't delete, other account still using this role");
//     }else{
//         return await models.role.findOneAndUpdate({_id : roleId}, {$set : {status : 0}});
//     }
// }));

module.exports = router;
