
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

	init_eval(){
		this.dstack = [];
		this.consts = [];
	}

    eval(expr){
        var text = expr.split('\n'),
        	exec_hold_flag = false,
        	exec_err_flag = false;

        var hold = function(){
        	exec_hold_flag = true;
        }

        var unhold = function(){
        	exec_hold_flag = false;
        }

        var pop = function(){
        	return this.dstack.pop();
        }.bind(this);

        var push = function(elem){
        	this.dstack.push(elem);
        	// console.log(JSON.stringify(dstack));
        }.bind(this);

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
			        exec_err_flag = true;
			    }
			};
			xhr.send();
	    };

	    var put = function(){
	    	var key = pop();
	    	var val = pop();
			if(this.consts.some(function(elem){return elem.key == key;})){
	    		console.log('existing key. consider change a name');
	    		exec_err_flag = true;
    		}else
	    		this.consts.push({key:key, val:val.Copy()});
	    }.bind(this);

	    var get = function(){
	    	var key = pop();
	    	var res = this.consts.filter(function(elem){return elem.key == key});
	    	if(res.length == 0){
	    		console.log('key not found');
	    		exec_err_flag = true;
	    	} else 
	    		push(res[0].val);
	    }.bind(this);

	    var vec = function(){
	    	var x = pop();
	    	var y = pop();
	    	push(new Vector(parseFloat(x), parseFloat(y)));
	    }

	    var set = function(){
	    	var first_arg = pop();
	    	var second_arg;
	    	if(first_arg == "c" || first_arg == "curve"){
				second_arg = parseInt(pop());
				this.curves[second_arg] = pop();	    		
	    	} else if (first_arg == "l" || first_arg == "lever") {
    			second_arg = parseInt(pop());
    			var third = pop();
    			if(third == "c" || third == "curve"){
    				var forth = pop();
    				console.log(forth);
    				var fifth = pop();
    				console.log(JSON.stringify(fifth));
    				this.curves[forth].levers[second_arg] = fifth;
    			}
	    	}
	    }.bind(this);

	    var plus = function(){
	        var p1 = pop();
	        var p2 = pop();

	        push(p1.Add(p2));    	
	    }

	    var mult = function(){
	    	var p = pop();
	    	var n  = pop();
	    	if(typeof p == "number" && typeof n == "number")
	    		push(n * p);
	    	else if(typeof p == "object" && typeof p.x == "number" && typeof n == "number")
	    		push(p.Mult(n));
	    	else{
	    		console.log("mult type error");
	    		exec_err_flag = true;
	    	}
	    }

	    var trans = function(){
	    	var elem = pop(),
	    		increm = pop();
	    	push(elem.TransCreate(increm));
	    }

	    var drag = function(){
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
	    		exec_err_flag = true;
	    	}
	    }

	    var point = function(){
	    	var ith = parseInt(pop());
	    	var elem = pop();
	    	if(elem.points != undefined)
	    		push(elem.levers[ith]);
	    	else{
	    		console.log("point needs a lever ref ahead");
    			exec_err_flag = true;
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
	    }.bind(this);

	    var curr;
	    var stack;

	    for (var i = 0; i < text.length; i++) {
	    	stack = text[i].split(" ");
	        while(true){
	    		curr = stack.pop();
	    		if(exec_hold_flag && curr != "unhold"){
	    			push(curr);
	    		} else {
		        	switch(curr){
		        		case "hold"	 : hold();     break;
		        		case "unhold": unhold();   break;
		        		case "set"   : set();      break;
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
		        		case "drag"  : drag();     break;
		        		case "param" : param();    break;
		        		default      : push(curr);
		        	}	    			
	    		}
	        	if(stack.length == 0) break;
	        	if(exec_err_flag) break;
	        	// console.log(JSON.stringify(this.consts));
	        }
	        if(exec_err_flag){
	        	console.log("error raised, further eval stopped");
	        	break;
	        }
	    }
    } 
}

module.exports = Document;