const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let itemSchema = new Schema({
    toy: {type : ObjectId, required: true, ref : 'toy'},
    player: {type : ObjectId, required: true, ref: 'user'},
    leader: {type : ObjectId, required: true, ref: 'user'},
    club: {type : ObjectId, required: true, ref: 'club'},
    active : {type : ObjectId, required: true, ref: 'active'},
    item:{type : ObjectId, required: true, ref: 'active_item'},
    group_id: {type: String, default: ''},
    //     [{
    //     code : {type : String, required : true},
    //     name : {type : String},
    //     toy_limit : {type : Number, required: true}, //参赛羽数
    //     bet_value : Number,
    //     is_join : {type : Boolean, default : false}
    // }],
    operator        : {type : ObjectId, ref: 'user'},  //userModel 的objectId
    removed         : {type : Number, default : 0},                               //是否删除，0=否，1=是
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

let model = mongoose.model('active_player', itemSchema);

module.exports = model;






