const router = require('koa-router')();
const multer = require('koa-multer');
const moment = require('moment');
const {GridFsStorage} = require('multer-gridfs-storage');
const utils = require('../lib/utils');
const _ = require('lodash');

let seq = 0;

const storage = new GridFsStorage({
    db: mongodb,
    file: async function(req, file){
        let prefix = file.fieldname;
        let date = moment().format('YYMMDDhhmmss');
        let suffix = seq++;
        let subIndex = file.originalname.lastIndexOf('.') + 1;
        let format = file.originalname.substr(subIndex);
        return {
            filename: `${prefix}_${date}_${suffix}.${format}`,
            bucketName : 'media', //default: fs,
            aliases: file.originalname
        }
    }
});

const gridFs = multer({storage});

// const diskStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadPath)
//     },
//     filename: function (req, file, cb) {
//         let prefix = file.fieldname;
//         let date = moment().format('YYMMDDhhmmss');
//         let suffix = seq++;
//         let subIndex = file.originalname.lastIndexOf('.') + 1;
//         let format = file.originalname.substr(subIndex);
//
//         cb(null, `${prefix}_${date}_${suffix}.${format}`);
//     }
// });
//
// let uploadDisk = multer({
//     storage : diskStorage
// });

/**
 * 单上传媒体文件接口
 */
router.post('/user', gridFs.single('file'), httpResult.resp(async ctx => {
    let file = ctx.req.file;
    // log.debug(file);
    let result = file.originalname.match(/\.(.*)$/);
    let fileType = result && result[1];

    let inputStream = gfs.createReadStream({_id : file.id});
    let xlsResult = {};

    switch(fileType){
        case 'xlsx':
        case 'xls': {
            file.buffer = await streamToBuffer(inputStream);
            xlsResult = utils.commonXlsxFileParser(file);
            break;
        }
        default : {
            ctx.assert(false, 'unsupported file type: ' + fileType)
        }
    }
    ctx.assert(xlsResult.code === 0, xlsResult.msg);

    let {club, role, _id} = ctx.session.user;
    let loginRole = await models.role.findOne({_id : role});

    let importList = [];
    let mobileValidRegx = /^1\d{10}$/;

    for(let r of xlsResult.data){
        let belongClub = club;
        if(r.club && loginRole.type === constant.ROLE_TYPE.SUPER_ADMIN){
            let clubInst = await models.club.findOne({_id : r.club})
            ctx.assert(clubInst, 'club field error, not exist: ' + r.club)
            belongClub = r.club;
        }
        let roleName = r['角色'];
        ctx.assert(roleName === '团长' || roleName === '玩家', 'role type error, unsupported role type : ' + roleName);
        let roleType = roleName === '团长' ? constant.ROLE_TYPE.LEADER : constant.ROLE_TYPE.PLAYER;
        let createRole = await models.role.findOne({club : belongClub, type : roleType});
        ctx.assert(createRole, 'system error, role not exist : ' + roleName);
        let mobile = r['手机号'];
        ctx.assert(mobile && mobile.match(mobileValidRegx), 'mobile not valid: ' + mobile);
        let account = r['账号'] || mobile;
        let pwd = r['密码'] || mobile.substring(5);
        let name = r['账号名称'] || mobile;

        importList.push({
            account, pwd, name, mobile,
            role : createRole._id,
            club : belongClub,
            creator : _id,
            create_time : new Date()
        })
    }
    let resp = {total : importList.length, success : 0, message : '导入成功'};
    try{
        await models.user.insertMany(importList);
        resp.success = resp.total;
    }catch(err){
        resp.success = err.insertedDocs.length;
        resp.message = err.message
    }
    return resp;
}));

function streamToBuffer (stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
}
function streamToString (stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
}

module.exports = router;

/**
 {
   fieldname: 'file',
   originalname: 'mobileNumbers.txt',
   encoding: '7bit',
   mimetype: 'text/plain',
   id: 621742918aa4473342dc864b,
   filename: 'file_220224043217_0.txt',
   metadata: null,
   bucketName: 'media',
   chunkSize: 261120,
   size: 120,
   md5: '2a22c83df14584df3cd16676bdf37fa9',
   uploadDate: 2022-02-24T08:32:17.347Z,
   contentType: 'text/plain'
 }
 */
