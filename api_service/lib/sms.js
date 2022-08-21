import axios from 'axios';
export async function sendSMS(opt) {
    let timestamp = new Date().getTime();
    let msgId = timestamp + opt.mobile;
    let appkey = 'hxtxYJ',
        appcode = '1000',
        appsecret = process.env.SMS_SECRET;
    var ret = false;


    try {
        const crypto = require('crypto');
        const hash = crypto.createHash('md5');
        hash.update(`${appkey}${appsecret}${timestamp}`);
        const a = hash.digest('hex');
        let resp_data = await axios.post('http://sms.hexingtx.com:9090/sms/batch/v1', {
            appkey: appkey,
            appcode: appcode,
            sign: a,
            uid: msgId,
            phone: opt.mobile,
            msg: '【卓创维朗】' + opt.content,
            timestamp: timestamp
        });
        let result = resp_data.data;
        console.log(`发送短信结果${result.code}:${result.desc}, mobile = ${opt.mobile}, msgId = ${msgId}`);
        if (result.code == '00000') {
            ret = true;
        }
    } catch (error) {
        console.log(error);
    }

    return ret;
}