'use strict';

var Koa = require('koa');
var serve = require('koa-static');
var router = require('koa-router')();
var koaBody = require('koa-body')();

var path = require('path');
var fs = require('fs');

var app = new Koa();

router.get('/', async function (ctx, next){
    // await ctx.render('index');
    ctx.type = 'html';
    ctx.body = fs.createReadStream('views/index.html');
});

router.put('/save', async function(ctx, next){

	var tag = ctx.request.body.id,
		data = ctx.request.body.data;

	var f = fs.openSync("documents/"+tag, 'w');
	var res = fs.writeSync(f, JSON.stringify(data));
	ctx.body = JSON.stringify({res:res});
});

router.get('/load/*', async function(ctx, next){
	var tag = ctx.request.url.split('/').pop();
	ctx.body = fs.readFileSync("documents/"+tag, 'utf8');
})

router.get('/load_name', async function(ctx, next){
	console.log('loaded name');
	var res = fs.readdirSync("documents/");
	ctx.body = JSON.stringify({res:res});

});

app.use(router.routes());
app.use(serve('public/'));


if (!module.parent) {
  app.listen(1337);
  console.log('listening on port 1337');
}
