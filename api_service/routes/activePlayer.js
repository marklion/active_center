/**
 * active相关接口
 * Created by dongchen on 2022-08-17
 */
const router = require('koa-router')();
const _ = require('lodash');
const moment = require("moment");
const utils = require('../lib/utils')
const fs = require('fs')
const compressing = require('compressing');
import {doSomeCheckAndReturnQuery} from '../services/toy'

/**
 * 保存比赛记录
 */
router.post('/', httpResult.resp(async ctx => {
    let user = ctx.session.user;
    let data = ctx.request.body;

    ctx.assert(data.item, 'missing field : item');

    let activeItem = await models.activeItem.findOne({_id: data.item});
    ctx.assert(activeItem, 'active item error: not exist');

    ctx.assert(data.toys, 'missing field : toys');
    ctx.assert(data.toys.length % activeItem.toy_limit === 0, `toy limit error: you should submit ${activeItem.toy_limit} but ${data.toys.length}`);
    let toys = await models.toy.find({_id: {$in: data.toys}}).lean();
    let active = await models.active.findOne({_id: activeItem.active});
    ctx.assert(active, 'system error: active not exist');
    ctx.assert(active.canJoin(toys), 'active is not available');
    // ctx.assert(_.uniqBy(_.map(toys, 'player'), i => i._id.toString()).length === 1, 'request valid fail, all ring_no should belongs to one player')

    let group_id = utils.timeStr_random6();
    let resultList = [];
    try {
        for(let i = 0; i < data.toys.length; i++){
            if(i % activeItem.toy_limit === 0){
                group_id = utils.timeStr_random6();
            }
            let toy = toys.find(t => {
                console.log(t._id.str, t._id.toString(), data.toys[i])
                return t._id.toString() === data.toys[i]
            });

            resultList.push(await models.activePlayer.create({
                toy: toy._id,
                player: toy.player,
                leader: toy.leader,
                club: toy.club,
                active: activeItem.active,
                item: activeItem._id,
                group_id: group_id,
                creator: user._id,
                create_time: new Date()
            }));
        }
    } catch (err) {
        for(let result of resultList){
                await result.remove();
        }
        throw err;
    }
    return resultList;
}));

router.get('/', httpResult.resp(async ctx => {
    let q = await doSomeCheckAndReturnQuery(ctx)
    return await models.activePlayer.find(q).populate('toy');
}));

router.get('/export', httpResult.file(async ctx => {
    let user = ctx.session.user;
    let query = ctx.query;
    let active = await models.active.findOne({_id : query.active});
    let items = await models.activeItem.find({active: query.active});
    ctx.assert(items && items.length > 0, 'system error: no items exist in this active');
    let data = await models.activePlayer.find({active: query.active}).populate('toy').populate('leader');
    ctx.assert(data && data.length > 0, 'system error: no registration exist in this active');

    let basePath = `${__dirname}/../public/download/${user.account}/${query.active}`
    fs.mkdirSync(basePath, { recursive: true })
    let activePlayerMap = _.groupBy(data, 'item');
    for(let item of items){
        let itemRecords = activePlayerMap[item._id];
        let groups = _.groupBy(itemRecords, 'group_id');
        let writeString = '';
        for(let group of _.values(groups)){
            let tmp = _.map(group, 'toy.ring_no');
            writeString += `${group[0].leader.house_code},${tmp.join('|')}\r\n`
        }
        fs.writeFileSync(basePath + '/' + item.code + '.txt', writeString, {flag : 'w'})
    }
    let destFilePath = basePath + '/../' + active.name +  '.zip';
    await compressing.zip.compressDir(basePath, destFilePath);
    return destFilePath
}))

module.exports = router;
