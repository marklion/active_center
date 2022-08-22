const mongoose = require('mongoose');
const {arrayToObject} = require("qs/lib/utils");

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let activeSchema = new Schema({
    name            : {type : String, required: true, unique : true},       //活动名称
    club            : {type : ObjectId, required: true, ref : 'club'},
    template_copy   : {},
    involved_leader : [{type : ObjectId, ref : 'user'}],
    bet_start_time  : {type : Date, required: true},
    bet_end_time    : {type : Date, required: true},
    start_time      : {type : Date, required: true},
    comment         : {type : String, default: ""},     //备注
    creator         : {type : ObjectId, ref: 'user'},  //userModel 的objectId
    status          : {type : Number, default : 0 },  //0=正常，1=人为终止报名
    removed          : {type : Number, default : 0},                               //是否删除，0=否，1=是
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

activeSchema.methods.canJoin = function(toys) {
    if(this.status > 0){
        return false;
    }
    let now = new Date();
    if(now < this.bet_start_time || now > this.bet_end_time){
        return false;
    }
    if(!toys || toys.length === 0){
        return false;
    }
    for(let toy of toys){
        if(!toy || !this.involved_leader.includes(toy.leader)){
            return false;
        }
    }

    return true;
};

let model = mongoose.model('active', activeSchema);

module.exports = model;






