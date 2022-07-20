/**
 * Created by dongchen on 16/6/21.
 */
var log4js = require('log4js');

log4js.configure({
    appenders: {
        out: {
            type: 'stdout', //控制台输出
        },
        dailyLog: {
            type: 'dateFile', //文件输出
            pattern: "-yyyy-MM-dd.log",
            alwaysIncludePattern: false,
            filename: 'logs/daily.log',
            maxLogSize: 1024 * 1024 * 10,
            backups: 10,
            category: 'root'
        },
        // mailLog: {
        //     type: 'smtp',
        //     SMTP: {
        //         host: 'smtp.mxhichina.com',
        //         port: 465,
        //         auth: {
        //             user: 'notice@shuda.me',
        //             pass: 'Dd123321'
        //         }
        //     },
        //     sendInterval: 20,
        //     subject: '流量平台邮件日志',
        //     recipients: 'dongchen0502@163.com',
        //     sender: 'notice@shuda.me',
        //     category: 'mail'
        // },
        // replaceConsole: true,
    },
    categories : {
        default : {appenders : ['out'], level: 'info'},
        debug : {appenders : ['out', 'dailyLog'], level: 'debug'},
        prod : {appenders : ['dailyLog'], level: 'info'}
    }
});

let logger = log4js.getLogger('default');
// logger.level = 'debug';

module.exports = {
    logger: logger,
    get: log4js.getLogger,
    log4js: log4js
};
