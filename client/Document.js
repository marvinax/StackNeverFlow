
var Vector =  require('./model/Vector.js');
var Lever =   require('./model/Lever.js');
var Curve =   require('./model/Curve.js');
var Outline = require('./model/Outline.js');

var Cast =   require('./control/Cast.js');
var Draw =   require('./control/Draw.js');
var ZPR =    require('./control/ZPR.js');

Array.prototype.last = function(){
	return this[this.length - 1];
}

class Param{
 	constructor(name, value, min, max){
		this.name = name;
		this.value = value;
		this.min = min;
		this.max = max;
	}
}

var Status = Object.freeze({
		Editing : 0,
		Creating : 1,
		MovingCurve : 2,
		MovingLever : 3,
		EditingLever : 4
	});

class Document{
	constructor(canvas){
		this.canvas = canvas;
		this.curves = [];

		this.params = {};
		this.init = "";
		this.update = "";

		this.status = Status.Editing;
		this.isTranslatingLever = false;
		this.isEditingLever = false;

		this.currCurveIndex = null,
		this.currLeverIndex = null,
		this.currPoint = null;

		this.zpr = new ZPR();
	}

	CurrCurve(){
		return this.curves[this.currCurveIndex];
	}

	CurrLever(){
		return this.curves[this.currCurveIndex].levers[this.currLeverIndex];
	}

	AddCurve(curve){
		this.currCurveIndex = this.curves.push(curve) - 1;
	}

	AddPoint(point){
		if(this.currCurveIndex == null){
			this.AddCurve(new Curve(point));
		} else {
			if(this.SelectControlPoint(point, false) == -1){
				this.currLeverIndex = this.CurrCurve().Add(point);
				console.log(this.currLeverIndex);
			}
		}

		// otherwise the status will be switched to EditingLever.
		// watchout the side effect.

	}

	Deselect(){
		this.currCurveIndex = null,
		this.currLeverIndex = null,
		this.currPoint = null;
	}

	/**
	 * Once a casted control point of a lever found, set up current
	 * lever index and control point index, and set the status
	 * @param {[type]} point [description]
	 */
	SelectControlPoint(point, no_center){

		var cast = -1;
		if(this.currCurveIndex != null){

			for (const [i, lever] of this.CurrCurve().levers.entries()){
				cast = Cast.Lever(lever, point);
				if(cast != -1 && cast != (no_center ? 2 : -1)){
					this.currLeverIndex = i;
					this.currPoint = cast;
					this.status = Status.EditingLever;
					break;
				}
			}
		}

		return cast;
	}

	PrepareLeverTrans(ith, point){
		var transArray = [];
		var curve = this.curves[ith];

		for (const [i, lever] of this.CurrCurve().levers.entries()){
			var cast = Cast.Lever(lever, point);
			if(cast != -1){
				this.currLeverIndex = i;
				this.currPoint = cast;
				this.status = Status.MovingLever;
				transArray = this.CurrLever().ExtractArray();
				break;
			}
		}

		return transArray;

	}

	PrepareTrans(point){
		var transArray = [];
		for (const [ith, curve] of this.curves.entries()){
			if(Cast.Curve(curve, point) != -1) {
				this.currCurveIndex = ith;
				transArray = this.PrepareLeverTrans(ith, point);
				if(transArray.length == 0){
					this.status = Status.MovingCurve;
					transArray = this.CurrCurve().ExtractArray();
				}
				break;
			}
		}
		return transArray;
	}

	UpdateEdit(curr, orig, transArray){

		switch(this.status){
			case Status.Creating:
				this.CurrCurve().UpdateLever(this.currLeverIndex, 4, curr);
				break;
			case Status.MovingCurve:
				this.CurrCurve().TransFromArray(transArray, curr.Sub(orig));
				break;
			case Status.MovingLever:
				this.CurrLever().TransFromArray(transArray, curr.Sub(orig));
	            this.CurrCurve().UpdateOutlines();
	            break;
			case Status.EditingLever:
				console.log(this.currPoint);
				this.CurrCurve().UpdateLever(this.currLeverIndex, this.currPoint, curr);
				break;

		}
	}

	FinishEdit(){
		if(this.status != Status.Editing && this.status != Status.Creating){
			this.status = Status.Editing;
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

	UpdateDraw(context){
		for(let curve of this.curves){
			curve.UpdateOutlines();
		}
		Draw.Curves(context, this);
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
				console.log("rot "+JSON.stringify(this.dstack))
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
				console.log("sub type error: " + typeof p1 + " " + p2 + " " + typeof p2 );
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
			push(elem.Mult(1/elem.Mag()));
		};

		var rotate = function(){
			var angle = pop(),
				rad   = angle / 180.0 * Math.PI;
			var about = pop();
			var dest  = pop();

			var newVec = dest.Sub(about);
			newVec.x = Math.cos(rad) * newVec.x - Math.sin(rad) * newVec.y;
			newVec.y = Math.sin(rad) * newVec.x + Math.cos(rad) * newVec.y;


			push(newVec.Add(about));
		};

		var get_curve = function(){
			var ith = parseInt(pop());
			push(this.curves[ith]);
		}.bind(this);

		var get_lever = function(){
			var ith = parseInt(pop());
			var elem = pop();
			if(elem.levers != undefined)
				push(elem.levers[ith]);
			else{
				console.log("lever needs a curve ref ahead");
				exec_err_flag = true;
			}
		};

		var get_point = function(){
			var ith = parseInt(pop());
			var elem = pop();
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

		var exec = function(mark){
			while(true){
				curr = this.rstack.last().pop();
				// if(mark){
				// 	console.log(this.dstack.map(function(x){return JSON.stringify(x)}));
				// }
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
						default	:
							if(curr != "") push(curr);
					}
				}
				// if(mark){
				// 	console.log(this.dstack.map(function(x){return JSON.stringify(x)}));
				// }
				if(this.rstack.last().length == 0) {this.rstack.pop(); break;}
				if(exec_err_flag) {
					console.log("at "+curr);
					break;
				}
				// console.log(JSON.stringify(this.consts));
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
		// console.log(this.dstack);
	}
	
}

module.exports = Document;