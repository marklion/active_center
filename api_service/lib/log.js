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
        replaceConsole: true,
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
