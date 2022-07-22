const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let roleSchema = new Schema({
    name            : {type : String, index : true},                               //角色名称
    type            : Number,  //0=超级管理员；1=manager，2=leader，3=player
    menus       : [String],                                   //accessible menus
    club        : {type : ObjectId, ref: 'club'},
    creator         : {type : ObjectId, ref : 'user'},  //对应adminUserModel 的objectId  //除超级管理员外，都有creator
    editable        : {type : Boolean, default : true},                              //是否可修改
    removed         : {type : Number, default : 0},                               //是否删除，0=否，1=是
    create_time     : Date,
    update_time     : {type : Date, default: Date.now},
});

let model = mongoose.model('role', roleSchema);

module.exports = model;






