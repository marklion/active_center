const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

/**
 * 俱乐部，数据隔离以此为依据
 * @type {mongoose.Schema}
 */
let schema = new Schema({
    name : {type : String, required : true},
    pid : {type : ObjectId, default : null},                  //下属俱乐部寻根使用
    address : {type : String, default : ''},
    contact : {
        name : {type : String, default : ''},
        mobile : {type : String, default : ''},
        email : {type : String, default : ''}
    },
    create_time : {type : Date, default : Date.now},
    removed : {type : Number, default : 0}
});

schema.index( { name: 1,  removed: 1}, { unique: true } );

let model = mongoose.model('club', schema);

module.exports = model;
