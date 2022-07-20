/**
 * 自动加载所有model
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const utils = require('../lib/utils');

let models = {ObjectId : mongoose.Types.ObjectId};
let dir = fs.readdirSync(__dirname + '/../models');

for (let i = 0; i < dir.length; i++) {
    let model = dir[i];
    if (path.extname(model) !== '.js') continue;
    let m = require(__dirname + '/../models/' + model);
    let name = utils.toCamel(path.basename(model, '.js')).replace('Model', '');
    console.log('load model: ', utils.toUnderLine(name));
    models[name] = m;
}
module.exports = models;