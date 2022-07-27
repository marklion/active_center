async function createDefaultRolesInClub(clubId){
    await models.role.create({
        name : '管理员',
        type : constant.ROLE_TYPE.MANAGER,
        club : clubId,
        menus : [],
        editable : false,
        create_time : new Date(),
    });
    await models.role.create({
        name : '团长',
        type : constant.ROLE_TYPE.LEADER,
        club : clubId,
        menus : [],
        editable : false,
        create_time : new Date(),
    });
    await models.role.create({
        name : '玩家',
        type : constant.ROLE_TYPE.PLAYER,
        club : clubId,
        menus : [],
        editable : false,
        create_time : new Date(),
    });
    return;
}

module.exports = {
    createDefaultRolesInClub : createDefaultRolesInClub
}
