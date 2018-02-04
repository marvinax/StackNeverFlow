var Vector =  require('./Vector.js');
var Lever =   require('./Lever.js');
var Curve =   require('./Curve.js');

Array.prototype.last = function(){
	return this[this.length - 1];
}

class Document{

	constructor(input){
		if(input != undefined){
			this.SetDocument(input);
		} else {
			this.params = {};
			this.init = "";
			this.update = "";
			this.curves = [];
			this.anchor = new Vector(0, 0);
			this.importedDocuments = {};
		}
	}

	SetDocument(input){
		this.params = input.params;
		this.init = input.init;
		this.update = input.update;
		this.curves = input.curves.map(function(curve){return new Curve(curve)});
		this.anchor = new Vector(input.anchor);
		for(var docName in res.importDocuments){
			this.importedDocuments[docName] = new Document(this.importedDocuments[docName]);
		}

	}

	InitEval(){
		this.dstack = [];
		this.rstack = [];
		this.lstack = [];
		this.vars = {};
		this.funs = {};
	}

	ClearEval(){
		delete this.dstack;
		delete this.rstack;
		delete this.lstack;
		delete this.vars;
		delete this.funs;
	}

	Save(){
		var xhr = new XMLHttpRequest();
		xhr.open('PUT', 'save/');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function() {
		    if (xhr.status === 200) {
		        var userInfo = JSON.parse(xhr.responseText);
		    }
		};
		this.ClearEval();
		xhr.send(JSON.stringify({id: docu_id, data:docu}));
	}

