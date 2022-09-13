const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let activeSchema = new Schema({
    name            : {type : String, required: true},       //活动名称
    club            : {type : ObjectId, required: true, ref : 'club'},
    items           : [{
        name : {type : String},
        toy_limit : {type : Number, required: true}, //参赛羽数
        bet_values : [{
            code : {type : String, required : true},
            value : {type : Number, required : true},
        }]
    }],
    comment         : {type : String, default: ""},     //备注
    creator         : {type : ObjectId, ref: 'user'},  //userModel 的objectId
    removed          : {type : Number, default : 0},                               //是否删除，0=否，1=是
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

activeSchema.index( { name: 1, club:1, removed: 1}, { unique: true } );

let model = mongoose.model('active_template', activeSchema);

module.exports = model;






