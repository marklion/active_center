const router = require('koa-router')();

const map = {
    userTmpl : '会员账号批量导入模板.xlsx'
}

router.get('/template', httpResult.file(async ctx => {
    let user = ctx.session.user;
    let query = ctx.query;
    return __dirname + '/../public/download/' +  map[query.name]
}));

module.exports = router;
