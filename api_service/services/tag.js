const utils = require('../lib/utils');

async function updateTagRefCount(model){
    //https://www.cnblogs.com/hapjin/p/7944404.html
    let result = await models[model].aggregate([
        {$match: {removed : 0}},
        {$unwind: '$tags'},
        {$group: {_id:'$tags', ref_count: {$sum : 1}}},

    ])
    await models.tag.updateMany({}, {ref_count : 0});
    for(let {_id, ref_count} of result){
        await models.tag.updateOne({_id}, {ref_count});
    }
    return result;
}

module.exports = {updateTagRefCount}
