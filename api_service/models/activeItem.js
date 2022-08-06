const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let itemSchema = new Schema({
    name            : {type : String, required: true, unique : true},       //项目名称
    active          : {type : ObjectId, ref: 'active'},

    creator         : {type : ObjectId, ref: 'user'},  //userModel 的objectId
    removed          : {type : Number, default : 0},                               //是否删除，0=否，1=是
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

let model = mongoose.model('active_time', itemSchema);

module.exports = model;






