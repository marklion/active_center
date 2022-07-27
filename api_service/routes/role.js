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
    let {club, _id} = ctx.session.user;
    let { name } = ctx.request.body;
    return await models.role.create({name, club, creator : _id, create_time : new Date()});
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
    let user = ctx.session.user;
    let query = ctx.query;

    query = _.assign({removed : 0}, appCache.getClubQueryCondition(user.club), query);
    return await models.role.find(query).populate('creator').populate('club');
}));

/**
 * 删除角色
 */
router.del('/:id', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let roleId = ctx.params.id;

    let accounts = await models.user.find({role : roleId});
    if(accounts && accounts.length > 0){
        throw new Error("Can't delete, other account still using this role");
    }else{
        return await models.role.remove(_.assign({_id : roleId}, appCache.getClubQueryCondition(user.club)));
    }
}));

module.exports = router;
