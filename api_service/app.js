const Koa = require('koa');
const app = new Koa();
const router = require('koa-router')();
const views = require('koa-views');
const config = require('config');
const convert = require('koa-convert');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');


const adminAuth = require('./lib/adminAuth');

const index = require('./routes/index');

// middlewares
app.use(convert(bodyparser));
app.use(convert(json()));
app.use(convert(logger()));
app.use(require('./lib/koa-static')(__dirname + '/public'));

app.keys = ['SOIFJW020394FJWEO'];//add it for generate the signed cookie key
// const session = require('koa-session-store');
const session = require('koa-session');
const sessionStore = require('./lib/sessionStore');

app.use(session({
  // key: 'koa:sess',
  maxAge: 86400000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: true,
  store: new sessionStore({
    collection: 'navigation', //数据库集合
    connection: mongodb,     // 数据库链接实例
    expires: 86400, // 默认时间为1天
    name: 'session' // 保存session的表名称
  })
}, app));


//add request_ip to context
app.use(async (ctx, next) => {
  let clientIP = ctx.request.ip;
  let subIndex = clientIP.lastIndexOf(':');
  ctx.requestIP = clientIP.substr(subIndex + 1);

  await next();
});

app.use(adminAuth.valid);

app.use(views(__dirname + '/views', {
  map : {html : 'ejs'}
}));

router.use('/', index.routes(), index.allowedMethods());
let restApi = require('./lib/commonApi');
router.use(config.basePath + '/rest', restApi.routes(), restApi.allowedMethods());

let apiList = [
  'auth','role', 'club','user','toy','tag','download','upload'
];
apiList.forEach((name) => {
  let controller = require('./routes/' + name);
  router.use(config.basePath + '/v1/' + name, controller.routes(), controller.allowedMethods());
});

app.use(router.routes(), router.allowedMethods());
// response

app.on('error', function(err, ctx){
  log.error('server error', err, ctx);
});


module.exports = app;
