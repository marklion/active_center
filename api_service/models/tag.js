const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

let schema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type : String,
        default: 'contact'
    },
    ref_count:{
        type: Number,
        default: 0
    },
    club :  {type : ObjectId, ref : 'club'},
    creator : {type : ObjectId, ref : 'admin_user'},
    removed          : {type : Number, default : 0},                               //状态，0=未删除，1=删除
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

schema.index( { name: 1, club: 1, removed: 1}, { unique: true } );

let model = mongoose.model("tag", schema);
module.exports = model;
