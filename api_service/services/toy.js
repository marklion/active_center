const _ = require("lodash");

async function doSomeCheckAndReturnQuery(ctx){
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
    return _.assign(query, {removed : 0}, appCache.getClubQueryCondition(user.club));
}
module.exports = {doSomeCheckAndReturnQuery}
