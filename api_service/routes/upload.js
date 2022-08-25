const router = require('koa-router')();
const multer = require('koa-multer');
const moment = require('moment');
const {GridFsStorage} = require('multer-gridfs-storage');
const utils = require('../lib/utils');
const _ = require('lodash');
const tagService = require('../services/tag');

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
 * 批量上传用户文件接口
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
        let comment = r['备注']

        importList.push({
            account, pwd, name, mobile, comment,
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
        if(err.code === 11000){
            let dupKeyStr = err.message.match(/dup key: (\{.*\})/);
            let dupObj = eval("(" + dupKeyStr[1] + ")");
            if(dupObj.account){
                resp.message = `账号冲突，导致保存过程中断，请解决${dupObj.account}账号的冲突后再试`
            }else{
                resp.message = `手机号冲突，导致保存过程中断，请解决${dupObj.account}号码的冲突后再试`
            }
        }else{
            resp.message = err.message
        }

    }
    return resp;
}));

router.post('/toy', gridFs.single('file'), httpResult.resp(async ctx => {
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

    let tagMap;
    for(let r of xlsResult.data){
        let belongClub = club;
        if(r.club && loginRole.type === constant.ROLE_TYPE.SUPER_ADMIN){
            let clubInst = await models.club.findOne({_id : r.club})
            ctx.assert(clubInst, 'club field error, not exist: ' + r.club)
            belongClub = r.club;
        }
        if(!tagMap){
            let allTags = await models.tag.find(_.assign({removed : 0}, appCache.getClubQueryCondition(belongClub))).lean();
            tagMap = _.keyBy(allTags, 'name');
        }
        let ring_no = r['环号'];
        ctx.assert(ring_no && ring_no.match(/^\d*$/), 'ring_no error, unsupported ring_no : ' + ring_no);
        let leader = r['团长'];
        ctx.assert(leader, 'required field missing : leader');
        let leaderObj = await models.user.findOne(_.assign({account : leader}, appCache.getClubQueryCondition(belongClub)));
        ctx.assert(leaderObj, 'leader not exist : ' + leader);
        let player = r['玩家'];
        ctx.assert(player, 'required field missing : player');
        let playerObj = await models.user.findOne(_.assign({account : player}, appCache.getClubQueryCondition(belongClub)));
        ctx.assert(playerObj, 'leader not exist : ' + player);

        let tags = [];
        for(let name of (r['标签'] || '').split(',')){
            if (!name){
                continue;
            }
            if(!tagMap[name]){
                let tag = await models.tag.create({name, type : 'toy', club : belongClub, creator : _id, create_time : new Date()});
                tagMap[tag.name] = tag;
            }
            tags.push(tagMap[name]._id.toString());//这个toString不能省略，不然会出现计数不准的问题。
        }

        importList.push({
            ring_no,
            leader : leaderObj._id,
            player : playerObj._id,
            house_no : r['鸽棚号'],
            club : belongClub,
            tags,
            comment : r['备注'], //警惕用户输入，造成数据库攻击
            creator : _id,
            create_time : new Date()
        })
    }
    let resp = {total : importList.length, success : 0, message : '导入成功'};
    try{
        await models.toy.insertMany(importList);
        await tagService.updateTagRefCount('toy');
        resp.success = resp.total;
    }catch(err){
         resp.success = err.insertedDocs.length;
        if(err.code === 11000){
            let dupStr = err.message.match(/dup key: \{ ring_no: (.*),/);
            resp.message = `环号冲突，导致保存过程中断，请解决${dupStr[1]}环号的冲突后再试`
        }else{
            resp.message = err.message
        }

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
