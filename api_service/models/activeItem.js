const mongoose = require('mongoose');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

let itemSchema = new Schema({
    active: {type: ObjectId, ref: 'active'},
    code: {type: String, required: true},
    name: {type: String, required: true},
    toy_limit: {type: Number, required: true}, //参赛羽数
    bet_value: Number,
    removed: {type: Number, default: 0},                               //是否删除，0=否，1=是
    create_time: Date,
    update_time: {type: Date, default: Date.now}
});

let model = mongoose.model('active_item', itemSchema);

module.exports = model;






