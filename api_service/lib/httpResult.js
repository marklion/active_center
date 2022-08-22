/**
 * api 请求结果返回统一格式
 * Created by dongchen on 15/12/17.
 */
const CODE_SUCCESS = 200;
const CODE_SYS_ERR = 500;
const CODE_LOGIC_ERR = 520;

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const log = require('./log').logger;

function succ(data){
    return {
        code : CODE_SUCCESS,
        data : data
    }
}

function sys_err(errMsg){
    return {
        code : CODE_SYS_ERR,
        msg  : errMsg
    }
}

function logic_err(errMsg){
    return {
        code : CODE_LOGIC_ERR,
        msg  : errMsg,
        data : errMsg
    }
}

let resp = _.curryRight(async function (ctx, next, fn){
    try{
        let resultData = await fn(ctx);
        ctx.body = succ(resultData);
    }catch(err){
        log.error(err);
        ctx.body = logic_err(err.message || err);
    }
});

let file = _.curryRight(async function (ctx, next, fn){
    try{
        let fullPath = await fn(ctx);
        let fileName = path.basename(fullPath);
        // let mimeType = mime.lookup(fullPath);

        ctx.attachment(fileName);
        ctx.response.type = 'application/octet-stream';

        ctx.body = fs.createReadStream(fullPath);
    }catch(err){
        log.error(err);
        ctx.response.type = 'application/json';
        ctx.body = logic_err(err.message || err);
    }
});

module.exports = {
    succ : succ,
    err_sys : sys_err,
    err_logic : logic_err,
    resp,
    file,
};