	Load(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'load/'+docu_id);
		xhr.onload = function() {
		    if (xhr.status === 200) {
		        var res = JSON.parse(xhr.responseText);
		    	console.log(res);
		        this.SetDocument(res);

		        // Move the things below to the outside, and triggered by
		        // finishing loading the data from server
		        
		        // neutron.ReloadExistingParams();
		        // document.getElementById("init-code").value = docu.init;
		        // document.getElementById("update-code").value = docu.update;
		        // docu.InitEval();
		        // docu.Eval(docu.init);
		        // docu.Eval(docu.update);

		    }
		    else {
		        alert('Request failed.  Returned status of ' + xhr.status);
		    }
		};
		xhr.send();

	}

	Eval(expr){
		var text = expr.split('\n'),
			literal_flag = false,
			exec_err_flag = false;

		var lit = function(){
			literal_flag = true;
		};

		var unlit = function(){
			literal_flag = false;
		};

		var pop = function(){
			return this.dstack.pop();
		}.bind(this);

		var push = function(elem){
			this.dstack.push(elem);
			// console.log(JSON.stringify(dstack));
		}.bind(this);

		var dup = function(){
			var val = pop();
			push(val);
			push(val);
		}

		var rot = function(){
			var val = parseInt(pop());
			if(val <= this.dstack.length){
				this.dstack.push(this.dstack.splice(-val,1)[0]);
				console.log("rot "+	JSON.stringify(this.dstack))
			}

			else {
				console.log('rotating length larger than dstack ');
				exec_err_flag = true;				
			}
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
			console.log(val);
			this.vars[key] = val.Copy();
			console.log(key.toString() + " " + JSON.stringify(this.vars[key]));
		}.bind(this);

		var fun = function(){
			var key = pop();
			this.funs[key] = this.lstack.reverse();
			this.lstack = [];
		}.bind(this);

		var vec = function(){
			var x = pop();
			var y = pop();
			push(new Vector(parseFloat(x), parseFloat(y)));
		};

		var set_curve = function(){
			var index = pop();
			var value = pop();
			this.curve[parseInt(index)] = value;
			puhs(value);
		};

		var set_lever = function(){
			var index = pop();
			var value = pop();
			var curve = pop();
			curve.levers[parseInt(index)] = value;
			push(curve);
		};

		var set_point = function(){
			var index = pop();
			var value = pop();
			var lever = pop();
			lever.SetControlPoint(parseInt(index), value);
			push(lever);
		};

		var float = function(){
			var p = pop();
			push(parseFloat(p));
		};

		var plus = function(){
			var p1 = pop();
			var p2 = pop();

			if(typeof p1 == "number" && typeof p2 == "number")
				push(p1 + p2);
			else if(typeof p1.x == "number" && typeof p2.x == "number")
				push(p1.Add(p2));
			else{
				console.log("plus type error");
				exec_err_flag = true;
			}
		};

		var subt = function(){
			var p1 = pop();
			var p2 = pop();

			if(typeof p1 == "number" && typeof p2 == "number")
				push(p1 - p2);
			else if(typeof p1.x == "number" && typeof p2.x == "number")
				push(p1.Sub(p2));
			else{
				console.log("sub type error: " + JSON.stringify(p1) + " " + typeof p1 + " " + p2 + " " + typeof p2 );
				exec_err_flag = true;
			}
		};

		var mult = function(){
			var p = pop();
			var n  = pop();
			if(typeof p == "number" && typeof n == "number")
				push(n * p);
			else if(typeof p.x == "number" && typeof n == "number")
				push(p.Mult(n));
			else{
				console.log("mult type error: " + typeof p + " " + typeof n);
				exec_err_flag = true;
			}
		};

		var dist = function(){
			var p1 = pop();
			var p2 = pop();
			push(p1.Dist(p2));
		};

		var trans = function(){
			var elem = pop(),
				increm = pop();
				console.log(increm);
			push(elem.TransCreate(increm));
		};

		var sin = function(){
			var elem = pop();
			push(Math.sin(elem / 180 * Math.PI));
		};

		var cos = function(){
			var elem = pop();
			push(Math.cos(elem / 180 * Math.PI));
		};

		var tan = function(){
			var elem = pop();
			push(Math.tan(elem / 180*Math.PI));
		};

		var mag = function(){
			var elem = pop();
			push(elem.Dist());
		};

		var norm = function(){
			var elem = pop();
			console.log(elem);
			push(elem.Mult(1/elem.Mag()));
		};

		var rotate = function(){
			var angle = pop(),
				rad   = angle / 180.0 * Math.PI;
			var about = pop();
			var dest  = pop();

			var newVec = dest.Sub(about);
			var x = newVec.x,
				y = newVec.y;
			newVec.x = Math.cos(rad) * x - Math.sin(rad) * y;
			newVec.y = Math.sin(rad) * x + Math.cos(rad) * y;

			push(newVec.Add(about));
		};

		var rot_lever = function(){
			var angle = pop(),
				rad   = angle / 180.0 * Math.PI;
			var about = pop();
			var dest  = pop();

			var destCopy = dest.Copy();
			var newVec;
			for (var i = destCopy.points.length - 1; i >= 0; i--) {
				newVec = destCopy.points[i].Sub(about);
				var x = newVec.x,
					y = newVec.y;
				newVec.x = Math.cos(rad) * x - Math.sin(rad) * y;
				newVec.y = Math.sin(rad) * x + Math.cos(rad) * y;
				destCopy.points[i] = about.Add(newVec);
			}

			push(destCopy);
		}

		var get_curve = function(){
			var ith = parseInt(pop());
			push(this.curves[ith]);
		}.bind(this);

		var get_lever = function(){
			var elem = pop();
			var ith = parseInt(pop());
			if(elem.levers != undefined)
				push(elem.levers[ith]);
			else{
				console.log("lever needs a curve ref ahead");
				exec_err_flag = true;
			}
		};

		var get_point = function(){
			var elem = pop();
			var ith = parseInt(pop());
			if(elem.points != undefined)
				push(elem.points[ith]);
			else{
				console.log("point needs a lever ref ahead");
				exec_err_flag = true;
			}
		};

		var get = function(){
			var key = pop();
			if(this.params[key] != undefined){
				push(parseFloat(this.params[key].value));
			} else if(this.vars[key] != undefined){
				push(this.vars[key]);
			} else if(this.funs[key] != undefined){
				this.rstack.push(this.funs[key].slice());
				exec(true);
			} else {
				console.log("key "+ key +"neither found in params nor vars");
				exec_err_flag = true;				
			}			
		}.bind(this);

		var imp = function(){
			var docu_id = pop();
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'load/'+docu_id);
				xhr.onload = function() {
				    if (xhr.status === 200) {
				        var res = JSON.parse(xhr.responseText);
						delete res.currLeverIndex;
						delete res.currCurveIndex;
						delete res.currPoint;
						delete res.captured;
						delete res.canvas;
						delete res.isEditingLever;
						delete res.isTranslatingLever;
						delete res.zpr;
						delete res.status;

						this.importedDocuments[docu_id]=res;
						this.importedDocuments[docu_id].curves = LoadData.Curves(this.importedDocuments[docu_id].curves);
						Draw.Curve(this.canvas.getContext("2d"), res, this.zpr);
				    }
				    else {
				        alert('Request failed.  Returned status of ' + xhr.status);
				    }
				}.bind(this);
			xhr.send();

		}.bind(this);

		var exec = function(mark){
			while(true){
				curr = this.rstack.last().pop();

				if(literal_flag && curr != "{" ){
					this.lstack.push(curr);
				} else {
					switch(curr){
						case "sin"	 : sin();       break;
						case "cos"   : cos();       break;
						case "tan"   : tan();       break;

						case "float" : float();		break;
						case "mag"	 : mag();   	break;
						case "dist"  : dist();      break;
						case "rotate": rotate();	break;
						case "rotlev": rot_lever(); break;
						case "vec"   : vec();		break;
						case "plus"  : plus();		break;
						case "sub"   : subt();		break;
						case "mult"  : mult();		break;

						case "@curve": get_curve();	break;
						case "@lever": get_lever();	break;
						case "@point": get_point();	break;

						case "&curve": set_curve(); break;
						case "&lever": set_lever(); break;
						case "&point": set_point(); break;
						case "trans" : trans();		break;

						case "dup"   : dup();       break;
						case "rot"   : rot();       break;

						case "@"     : get();       break;
						case "&"     : put();       break;
						case "."     : pop();       break;
						case "#"     : fun();       break;
						case "}"     : lit();       break;
						case "{"     : unlit();     break;
						case "import": imp(); 		break;
						default	:
							if(curr != "") push(curr);
					}
				}

				if(this.rstack.last().length == 0) {this.rstack.pop(); break;}
				if(exec_err_flag) {
					console.log("at "+curr);
					break;
				}
			}
		}.bind(this);

		var curr;

		for (var i = 0; i < text.length; i++) {
			this.rstack.push(text[i].split(" "));
			exec();
			if(exec_err_flag){
				console.log("error raised, further Eval stopped");
				console.log(text[i]);
				break;
			}
		}
		this.dstack = []
	}
	
}

module.exports = Document;