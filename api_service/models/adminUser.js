const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    SALT_WORK_FACTOR = 7;

let adminUserSchema = new Schema({
    account         : {type : String, required: true, unique : true},       //登录名
    pwd             : {type : String, required: true},
    name            : String,                               //昵称
    mobile          : String,
    role            : {type : ObjectId, ref : 'role'},
    privilege       : Object,
    customer        : {type : ObjectId, ref : 'customer'},
    customer_name   : {type : String, default : ''},     //客户
    customer_chain  : {type : String, default : '', index : true},
    creator         : ObjectId,  //对应adminUserModel 的objectId  //除超级管理员外，都有creator
    last_time       : Date,
    last_ip         : String,
    system          : Number,                              //是否是系统创建 1表示系统创建 不允许修改删除
    status          : {type : Number, default : 1},                               //状态，0=关闭，1=开启
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

adminUserSchema.pre('save', function(next){
    let user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('pwd')) return next();

    // generate a salt
    let salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    let hash = bcrypt.hashSync(user.pwd, salt);
    user.pwd = hash;
    next();
});

adminUserSchema.methods.comparePassword = function(candidatePassword) {
    let isMatch = bcrypt.compareSync(candidatePassword, this.pwd);
    return isMatch;
};

let model = mongoose.model('admin_user', adminUserSchema);

module.exports = model;






