'use strict';
var compress = require('koa-compress');
var logger = require('koa-logger');
var serve = require('koa-static');
var router = require('koa-router')();
var loadRouter = require('koa-router')({prefix: "/load"});
var koaBody = require('koa-body')();
var koa = require('koa');
var path = require('path');
var loki = require('lokijs');
var app = module.exports = koa();

var views = require('co-views');

var db = new loki('./data.json'),
	docs = db.addCollection('docs');

var render = views(__dirname + '/../views', {map:{html:'swig'}});

router.get('/', function *index(){
    this.body = yield render('index');
});

router.put('/save', koaBody, function *(){

	console.log(this.request.body.id);
	
	docs.removeDataOnly();
	docs.insert({tag:this.request.body.id, content: this.request.body.data});
	db.save();

	this.body = JSON.stringify({res:"ok"});
});

loadRouter.get('/load/*', function *(){
	console.log(this.request);

	console.log(docs.where(function(item){
		return item.tag == "docs";
	}));

	this.body = yield docs.where(function(item){
		return item.tag == "docs";
	})
})

app.use(loadRouter.routes());
app.use(router.routes());
app.use(serve('public/'));
app.use(compress());
app.use(logger());


if (!module.parent) {
  app.listen(5217);
  console.log('listening on port 5217');
}
