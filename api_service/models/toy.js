const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let toySchema = new Schema({
    ring_no         : {type : String, required: true},       //环号
    leader          : {type : ObjectId, required: true, ref : 'user'},
    player          : {type : ObjectId, required: true, ref : 'user'},                               //昵称
    house_no        : {type : String},//鸽棚号，与leader应该是一一对应
    club            : {type : ObjectId, required: true, ref : 'club'},
    //备注
    comment         : {type: String, default: ""},
    tags            : {type: Array, default: [{ type: ObjectId, ref: 'tags'}]},
    creator         : ObjectId,  //userModel 的objectId  //除超级管理员外，都有creator
    removed          : {type : Number, default : 0},                               //是否删除，0=否，1=是
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

let model = mongoose.model('toy', toySchema);

module.exports = model;






