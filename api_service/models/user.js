const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    SALT_WORK_FACTOR = 7;

let adminUserSchema = new Schema({
    account         : {type : String, required: true},       //登录名
    pwd             : {type : String, required: true},
    name            : String,                               //昵称
    mobile          : String,
    role            : {type : ObjectId, ref : 'role'},      //manager，leader，player，root
    privilege       : Object,
    club        : {type : ObjectId, ref : 'club'},
    creator         : ObjectId,  //对应adminUserModel 的objectId  //除超级管理员外，都有creator
    last_time       : Date,
    last_ip         : String,
    system          : Number,                              //是否是系统创建 1表示系统创建 不允许修改删除
    removed          : {type : Number, default : 0},                               //是否删除，0=否，1=是
    create_time     : Date,
    update_time     : {type : Date, default: Date.now}
});

adminUserSchema.index( { account: 1,  removed: 1}, { unique: true } );

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






