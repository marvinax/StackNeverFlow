
var Vector = require('./Vector.js');
var Lever =  require('./Lever.js');
var Curve = require('./Curve.js');
var CurveSideOutline = require('./CurveSideOutline.js');


class Param{
 	constructor(name, value, min, max){
        this.name = name;
        this.value = value;
        this.min = min;
        this.max = max;
    }
}

class Document{
	constructor(canvas){
		this.canvas = canvas;
		this.curves = [];

		this.params = [];
		this.init = "";
		this.update = "";

		this.status = "Editing Existing Curves.";
	}
    
    eval(expr){
        var text = expr.split('\n'),
        	dstack = [],
        	consts = [],
        	err_flag = false;

        var pop = function(){
        	return dstack.pop();
        };

        var push = function(elem){
        	dstack.push(elem);
        	// console.log(JSON.stringify(dstack));
        };

        var refer = function(){
	    	var name = pop();
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'load/'+name);
			xhr.onload = function() {
			    if (xhr.status === 200) {
			        var res = JSON.parse(xhr.responseText);
			        push(LoadData.Curves(res.curves));
			        
			    }
			    else {
			        console.log('Request failed.  Returned status of ' + xhr.status);
			        err_flag = true;
			    }
			};
			xhr.send();
	    };

	    var put = function(){
	    	var key = pop();
	    	var val = pop();
			if(consts.some(function(elem){return elem.key == key;})){
	    		console.log('existing key. consider change a name');
	    		err_flag = true;
    		}else
	    		consts.push({key:key, val:val.Copy()});
	    }

	    var vec = function(){
	    	var x = pop();
	    	var y = pop();
	    	push(new Vector(parseFloat(x), parseFloat(y)));
	    }

	    var get = function(){
	    	var key = pop();
	    	var res = consts.filter(function(elem){return elem.key == key});
	    	if(res.length == 0){
	    		console.log('key not found');
	    		err_flag = true;
	    	} else 
	    		push(res[0].val);
	    }

	    var plus = function(){
	        var p1 = pop();
	        var p2 = pop();

	        push(p1.Add(p2));    	
	    }

	    var mult = function(){
	    	var p = pop();
			console.log(p);
	    	var n  = pop();
	    	console.log(n);
	    	if(typeof p == "number" && typeof n == "number")
	    		push(n * p);
	    	else if(typeof p == "object" && typeof p.x == "number" && typeof n == "number")
	    		push(p.Mult(n));
	    	else{
	    		console.log("mult type error");
	    		err_flag = true;
	    	}
	    }

	    var trans = function(){
	    	var elem = pop(),
	    		increm = pop(),
	    		array = elem.ExtractArray();

	    	console.log(elem);
	    	console.log(increm);

	    	elem.TransFromArray(array, increm);
	    }

	    var set = function(){
	    	var elem = pop(),
	    		newPoint = pop(),
	    		ith = parseInt(pop());
	    	elem.SetControlPoint(ith, newPoint);
	    }

	    var curve = function(){
	    	var ith = parseInt(pop());
	    	push(this.curves[ith]);
	    }.bind(this);

	    var lever = function(){
	    	var ith = parseInt(pop());
	    	var elem = pop();
	    	if(elem.levers != undefined)
	    		push(elem.levers[ith]);
	    	else{
	    		console.log("lever needs a curve ref ahead");
	    		err_flag = true;
	    	}
	    }

	    var point = function(){
	    	var ith = parseInt(pop());
	    	var elem = pop();
	    	if(elem.points != undefined)
	    		push(elem.levers[ith]);
	    	else{
	    		console.log("point needs a lever ref ahead");
    			err_flag = true;
    		}
	    }

    	var param = function(){
	    	var name = pop();
	    	var byName = this.params.filter(function(param){return param.name == name});
	    	if(byName == []){
	    		var usingIndex = this.params[parseInt(name)];
	    		if(usingIndex != undefined){
	    			push(parseFloat(usingIndex.value));
	    		}
	    	} else {
	    		push(parseFloat(byName[0].value));
	    	}
	    	console.log(dstack)
	    }.bind(this);

	    var curr;
	    var stack;

	    for (var i = 0; i < text.length; i++) {
	    	stack = text[i].split(" ");
	        while(true){
	    		curr = stack.pop();
	        	switch(curr){
	        		case "vec"   : vec();      break;
	        		case "get"   : get();	   break;
	        		case "put"   : put();      break;
	        		case "c":
	        		case "curve" : curve();    break;
	        		case "l":
	        		case "lever" : lever();    break;
	        		case "p":
	        		case "point" : point();    break;
	        		case "plus"  : plus();     break;
	        		case "mult"  : mult();     break;
	        		case "trans" : trans();    break;
	        		case "set"   : set();      break;
	        		case "param" : param();    break;
	        		default      : push(curr);
	        	}
	        	if(stack.length == 0) break;
	        	if(err_flag) break;
	        	console.log(JSON.stringify(consts));
	        }
	        if(err_flag){
	        	console.log("error raised, further eval stopped");
	        	break;
	        }
	    }
        console.log(dstack);
    } 
}

module.exports = Document;