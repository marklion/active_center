/**
 * 补充lodash中没用的工具方法
 * Created by dongchen on 2017/6/20.
 */
const _ = require('lodash');
const utils = require('utility');
const crypto = require('crypto');
const node_xlsx = require('node-xlsx');
const XLSX = require('xlsx');
const constants = require('../constant');

/**
 * 解析xls文件内容，返回arr[{title1 : value1, title2 : value2, ...}]
 * @param file
 * @param handler
 * @param sheet
 * @return {*|{msg: string, code: number}}
 */
function xlsxParser(file, sheet, handler) {
    var result = {code: 1, msg: ''};

    if (!file.originalname.endsWith('xlsx') && !file.originalname.endsWith('xls')) {
        result.code = 0;
        result.msg = '上传文件格式不正确，请上传excel文件';
        return result;
    }
    // let arr = [];
    // for (let i = 0; i != file.buffer.length; ++i) {
    //     arr[i] = String.fromCharCode(file.buffer[i]);
    // }
    // let bstr = arr.join('');

    let wb = XLSX.read(file.buffer, {type: 'buffer'});

    let first_sheet_name = wb.SheetNames[sheet || 0];

    /* Get worksheet */
    let ws = wb.Sheets[first_sheet_name];
    return handler(ws);
}
let curriedParser = _.curryRight(xlsxParser);

/**
 * 解析第一行是title，其余行是对应数据格式的xls文件，解析结果为[{titles:values}...]
 * @param ws
 * @returns {{msg: string, code: number, data: Array<[{titles:values}...]>}}
 */
function commonHandler(ws) {
    //code = 1,有错误; code = 0, 正确解析,内容在data
    let result = {
        code: 0,
        msg: '',
        data: []
    };
    let block = {
        row: 2,
        value: {}
    };
    try {
        for (let meta in ws) {
            /* all keys that do not begin with "!" correspond to cell addresses */
            if (meta[0] === '!') continue;
            let location = meta.match(/^([A-Z])(.*)$/);
            if (location) {
                let col = location[1];
                let row = +location[2];
                let value = ws[meta].w.trim();

                if (row === 1) {
                    block[col] = value.toLowerCase();
                } else {
                    if (row > block.row) {
                        result.data.push(block.value);
                        block.value = {}
                    }
                    block.row = row;
                    block.value[block[col]] = value;
                }
            }
        }
        result.data.push(block.value);
    } catch (err) {
        result.code = 1;
        result.msg = err.message;
    }

    return result;
}

/**
 * 构建xlsx内容，opts中每一项为{sheet：String, title: [{name : String, key : String}], data: [{keys : values}]}
 * @param opts = Array
 * @returns Buffer
 */
function buildExcelResultBuf(opts){
    if(_.isNil(opts)){
        throw '构建表格参数为' + opts;
    }
    if(!_.isArray(opts)){
        opts = [opts];
    }

    let finData = [];
    for (let sheet of opts) {
        let data = [];
        let title = sheet.title.map(function (item) {
            return item.name;
        });
        data.push(title);

        for (let key in sheet.data) {
            let row = [];
            _.each(sheet.title, function(item){
                row.push(sheet.data[key][item.key]);
            });
            data.push(row);
        }
        finData.push({name : sheet.sheet, data : data});
    }

    let buffer = node_xlsx.build(finData);
    return buffer;
}

/**
 * 分批获取数据库指定collection的记录，可用于循环操作中。
 */
class BatchHelper{

    constructor(collection, query, limit, key){
        this.query = query || {};
        this.limit = limit || 10;
        this.key = key || 'iccid';
        this.collection = collection;
        this.sortBy = {};
        this.sortBy[this.key] = '1';
        this.lastKey = 0;
    }

    async nextBatch(){
        this.query[this.key] = {$gt : this.lastKey};
        let list = await models[this.collection].find(this.query).sort(this.sortBy).limit(this.limit);
        if(list.length > 0){
            this.lastKey = list[list.length - 1][this.key];
        }
        return list;
    }
}
module.exports = {
    BatchHelper : BatchHelper,
    buildExcelResultBuf : buildExcelResultBuf,
    /**
     * return true or throw error
     * @param item
     * @param rules
     */
    validRules: function(item, rules){
        for(let rule of rules){
            let value = item[rule.key];
            if(rule.required && !value){
                throw new Error(rule.message);
            }
            if(value){
                if(rule.max && value.length > rule.max){
                    throw new Error(rule.message);
                }
                if(rule.min !== undefined && value.length < rule.min){
                    throw new Error(rule.message);
                }
                if(rule.enum && !rule.enum.includes(value)){
                    throw new Error(rule.message);
                }
                if(rule.regx && !value.match(rule.regx)){
                    throw new Error(rule.message);
                }
            }
        }
        return true;
    },

    SHA256 : function(s){
        return crypto.createHash('sha256').update(s).digest('hex');
    },
    SHA1 : function sha1(s){
        return crypto.createHash('sha1').update(s).digest('hex');
    },
    BASE64 : function(str){
        return new Buffer(str).toString('base64');
    },
    /**
     * @return {string}
     */
    MBorGB : function(data, fixed){
        let unit = 'M';
        data = +data;
        if(data >= 1024){
            unit = 'G';
            data /= 1024;
        }
        return data.toFixed(fixed || 0) + unit
    },
    //数据库转换成驼峰的命名写法
    toCamel : function (name) {
        name = name.replace(/\-|\_(\w)/g, function (x) {
            return x.slice(1).toUpperCase();
        });
        return name
    },

    //驼峰转下划线写法
    toUnderLine : function (name) {
        name = name.replace(/([A-Z])/g, "_$1").toLowerCase();
        return name
    },

    /**
     * 构建定长的随机数字字符串
     * @param length 字符串长度
     * @returns {string}
     */
    randomStr : function(length){
        return _.padStart((Math.random() * Math.pow(10, length)).toFixed(0), length, '0');
    },

    timeStr_random6 : function(){
        return new Date().getTime() + '_' + this.randomStr(6);
    },

    /**
     * 计算签名字符串, 默认大写32位MD5
     * 签名算法: key值按照字典排序呢, 然后拼接成queryString, 在最后拼上&key=secret, 加密
     * @param body 加密的对象
     * @param secret 秘钥
     * @param ops 设置,包括加密算法,输出格式
     * @returns String
     */
    getSign: function (body, secret, ops) {
        ops = _.assign(
            {
                algorithm: 'md5',
                lowerCase: false
            }, ops);

        let keyArr = _.keys(body).sort();
        let tmp = [];
        _.each(keyArr, function (key) {
            if (body[key] !== undefined) {
                tmp.push(`${key}=${body[key]}`);
            }
        });
        if(secret){
            tmp.push('key=' + secret);
        }

        let signStr = tmp.join('&');

        let result = utils[ops.algorithm](signStr);
        if (ops.lowerCase) {
            return result.toLowerCase();
        } else {
            return result.toUpperCase();
        }
    },

    sleep : async function (time){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    },

    commonXlsxFileParser : curriedParser(0, commonHandler),

};
