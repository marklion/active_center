async function createDefaultRolesInClub(clubId){
    await models.role.create({
        name : '管理员',
        type : constant.ROLE_TYPE.MANAGER,
        club : clubId,
        menus : [
            'account','account-edit',
            'role','role-edit',
            'toy',
            'template','template-edit',
            'active','active-edit',
            'registration-index','registration-edit','registration-stat'
        ],
        editable : false,
        create_time : new Date(),
    });
    await models.role.create({
        name : '团长',
        type : constant.ROLE_TYPE.LEADER,
        club : clubId,
        menus : ['registration-index','registration-edit','registration-stat'],
        editable : false,
        create_time : new Date(),
    });
    await models.role.create({
        name : '玩家',
        type : constant.ROLE_TYPE.PLAYER,
        club : clubId,
        menus : ['registration-index','registration-edit','registration-stat'],
        editable : false,
        create_time : new Date(),
    });
}

module.exports = {
    createDefaultRolesInClub : createDefaultRolesInClub
}
