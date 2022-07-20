const router = require('koa-router')();

const map = {
    // contactTmpl : '批量导入模板.xlsx'
}

router.get('/template', httpResult.file(async ctx => {
    let admin = ctx.session.admin;
    let query = ctx.query;
    return __dirname + '/../public/download/' +  map[query.name]
}));

module.exports = router;
