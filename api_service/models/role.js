const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let roleSchema = new Schema({
    name            : {type : String, index : true},                               //角色名称
    type            : Number,  //0=超级管理员；1=admin，2=customer，3=apiOnly
    menus       : [String],                                   //accessible menus
    customer_name   : {type : String, default : ''},     //客户
    customer_chain  : {type : String, default : '', index : true},
    creator         : {type : ObjectId, ref : 'admin_user'},  //对应adminUserModel 的objectId  //除超级管理员外，都有creator
    editable        : {type : Boolean, default : true},                              //是否可修改
    status          : {type : Number, default : 1},                               //状态，0=关闭，1=开启
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

let model = mongoose.model('role', roleSchema);

module.exports = model;






