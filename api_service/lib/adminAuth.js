/**
 * api 授权拦截器
 * Created by dongchen on 15/12/16.
 */
const config = require('config');
function excludeUrl(ctx){

    let path = ctx.path;
    let excludeArray = [
        '/static',
        '/v1/auth'
    ];

    for(let i in excludeArray){
        if (path.startsWith(config.basePath + excludeArray[i])){
            return true;
        }
    }
    return false;
}

async function valid(ctx, next){

    //过滤掉不需要登录验证的url
    if(excludeUrl(ctx)){
        await next();
        return;
    }

    if(!ctx.session.admin){
        log.info(ctx.path);
        if(ctx.request.xhr){
            log.info("ajax request: 用户没有登录");
            //ajax request
            ctx.body = {
                code : 503,
                msg  : '用户没有登录'
            }
        }else{
            //common request
            log.info("normal request: 用户没有登录 redirect");
            ctx.body = {
                code : 503,
                msg  : '用户没有登录'
            }
        }

    }else{
        await next();
    }
}

module.exports = {
    valid : valid
};
