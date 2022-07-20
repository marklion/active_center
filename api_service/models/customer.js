const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

/**
 * 客户表示一个企业级用户
 * @type {mongoose.Schema}
 */
let schema = new Schema({
    name : {type : String, unique: true},
    key : {type : Number, unique: true},
    pid : {type : ObjectId, default : ''},
    chain : String,                                         //客户链，key;key;key;可确定数据可见范围
    address : String,
    contact : {
        name : String,
        mobile : String,
        email : String
    },
    create_time : {type : Date, default : Date.now},
    status : {type : Number, default : 1}
});

let model = mongoose.model('customer', schema);

module.exports = model;
