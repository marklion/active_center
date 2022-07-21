/**
 * role相关接口
 * Created by dongchen on 2021-12-28.
 */
const router = require('koa-router')();
const _ = require('lodash');
/**
 * 新建角色
 */
router.post('/add', httpResult.resp(async ctx => {
    let {customer_chain, customer_name, _id} = ctx.session.admin;
    let { name } = ctx.request.body;

    return await models.role.create({name, customer_chain, customer_name, creator : _id, create_time : new Date()});
}));
/**
 * 编辑角色名称和权限
 */
router.put('/edit/:id', httpResult.resp(async ctx => {
    let _id = ctx.params.id;
    let { name,menus } = ctx.request.body;
    let info = {};
    if(name){
        info.name = name;
    }
    if(menus){
        info.menus = menus;
    }
    return await models.role.findOneAndUpdate({_id}, {$set : info}, {new: true});
}));
/**
 * 获取角色列表
 */
router.get('/list', httpResult.resp(async ctx => {
    let admin = ctx.session.admin;
    let query = ctx.query;
    let q = _.assign(query, {status : 1, customer_chain: new RegExp(`^${admin.customer_chain}`)});
    return await models.role.find(q).populate('creator');
}));
/**
 * 获取单个角色详情by id
 * 根据id获取，不做可见范围校验
 */
router.get('/', httpResult.resp(async ctx => {
    let admin = ctx.session.admin;
    let query = ctx.query;
    let q = _.assign({_id : query.id}, {status : 1});
    return await models.role.findOne(q);
}));
/**
 * 删除角色
 */
router.del('/:id', httpResult.resp(async ctx => {
    let admin = ctx.session.admin;
    let roleId = ctx.params.id;

    let accounts = await models.adminUser.find({role : roleId});
    if(accounts && accounts.length > 0){
        throw new Error("Can't delete, other account still using this role");
    }else{
        return await models.role.findOneAndUpdate({_id : roleId}, {$set : {status : 0}});
    }
}));

module.exports = router;
