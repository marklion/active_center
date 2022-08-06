const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let activeSchema = new Schema({
    name            : {type : String, required: true, unique : true},       //活动名称
    club            : {type : ObjectId, required: true, ref : 'club'},
    bet_start_time  : {type : Date, required: true},
    bet_end_time    : {type : Date, required: true},
    start_time      : {type : Date, required: true},
    comment         : {type : String, default: ""},     //备注
    creator         : {type : ObjectId, ref: 'user'},  //userModel 的objectId
    removed          : {type : Number, default : 0},                               //是否删除，0=否，1=是
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

let model = mongoose.model('active', activeSchema);

module.exports = model;






