'use strict'
const router = require('koa-router')();
const httpResult = require('../lib/httpResult');
const _ = require('lodash');

router.get('/:model', init, httpResult.resp(getList));
router.get('/:model/total', init, httpResult.resp(getTotal));
router.get('/:model/:id',init, httpResult.resp(getById));
router.post('/:model', init, httpResult.resp(create));
router.put('/:model/:id', init, httpResult.resp(updateById));
router.delete('/:model/:id',init, httpResult.resp(deleteById));


module.exports = router;

/**
 * 初始化校验，确定数据模型，数据权限设置和status设置
 * rest接口统一都带数据范围权限，如果需要跳过customer——chain，请在routes文件夹中对应文件中添加响应接口
 */
async function init(ctx, next){
    let user = ctx.session.user;
    ctx.assert(user, `account is not login`);
    let modelName = ctx.params.model;
    let model = models[modelName];
    ctx.assert(model, `model ${modelName} is not exist`);
    ctx._model = model;
    if(modelName === 'club'){
        _.assign(ctx.query, {_id : appCache.getClubQueryCondition(user.club).club});
    }
    if(model.schema.pathType('club') === 'real'){
        _.assign(ctx.query, appCache.getClubQueryCondition(user.club));
    }
    if(model.schema.pathType('removed') === 'real'){
        _.assign(ctx.query, {removed : 0});
    }
    // console.log(admin);
    await next();
}

//根据id查找
async function getById(ctx) {
    let id = ctx.params.id;
    ctx.assert(id, 'request url param [id] missing');
    let query = ctx.query;
    let q = _.assign(query, {_id : id});
    return await ctx._model.findOne(q);
}

async function getList(ctx){
    let q = ctx.query;

    if(q.page){
        let pageSize = +q.pageSize || 20;
        let offset = (+q.page - 1) * pageSize;

        delete q.page;
        delete q.pageSize;

        return await ctx._model.find(q).skip(offset).limit(pageSize);
    }else{
        delete q.page;
        return await ctx._model.find(q);
    }
}

async function getTotal(ctx){
    return await ctx._model.countDocuments(ctx.query);
}

async function create(ctx){
    let data = ctx.request.body;
    return await ctx._model.create(data);
}

async function updateById(ctx){
    let id = ctx.params.id;
    ctx.assert(id, 'request url param [id] missing');
    let data = ctx.request.body;
    // ctx.assert(data, '');
    delete data._id;
    return await ctx._model.findOneAndUpdate(_.assign({_id: id}, ctx.query),  {$set : data}, {new: true});
}

async function deleteById(ctx){
    let id = ctx.params.id;
    ctx.assert(id, 'request url param [id] missing');
    return await ctx._model.findOneAndUpdate(_.assign({_id: id}, ctx.query), {$set : {removed : 1}}, {new : true});
}
