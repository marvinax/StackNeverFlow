'use strict';
var compress = require('koa-compress');
var logger = require('koa-logger');
var serve = require('koa-static');
var route = require('koa-route');
var koa = require('koa');
var path = require('path');
var app = module.exports = koa();

var views = require('co-views');

// Logger
app.use(logger());


var render = views(__dirname + '../../views', {map:{html:'swig'}});

app.use(route.get('/', function *index(){
    this.body = yield render('index');
}));

// Serve static files
app.use(serve(path.join(__dirname, '/../public/')));

// Compress
app.use(compress());

if (!module.parent) {
  app.listen(3000);
  console.log('listening on port 3000');
}
