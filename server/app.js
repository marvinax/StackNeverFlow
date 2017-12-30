'use strict';
var compress = require('koa-compress');
var logger = require('koa-logger');
var serve = require('koa-static');
var router = require('koa-router')();
var koaBody = require('koa-body')();
var koa = require('koa');
var path = require('path');
var fs = require('fs');

var app = module.exports = koa();

var views = require('co-views');

// var db = new loki('./data.json'),
// 	docs = db.addCollection('docs');

var render = views(__dirname + '/../views', {map:{html:'swig'}});

router.get('/', function *index(){
    this.body = yield render('index');
});

router.put('/save', koaBody, function *(){

	var tag = this.request.body.id,
		data = this.request.body.data;

	console.log(tag);
	console.log(data);

	var f = fs.openSync("documents/"+tag, 'w');
	var res = fs.writeSync(f, JSON.stringify(data));
	this.body = JSON.stringify({res:res});
});

router.get('/load/*', function *(next){
	var tag = this.request.url.split('/').pop();
	this.body = fs.readFileSync("documents/"+tag, 'utf8');
})

router.get('/load_name', function*(){

	var res = fs.readdirSync("documents/");
	this.body = JSON.stringify({res:res});

});

app.use(router.routes());
app.use(serve('public/'));
app.use(compress());
app.use(logger());


if (!module.parent) {
  app.listen(1337);
  console.log('listening on port 1337');
}
