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
router.post('/media', gridFs.single('file'), httpResult.resp(async ctx => {
    let file = ctx.req.file;
    log.debug(file);
    return file;
}));

router.get('/media', async (ctx, next) => {
    let _id = ctx.query.id;
    ctx.assert(_id, '未提交文件id');
    let fileMeta = await gfs.files.findOne({_id: gfs.tryParseObjectId(_id)});
    ctx.assert(fileMeta, '文件不存在');

    let readstream = gfs.createReadStream({_id});
    // ctx.attachment(fileMeta.filename);
    ctx.type = fileMeta.contentType;
    ctx.body = readstream;
});

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
