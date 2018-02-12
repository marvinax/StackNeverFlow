/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

class Vector{

	constructor(x, y){
		if(x.x != undefined && x.y != undefined && y == undefined){
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x;
			this.y = y;
		}
	}

	Copy(){
		return new Vector(this.x, this.y);
	}

	Abs(){
		return new Vector(Math.abs(this.x), Math.abs(this.y));
	}

	Dist(v){
		var dx = v.x - this.x;
		var dy = v.y - this.y;
		return Math.hypot(dx, dy);
	}

    Dot(v){
        return this.x*v.x + this.y*v.y;
    }

    Cross(v){
    	return this.x*v.y - this.y*v.x;
    }

	Mag(){
        return Math.hypot(this.x, this.y);
	}

	static Dist(v1, v2){
		var dx = v2.x - v1.x;
		var dy = v2.y - v1.y;
		return Math.hypot(dx, dy);
	}

	Normalize() {
		var d = Math.hypot(this.x, this.y);
		return new Vector(this.x/d, this.y/d);
	}

	Sub(v){
		return new Vector(this.x - v.x, this.y - v.y);
	}

    Subl(v){
        this.x -= v.x;
        this.y -= v.y;
    }

	Add(v){
		return new Vector(this.x + v.x, this.y + v.y);
	}

    Addl(v){
        this.x += v.x;
        this.y += v.y;
    }

	Mult(s){
		return new Vector(this.x * s, this.y * s);
	}

    Multl(s){
        this.x *= s;
        this.y *= s;
    }

	Set(x, y){
		if(typeof y !== "undefined"){
			this.x = x;
			this.y = y;
		} else {
			this.x = x.x;
			this.y = x.y;
		}
	}

	Angle(){
		return Math.atan(this.y/this.x);
	}

	get Zero(){
		return new Vector(0, 0);
	}

	LeftPerp(){
		return new Vector(-this.y, this.x);
	}

	RightPerp(){
		return new Vector(this.y, -this.x);	
	}

	toString(){
		return this.x.toFixed(3) + " " + this.y.toFixed(3);
	}
}

module.exports = Vector;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var Vector = __webpack_require__(0);

var LeverMode = Object.freeze({
    BROKEN		: 0,
    LINEAR 		: 2,
    PROPER 		: 3,
    SYMMETRIC	: 4
});

var StrokeMode = Object.freeze({
    FREE : 0,
    PERP : 1
})

var SelectMode = Object.freeze({
	NONE 		 : 0,
	LEVER_SELECT : 1
});

var LeverPoint = Object.freeze({
	POINT 		 : 2,
	CONTROL_1	 : 0,
	CONTROL_2 	 : 4,
	WIDTH_1 	 : 1,
	WIDTH_2	 	 : 3
});

class Lever {

	constructor(input){

        if(input != undefined){

            if(input.points != undefined){
                this.points     = input.points.map(function(point){return new Vector(point)});    
            }
            if(input.point != undefined){
                this.points = [
                    new Vector(input.point),
                    new Vector(input.point),
                    new Vector(input.point),
                    new Vector(input.point),
                    new Vector(input.point)
                ]
            }

            this.leverMode = (input.leverMode != undefined) ? input.leverMode : LeverMode.SYMMETRIC;
            this.selectMode = (input.selectMode != undefined) ? input.selectMode : SelectMode.NONE;
            this.strokeMode = (input.strokeMode != undefined) ? input.strokeMode : StrokeMode.FREE;

        } else {
			this.points = [
				Vector.Zero,
				Vector.Zero,
				Vector.Zero,
				Vector.Zero,
				Vector.Zero
			]
		}
	}

    Copy(){
        var newLever = new Lever();
        for (var i = newLever.points.length - 1; i >= 0; i--) {
            newLever.points[i] = this.points[i].Copy();
        }
        newLever.leverMode = this.leverMode;
        newLever.selectMode = this.selectMode;
        newLever.strokeMode = this.strokeMode;

        return newLever;
    }

    OppoOf(ith){
    	return 4 - ith;
    }

    Ratio(ith) {
    	var ithSide  = this.points[2].Dist(this.points[ith]),
    		oppoSide = this.points[2].Dist(this.points[this.OppoOf(ith)]);
        return ithSide / oppoSide;
    }

    OppoNorm(newPoint) {
        return (this.points[2].Sub(newPoint)).Normalize();
    }

    SetOppo(ith, oppoNorm, newDistance) {
        this.points[this.OppoOf(ith)] = this.points[2].Add(oppoNorm.Mult(newDistance));
    }

    SetControlPoint(ith, newPoint) {
    	var ratioOppo = this.Ratio(this.OppoOf(ith));
    	var oppoNorm  = this.OppoNorm(newPoint);

    	var dist;
    	switch(this.leverMode){

            /// for symmetric case, ratio is overwritten as 1
    		case LeverMode.SYMMETRIC:
    			ratioOppo = 1;

            /// recalculate to make proportional lever, the distance
            /// is calculated from the new distance between origin
            /// and currently selected control point.
	        case LeverMode.PROPER:
	            this.SetOppo(ith, oppoNorm, ratioOppo * this.points[2].Dist(newPoint));

            /// recalculate to make three points aligned on same
            /// line. use new direction and original distance of
            /// opposite control point.
	        case LeverMode.LINEAR:
	            this.SetOppo(ith, oppoNorm, this.points[2].Dist(this.points[this.OppoOf(ith)]));

            /// set new control point without affecting the oppo-
            /// site. The tangent will be broken.
     	   case LeverMode.BROKEN:
	            this.points[ith].Set(newPoint);

    	}
    }

    // ExtractArray and TransFromArray should be appear in Dragging handler,
    // to implement the real time update during dragging. When dragging around,
    // the lever should be always translated from same array (or point group)
    // until mouseup.

    ExtractArray(){
    	return [this.points[0].Copy(),
    			this.points[1].Copy(),
    			this.points[2].Copy(),
    			this.points[3].Copy(),
    			this.points[4].Copy()];
    }

    TransFromArray(points, inc){
    	this.points[0] = inc.Add(points[0]);
    	this.points[1] = inc.Add(points[1]);
    	this.points[2] = inc.Add(points[2]);
    	this.points[3] = inc.Add(points[3]);
    	this.points[4] = inc.Add(points[4]);
    }

    Trans(inc){
    	var array = this.ExtractArray();
    	this.TransFromArray(array, inc);
    }

    TransCreate(inc){
        var lever = this.Copy();
        lever.Trans(inc);
        return lever;
    }
}

module.exports = Lever;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var Outline = __webpack_require__(6);
var Vector  = __webpack_require__(0);
var Lever   = __webpack_require__(1);

var CurveMath = __webpack_require__(3);

class Curve {

    constructor(input){

        if(input != undefined){
            this.levers = input.levers.map(function(lever){return new Lever(lever)});
            this.outline = new Outline(input.outline);
        } else {
            this.levers = [];
            this.outline = new Outline();            
        }

    }

    Add(mouseV){
        this.levers.push(new Lever(mouseV));
        // this.GetOutlines();
        return this.levers.length - 1;
    }

    Delete(index){
        levers.splice(index, 1);
        this.GetOutlines();
    }
    
    Insert(curveCast) {
        this.levers.splice(Math.floor(curveCast+1), 0, new Lever(new Vector(0, 0)));
        CurveMath.SetInsertedLeverOnCurveGroup(this.levers, Math.floor(curveCast+1), curveCast - Math.floor(curveCast));
        console.log(this.levers.length);

        this.GetOutlines();
        
        return Math.floor(curveCast+1);
    }

    UpdateLever(ithLever, ithPoint, value){
        this.levers[ithLever].SetControlPoint(ithPoint, value);
        this.outline.GetOutline(this.levers);
    }

    GetOutlines(){
        this.outline.GetOutline(this.levers);
    }


    ExtractArray(){
    	var res = [];
        for(var lever of this.levers) res.push(lever.ExtractArray());
        return res;
    }

    TransFromArray(array, increment) {
    	// console.log(array);
        for (var i = 0; i < this.levers.length; i++) {
            this.levers[i].TransFromArray(array[i], increment);
        }
        this.GetOutlines();
    }
}

module.exports = Curve;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Vector = __webpack_require__(0);

class CurveMath{

    static GetPointOnCurve(t, points){
        return   points[0].Mult((1-t)  *(1-t)*(1-t))
        	.Add(points[1].Mult(3*(1-t)*(1-t)*(t)  ))
        	.Add(points[2].Mult(3*(t)  *(t)  *(1-t)))
            .Add(points[3].Mult((t)    *(t)  *(t)  ));
    }
  
    static GetPointOnCurveBetweenLever(t, l0, l1) {
    	return this.GetPointOnCurve(t, [l0.points[2], l0.points[4], l1.points[0], l1.points[2]]);
    }

    static SetInsertedLever(
        p0p,
        p0cp2,
        p1cp1,
        p1p,
        p1cp2,
        p2cp1,
        p2p, t
    ){

        var P0 = p0p;
        var P1 = p0cp2;
        var P2 = p2cp1;
        var P3 = p2p;

        var P0_1       = P0.Mult(1-t).Add(P1.Mult(t));
        var P1_2       = P1.Mult(1-t).Add(P2.Mult(t));
        var P2_3       = P2.Mult(1-t).Add(P3.Mult(t));
        var P01_12     = P0_1.Mult(1-t).Add(P1_2.Mult(t));
        var P12_23     = P1_2.Mult(1-t).Add(P2_3.Mult(t));
        var P0112_1223 = P01_12.Mult(1-t).Add(P12_23.Mult(t));

        p0cp2.Set(P0_1);
        p1cp1.Set(P01_12);
        p1p.Set(P0112_1223);
        p1cp2.Set(P12_23);
        p2cp1.Set(P2_3);

        // return [p0p, p0cp2, p1cp1, p1p, p1cp2, p2cp1, p2p];

    }

    static SetInsertedLeverOnCurve(p0, p1, p2, t){
        
        this.SetInsertedLever(
            p0.points[2],
            p0.points[4],
            p1.points[0],
            p1.points[2],
            p1.points[4],
            p2.points[0],
            p2.points[2], t);
    }

    static SetInsertedLeverOnCurveGroup(levers, ithNode, t){
        this.SetInsertedLeverOnCurve(
            levers[ithNode == 0 ? 0 : ithNode - 1],
            levers[ithNode],
            levers[(ithNode == levers.length - 1 ? ithNode : ithNode + 1)],
            t);
    }

    static GetClosestTFromGivenPoint(p0, p1, givenPoint, iter, slices) {

        var start = 0;
        var end   = 1;

        var curr_d = 0,
        	best_t = 0,
        	best_d = Infinity,
        	curr_P = new Vector(0, 0);

        for (var i = 0; i < iter; i++) {
            var tick = 0.1 * (end - start) / slices;

            for (var t = start; t <= end; t += tick) {
                
                curr_d = this.GetPointOnCurveBetweenLever(t, p0, p1).Dist(givenPoint);
                if (curr_d < best_d) {
                    best_d = curr_d;
                    best_t = t;
                }
            }

            start = Math.max(best_t - tick, 0);
            end   = Math.min(best_t + tick, 1);
        }

        return (start + end)/2;
    }

    static Det(a, b, c, d){
        // | a  b |
        // |      | => ad - bc
        // | c  d |
        return a*d - b*c;
    }

    static DetPoint(p1, p2){
        // | p1.x  p1.y |
        // |            | => p1.x * p2.y - p2.x * p1.y
        // | p2.x, p2.y |
        return p1.x * p2.y - p2.x*p1.y;        
    }

    static LineLineIntersection(pa1, pa2, pb1, pb2){
        var det_pa = this.DetPoint(pa1, pa2),
            det_pb = this.DetPoint(pb1, pb2);

        var delta_pa = pa2.Sub(pa1),
            delta_pb = pb2.Sub(pb1);

        var det_papb = this.DetPoint(delta_pa, delta_pb);

        var newX = -this.Det(det_pa, delta_pa.x, det_pb, delta_pb.x)/det_papb,
            newY = -this.Det(det_pa, delta_pa.y, det_pb, delta_pb.y)/det_papb;

        var parallel = delta_pa.Normalize().Dot(delta_pb.Normalize());

        // console.log("p",parallel);

        // if(Math.abs(parallel.x) < 0.001){
        //     newX = -pa2.x;
        // }
        // if(Math.abs(parallel.y) < 0.001){
        //     newY = -pa2.y;
        // }

        return {v : new Vector(newX, newY), p:parallel};
    }

    static SegSegIntersection(pa1, pa2, pb1, pb2){
        
        var det_s = this.DetPoint(pb1.Sub(pb2), pb1.Sub(pa1)),
            det_t = this.DetPoint(pa1.Sub(pa2), pb1.Sub(pa1)),
            det   = this.DetPoint(pb1.Sub(pb2), pa2.Sub(pa1));

        var s = det_s/det,
            t = det_t/det;

        // console.log((s).toFixed(3), " ", (t).toFixed(3));

        return {v : pa1.Add(pa2.Sub(pa1).Mult(s)), s:s, t:t};

    }

    static GetIdenticalCurve(l0, l1, side){

        var l0aux = l0.points[side].Sub(l0.points[2]).Add(l0.points[4]),
            l1aux = l1.points[side].Sub(l1.points[2]).Add(l1.points[0]);

        var cent_segment = l0.points[4].Sub(l1.points[0]);
        var norm;
            if(side == 1){
                norm = cent_segment.RightPerp();
            } else {
                norm = cent_segment.LeftPerp();
            }

        var offl0 = norm.Normalize().Mult(l0.points[side].Dist(l0.points[2])).Add(l0.points[4]),
            offl1 = norm.Normalize().Mult(l1.points[side].Dist(l1.points[2])).Add(l1.points[0]);

        // var ctx = document.getElementById("canvas").getContext("2d");
        //     ctx.beginPath();
        //     ctx.moveTo(l0.points[side].x, l0.points[side].y)
        //     ctx.lineTo(l0aux.x, l0aux.y);
        //     ctx.moveTo(offl0.x, offl0.y);
        //     ctx.lineTo(offl1.x, offl1.y);
        //     ctx.moveTo(l1aux.x, l1aux.y);
        //     ctx.lineTo(l1.points[side].x, l1.points[side].y)
        //     ctx.stroke();

        var l0c = this.LineLineIntersection(l0.points[side], l0aux, offl0, offl1),
            l1c = this.LineLineIntersection(offl0, offl1, l1aux, l1.points[side]),
            l01 = this.LineLineIntersection(l0.points[side], l0aux, l1aux, l1.points[side]),
            l01s = this.SegSegIntersection(l0.points[side], l0aux, l1aux, l1.points[side]),
            ld  = l1c.v.Sub(l0c.v);


            // if(l1c.p < -0.05){
            //     l0c.v = l01.v;
            // }
            // if(l0c.p < -0.05){
            //     l1c.v = l01.v;
            // }

            if(Math.abs(l1c.p) < 0.05){
                l0c.v = l0aux;
            }
            if(Math.abs(l0c.p) < 0.05){
                l1c.v = l1aux;
            }


            console.log("p ", l0c.p.toFixed(3), " ", l1c.p.toFixed(3));
            // console.log("s ",l01s.s, "t ",l01s.t);
            // if(Math.abs(l01s.s - 1) < 0.5){
            //     l0c.v = l0aux;
            // }
            // if(Math.abs(l01s.t - 1) < 0.5){
            //     l1c.v = l1aux;
            // }

            if( l01s.s < 1 && l01s.s > 0 && l01s.t < 1 && l01s.t > 0){
                l0c.v = l01s.v;
                l1c.v = l01s.v;
            }

        // console.log(offl0, offl1);

        return [l0c.v, l1c.v];
    }
}

module.exports = CurveMath;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

var Status = Object.freeze({
		Editing : 0,
		Creating : 1,
		MovingCurve : 2,
		MovingLever : 3,
		EditingLever : 4,
		MovingAnchor : 5
	});

module.exports = Status;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var Vector =  __webpack_require__(0);
var Lever =   __webpack_require__(1);
var Curve =   __webpack_require__(2);
var Draw =    __webpack_require__(7);

Array.prototype.last = function(){
	return this[this.length - 1];
}

class Document{

	constructor(input){

		this.params = {};
		this.init = "";
		this.update = "";
		this.curves = [];
		this.anchor = new Vector(0, 0);
		this.importedDocuments = {};

		if(input != undefined)
			this.SetDocument(input);
	}

	SetDocument(input){
		this.params = input.params;
		this.init = input.init;
		this.update = input.update;
		this.curves = input.curves.map(function(curve){return new Curve(curve)});
		this.anchor = new Vector(input.anchor);
		for(var docName in input.importDocuments){
			this.importedDocuments[docName] = new Document(this.importedDocuments[docName]);
			document.dispatchEvent(new Event('ondocuchange'));
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

	Eval(expr){

		var request = function(method, url, content){
			return new Promise(function(resolve, reject){
				var xhr = new XMLHttpRequest();
				xhr.open(method, url);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.onload = function(){return resolve(xhr.responseText)};
				xhr.onerror = function(){return reject(xhr.statusText)};
				xhr.send(content);
			})
		}


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

		var imp = async function(){
			var docu_id = pop();
			var res = await request('GET', 'load/'+docu_id);
			this.importedDocuments[docu_id] = new Document(JSON.parse(res));
			document.dispatchEvent(new Event('ondocuchange'));
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
		document.dispatchEvent(new Event('ondocuchange'));
	}

	EvalInit(){
		this.Eval(this.init);

		for(var curve of this.curves){
			curve.GetOutlines();
			console.log(curve.outline);
		}

	}

	EvalUpdate(){
		this.Eval(this.update);

		for(var curve of this.curves){
			curve.GetOutlines();
			console.log(curve.outline);
		}

	}
	
}

module.exports = Document;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Vector = __webpack_require__(0);
var Lever =  __webpack_require__(1);
var CurveMath = __webpack_require__(3);

var CurveSide = Object.freeze({
    LEFT :  1,
    RIGHT : 3
});

class Outline{

	constructor(input){
        if(input == undefined){
            this.outer = [];
            this.inner = [];            
        } else {
            if(input.outer != undefined){
                this.outer = input.outer.map(function(bezGroup){ return bezGroup.map(function(point){return new Vector(point)})});
            }
            if(input.inner != undefined){
                this.inner = input.inner.map(function(bezGroup){ return bezGroup.map(function(point){return new Vector(point)})});
            }
        }
	}


    GetOutline(levers){
        this.outer = [];
        this.inner = [];
        for (var i = 0; i < levers.length - 1; i++) {
            this.GetOutlineSegment(levers[i], levers[i+1], 0);
        }
    }


    GetOutlineSegment(l0, l1, level){
        // console.log("level"+level);
        // console.log(l0, l1);
        var l0aux1 = l0.points[1].Sub(l0.points[2]).Add(l0.points[4]),
            l1aux1 = l1.points[1].Sub(l1.points[2]).Add(l1.points[0]),
            l0aux3 = l0.points[3].Sub(l0.points[2]).Add(l0.points[4]),
            l1aux3 = l1.points[3].Sub(l1.points[2]).Add(l1.points[0]);

        var cent_segment = l0.points[4].Sub(l1.points[0]);

        var offl01 = cent_segment.RightPerp().Normalize().Mult(l0.points[1].Dist(l0.points[2])).Add(l0.points[4]),
            offl11 = cent_segment.RightPerp().Normalize().Mult(l1.points[1].Dist(l1.points[2])).Add(l1.points[0]),
            offl03 = cent_segment.LeftPerp().Normalize().Mult(l0.points[3].Dist(l0.points[2])).Add(l0.points[4]),
            offl13 = cent_segment.LeftPerp().Normalize().Mult(l1.points[3].Dist(l1.points[2])).Add(l1.points[0]);

        var l0c1 = CurveMath.LineLineIntersection(l0.points[1], l0aux1, offl01, offl11),
            l1c1 = CurveMath.LineLineIntersection(offl01, offl11, l1aux1, l1.points[1]),
            l0c3 = CurveMath.LineLineIntersection(l0.points[3], l0aux3, offl03, offl13),
            l1c3 = CurveMath.LineLineIntersection(offl03, offl13, l1aux3, l1.points[3]),
            l0l11 = CurveMath.SegSegIntersection(l0.points[1], l0aux1, l1aux1, l1.points[1]),
            l0l13 = CurveMath.SegSegIntersection(l0.points[3], l0aux3, l1aux3, l1.points[3]),
            l0l1 = CurveMath.SegSegIntersection(l0.points[2], l0.points[4], l1.points[0], l1.points[2]);

        var l0width = l0.points[1].Dist(l0.points[2]),
            l1width = l1.points[1].Dist(l1.points[2]);

        // console.log("level "+level+": l0l1 s:" + l0l1.s.toFixed(3) + " t:" + l0l1.t.toFixed(3) + "\n",
        //             "l0c1.p "+l0c1.p.toFixed(3) + " l1c1.p "+l1c1.p.toFixed(3)+
        //             " l0c3.p "+l0c3.p.toFixed(3) + "l1c3.p "+l1c3.p.toFixed(3));

        if(l0c1.p > 0.96){ l0c1.v = offl01; }
        if(l1c1.p > 0.96){ l1c1.v = offl11; }
        if(l0c3.p > 0.96){ l0c3.v = offl03; }
        if(l1c3.p > 0.99){ l1c3.v = offl13; }

        if(l0l1.s < 1 && l0l1.s > 0 && l0l1.t < 1 && l0l1.t > 0){
            this.outer.push([l0.points[1], l0l11.v, l0l11.v, l1.points[1]]);
            this.inner.push([l0.points[3], l0l13.v, l0l13.v, l1.points[3]]);            
        } else if(level == 2 || l0l1.s > 1 && l0l1.t < 0){
            this.outer.push([l0.points[1], l0c1.v, l1c1.v, l1.points[1]]);
            this.inner.push([l0.points[3], l0c3.v, l1c3.v, l1.points[3]]);
        } else {

            var vwo = (l0l1.s > 1 ? l1c1.v : l0c1.v),
                vwi = (l0l1.s > 1 ? l1c3.v : l0c3.v),
                vp  = (l0l1.s > 1 ? l1.points[0] : l0.points[4]);

            var t = CurveMath.GetClosestTFromGivenPoint(l0, l1, vwo, 3, 3);
            // console.log("t val:"+t);

            var s = new Lever({point:new Vector(0,0)}),
                l1copy = l1.Copy(),
                l0copy = l0.Copy();
                
            CurveMath.SetInsertedLeverOnCurve(l0copy, s, l1copy, t);

            s.points[1] = s.points[2].Add(vwo.Sub(vp).Normalize().Mult((l1width + t*(l0width - l1width))));
            s.points[3] = s.points[2].Add(vwi.Sub(vp).Normalize().Mult((l1width + t*(l0width - l1width))));

            // console.log("haha"+JSON.stringify(s));
            this.GetOutlineSegment(l0copy, s, level+1);
            this.GetOutlineSegment(s, l1copy, level+1);                    
        }

    }

}

module.exports = Outline;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var ZPR = __webpack_require__(8);
var Vector = __webpack_require__(0);

class Draw{

    static Status(ctx, docu){
        var zpr = docu.zpr;
        ctx.strokeStyle = "#000000";
        ctx.font = "16px TheMixMono";

        ctx.strokeStyle = "#CCCCCC";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<65; i++){
            var y1 = zpr.Transform(new Vector(i*30-450, -450)),
                y2 = zpr.Transform(new Vector(i*30-450, 1500)),
                x1 = zpr.Transform(new Vector(-450, i*30-450)),
                x2 = zpr.Transform(new Vector(1500, i*30-450));
            ctx.moveTo(y1.x, y1.y);
            ctx.lineTo(y2.x, y2.y);
            ctx.moveTo(x1.x, x1.y);
            ctx.lineTo(x2.x, x2.y);
        }
        ctx.stroke();

        var status;
        switch(docu.status){
            case 0: ctx.fillText('Editing', 10, 25); break;
            case 1: ctx.fillText('Creating', 10, 25); break; 
            case 2: ctx.fillText('MovingCurve', 10, 25); break; 
            case 3: ctx.fillText('MovingLever', 10, 25); break; 
            case 4: ctx.fillText('EditingLever', 10, 25); break;
            case 5: ctx.fillText('MovingAnchor', 10, 25); break;
        }

        ctx.fillText(docu.zpr.zoom.toFixed(3)+"x", 10, 45);        
    }

    static CurrCurve(ctx, curves, currCurve){

        if(currCurve != null) {
            console.log(currCurve);
            var curve = curves[currCurve];

            for (var [i, lever] of curve.levers.entries()) {

                for(var [j, point] of lever.points.entries()){

                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                    ctx.fillText("p"+i+","+j, point.x-10, point.y-10);
                    ctx.stroke();
                }

                ctx.beginPath();
                for (var i of [0, 1, 3, 4]) {
                    ctx.moveTo(lever.points[2].x, lever.points[2].y);
                    ctx.lineTo(lever.points[i].x, lever.points[i].y);
                }
                ctx.stroke();

                var s;
                switch(lever.leverMode){
                    case 0: s = "broken"; break;
                    case 2: s = "linear"; break;
                    case 3: s = "proper"; break;
                    case 4: s = "symmetric"; break;
                }

                ctx.fillText(s, lever.points[4].x + 10, lever.points[4].y + 5);
            }

        }

    }


    static Outline(ctx, curves){

        for (const [ith, curve] of curves.entries()) {
            ctx.lineWidth = 1;
            if(curve.levers.length > 1){


                ctx.strokeStyle = "#434343";
                var i = 0;
                ctx.beginPath();
                for (; i < curve.o.length; i++) {
                    // console.log(curve.o[i][0]);
                    ctx.moveTo(curve.o[i][0].x,curve.o[i][0].y)
                    ctx.bezierCurveTo(
                        curve.o[i][1].x,curve.o[i][1].y,
                        curve.o[i][2].x,curve.o[i][2].y,
                        curve.o[i][3].x,curve.o[i][3].y
                    )
                }
                ctx.stroke();
                ctx.beginPath();
                i = 0;
                for (; i < curve.i.length; i++) {
                    ctx.moveTo(curve.i[i][0].x,curve.i[i][0].y)
                    ctx.bezierCurveTo(
                        curve.i[i][1].x,curve.i[i][1].y,
                        curve.i[i][2].x,curve.i[i][2].y,
                        curve.i[i][3].x,curve.i[i][3].y
                    )
                }
                // ctx.lineTo(curve.o[i-1][3].x, curve.o[i-1][3].y)
                ctx.stroke();


                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 2;

                var first = curve.levers[0].points[2],
                    sec   = curve.levers[0].points[1],
                    diam  = sec.Sub(first).Normalize().Mult(20);

                for (const [i, lever] of curve.levers.entries()) {
                    var point = lever.points[2];
                    ctx.fillText(i, point.x+10, point.y-10);
                }

                ctx.beginPath();
                ctx.moveTo(curve.levers[0].points[2].x, curve.levers[0].points[2].y);
                for (var i = 0; i < curve.levers.length - 1; i++) {
                    ctx.bezierCurveTo(
                        curve.levers[i].points[4].x,   curve.levers[i].points[4].y,
                        curve.levers[i+1].points[0].x, curve.levers[i+1].points[0].y,
                        curve.levers[i+1].points[2].x, curve.levers[i+1].points[2].y
                    )
                }
                ctx.stroke();

            }

        }

    }

    static Curve(ctx, docu, zpr, currCurve){
        var zpr_curves = docu.curves.map(function(curve){
            return { levers: curve.levers.map(function(lever){
                        return {
                            points: lever.points.map(function(point){ return zpr.Transform(point);}),
                            leverMode : lever.leverMode
                        }
                    }),
                o : curve.outline.outer.map(function(group){return group.map(function(point){return zpr.Transform(point)})}),
                i : curve.outline.inner.map(function(group){return group.map(function(point){return zpr.Transform(point)})})
            }

        });

        // console.log(zpr_curves);
        Draw.CurrCurve(ctx, zpr_curves, currCurve);
        Draw.Outline(ctx, zpr_curves);
        for (var sub_docu in docu.importedDocuments){
            console.log(sub_docu);
            Draw.Curve(ctx, docu.importedDocuments[sub_docu], zpr);
        }
    }

    static Anchor(ctx, docu, zpr){
        ctx.strokeStyle = "#606060";
        var zpr_anchor = zpr.Transform(docu.anchor);
        ctx.beginPath();
            ctx.moveTo(zpr_anchor.x-10, zpr_anchor.y);
            ctx.lineTo(zpr_anchor.x+10, zpr_anchor.y);
            ctx.moveTo(zpr_anchor.x, zpr_anchor.y-10);
            ctx.lineTo(zpr_anchor.x, zpr_anchor.y+10);
            ctx.moveTo(zpr_anchor.x+15, zpr_anchor.y);
            ctx.arc(zpr_anchor.x, zpr_anchor.y, 15, 0, Math.PI*2);
        ctx.stroke();   

    }


    static Captured(ctx, docu){
        var captured = docu.captured;

        ctx.strokeStyle = "#AE0000";

        if(captured != null){
            ctx.beginPath();
                if(captured.type == "center")
                    if(captured.over == "x"){
                        ctx.moveTo(captured.by.x, captured.by.y);
                        ctx.lineTo(docu.CurrLever().points[2].x, captured.by.y);
                    } else {
                        ctx.moveTo(captured.by.x, captured.by.y);
                        ctx.lineTo(captured.by.x, docu.CurrLever().points[2].y);                    
                    }
                if(captured.type == "control"){
                    var longer = captured.over.Mult(10);
                    ctx.moveTo(captured.by.x, captured.by.y);
                    ctx.lineTo(captured.by.x + longer.x, captured.by.y + longer.y);
                }

                ctx.arc(captured.by.x, captured.by.y, 10, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    static Editor(editor){

        var ctx = editor.context;

        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

        Draw.Status(ctx, editor);
        // Draw.Captured(ctx, docu);

        ctx.strokeStyle = "#000000";
        Draw.Curve(ctx,  editor.docu, editor.zpr, editor.currCurveIndex);
        Draw.Anchor(ctx, editor.docu, editor.zpr);
    }
}

module.exports = Draw;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var Vector = __webpack_require__(0);
var Matrix = __webpack_require__(18);

/**
 * Zoom, Pan and Rotate
 */
class ZPR {
	
	constructor(){
		this.zoom = 1;
		this.pan = new Vector(0, 0);
		this.trans = new Matrix();
		this.invTrans = new Matrix();
	}

	/**
	 * for transforming model to screen point
	 * @param {[type]} vec [description]
	 */
	Transform(vec){
		return this.trans.Mult(vec);
	}

	/**
	 * for transforming screen point to model
	 * @param {[type]} vec [description]
	 */
	InvTransform(vec){
		return this.invTrans.Mult(vec);
	}

	/**
	 * for doing zpr operation with mouse event
	 * @param  {[type]} mouseScreenVec [description]
	 * @return {[type]}                [description]
	 */
	Zoom(mouseScreenVec, zoomInc){
		var newZoom = (this.zoom >= 3 && zoomInc > 0) ? 1 : (this.zoom <= 0.6 && zoomInc < 0) ? 1 : 1 + zoomInc;

		var newM1 = new Matrix(),
			newM2 = new Matrix(),
			newM3 = new Matrix();

		newM1.SetPan(mouseScreenVec);
		newM2.SetZoom({x:newZoom, y:newZoom});
		newM3.SetPan({x:-mouseScreenVec.x, y:-mouseScreenVec.y});

		this.trans = newM3.Mult(newM2).Mult(newM1).Mult(this.trans);
		this.invTrans = this.trans.Inv();
		this.zoom *= newZoom;
	}

	Reset(){
		this.zoom = 1;
		this.pan = new Vector(0, 0);
		this.trans = new Matrix();
		this.invTrans = new Matrix();
	}
}

module.exports = ZPR;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {


var CurveMath = __webpack_require__(3);

class Cast{
    
    static CurveRect(curve, curr){
        return curve.bounding[0].x < curr.x && curve.bounding[1].x > curr.x &&
               curve.bounding[0].y < curr.y && curve.bounding[1].y > curr.y;
    }
    
    static Curve(curve, curr) {
        
    	var CAST_DIST = 9;

        var t, p, dist;
        for (var i = 0; i < curve.levers.length - 1; i++) {

            t = CurveMath.GetClosestTFromGivenPoint(curve.levers[i], curve.levers[i+1], curr, 6, 4);
            p = CurveMath.GetPointOnCurveBetweenLever(t, curve.levers[i], curve.levers[i+1]);
            dist = p.Dist(curr);
            if (dist < CAST_DIST)
                return i + t;
        }
        return -1;
    } 

    static CurveIthLever(curve, curr) {

    	var CAST_DIST = 9;

        var i = 0,
        	found = false;

        for (; i < curve.levers.length; i ++) {
        	found = PVector.dist(curve.levers[i].points[2], curr) < CAST_DIST;
        	if(found) break;	
        } 

        if(!found) i = -1;

        return i;
    }

    static Lever(lever, curr){

		var CAST_DIST = 9;    
        var castSequence = [0, 4, 1, 3, 2];
        
        var res = -1;
        for(var ith = 0; ith < 5; ith++)
            if(lever.points[castSequence[ith]].Dist(curr) < CAST_DIST){
            	console.log(ith + " " + castSequence[ith]);
                res = castSequence[ith];
                break;
            }
        return res;
    }
}

module.exports = Cast;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(11)

var Editor = __webpack_require__(16);
var Vector   = __webpack_require__(0);

(function(){
	window.onload = function() {
		var editor = new Editor();
	}	
})();


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(12);

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(14)(content, options);

if(content.locals) module.exports = content.locals;

if(false) {
	module.hot.accept("!!../node_modules/_css-loader@0.21.0@css-loader/index.js!./styles.css", function() {
		var newContent = require("!!../node_modules/_css-loader@0.21.0@css-loader/index.js!./styles.css");

		if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];

		var locals = (function(a, b) {
			var key, idx = 0;

			for(key in a) {
				if(!b || a[key] !== b[key]) return false;
				idx++;
			}

			for(key in b) idx--;

			return idx === 0;
		}(content.locals, newContent.locals));

		if(!locals) throw new Error('Aborting CSS HMR due to changed css-modules locals.');

		update(newContent);
	});

	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(13)();
// imports


// module
exports.push([module.i, "/* CSS */\nbody\n{\n\tfont-family: helvetica, sans-serif;\n\tfont-size: 85%;\n\tmargin: 10px 15px;\n\tcolor: #333;\n\tbackground-color: #ddd;\n}\n\nh1\n{\t\n\tfont-family: TheMixMono;\n\tfont-size: 2.6em;\n\tfont-weight: black;\n\tletter-spacing: -0.12em;\n\tmargin: 0 0 0.3em 0;\n}\n\nh2\n{\n\tfont-size: 1.4em;\n\tfont-weight: normal;\n\tmargin: 1.5em 0 0 0;\n}\n\n#img{\n\twidth:3em;\n}\n\ncanvas\n{\n\tclear:left;\n\tfloat:left;\n\tdisplay: inline;\n\twidth:  600px;\n\theight: 600px;\n\tmargin: 0 10px 10px 0;\n\tbackground-color: #fff;\n}\n\n#button_group{\n}\n\n#list{\n\tmargin: 10px;\n}\n\n#save_group{\n\t/*clear:left;*/\n}\n\n.char-link{\n\tmargin : 10px;\n}\n\n.code\n{\n\tdisplay: block;\n\twidth: 580px;\n\toutline: none;\n\tborder:none;\n    border-color: Transparent; \n    border-radius: 4px;\n\n\theight: 4em;\n\tfont-family: \"TheMixMono\", monospace;\n\tfont-size: 0.9em;\n\t/*padding: 2px 4px;*/\n\tmargin: 8px;\n\tcolor: #555;\n\tbackground-color: #eee;\n\tborder: 1px solid #999;\n\toverflow: auto;\n}\n\n#param-group{\n\tmargin : 10px;\n}\n\n#param-name{\n\tmargin-top: 3px;\n\twidth:74px;\n}\n\n.param-name-label{\n\t/*margin-right: 50px;*/\n\t/*float:left;*/\n\t/*margin-top: 50px;*/\n\tdisplay: inline-block;\n\twidth:80px;\n}", ""]);

// exports


/***/ }),
/* 13 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(15);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 15 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var Status = __webpack_require__(4);
var EditorCoreData = __webpack_require__(17);

var Document = __webpack_require__(5);
var Neutron  = __webpack_require__(19);

var Vector   = __webpack_require__(0);
var Lever    = __webpack_require__(1);
var Curve    = __webpack_require__(2);
var Outline  = __webpack_require__(6);

var Cast     = __webpack_require__(9);
var Draw     = __webpack_require__(7);
var ZPR      = __webpack_require__(8);

class Editor extends EditorCoreData {
	constructor(){
		super();
		
		this.docu = new Document();
		this.docu.InitEval();
		this.neutron = new Neutron(this);
		this.zpr = new ZPR();
		this.context = document.getElementById("canvas").getContext("2d");

		this.down = null;
		this.curr = null;
		this.orig = null;

		this.InitEvents();
		this.UpdateDraw("init");
	}

	SetAnchor(newPoint){
		this.docu.anchor = newPoint;
	}

	MoveLever(){
		this.TransCurrLever(this.curr.Sub(this.orig));
	}

	EditLever(){
		this.UpdateCurrLever(this.curr);
	}

	UpdateEdit(){

		switch(this.status){
		case Status.Creating:
			this.CurrCurve().UpdateLever(this.currLeverIndex, 4, this.curr);
			break;
		case Status.MovingAnchor:
			this.SetAnchor(this.curr); break;
		case Status.MovingCurve:
			this.TransCurrCurve(this.curr.Sub(this.orig));
			break;
		case Status.MovingLever:
			this.MoveLever();
            break;
		case Status.EditingLever:
			this.EditLever();
			break;
		}

		for(var curve of this.docu.curves){
			curve.GetOutlines();
			// console.log(curve.outline);
		}
		// console.log(this.docu);

	}

	FinishEdit(){
		if(this.status != Status.Editing && this.status != Status.Creating){
			this.status = Status.Editing;
		}
	}

	
	Drag(event) {
		
		event.stopPropagation();

		var rect = event.target.getBoundingClientRect();
		var MouseV = new Vector(
			Math.max(rect.left, Math.min(rect.right, event.clientX - rect.left)) * 1.5,
			Math.max(rect.top,  Math.min(rect.bottom, event.clientY - rect.top)  * 1.5)
		);

		if (!this.down && (event.type == "mousedown")) {
			this.down   = true;
			this.orig = this.zpr.InvTransform(MouseV);
			this.curr = this.zpr.InvTransform(MouseV);

			switch(this.status){
			case Status.Creating:
				this.AddPoint(this.orig); break;
			case Status.MovingAnchor:
				this.SetAnchor(this.curr); break;
			case Status.EditingLever:
				this.SelectControlPoint(this.curr);
				if(this.currLeverIndex == null) this.Deselect(); break;
			case Status.Editing:
				this.PrepareTrans(this.curr);
				if(this.transArray.length == 0) this.Deselect(); break;
			}
			this.UpdateDraw("mouseDown");
		}

		if (this.down && (event.type == "mousemove")) {
			
			this.curr = this.zpr.InvTransform(MouseV);
							
			this.UpdateEdit();
			this.UpdateDraw("mouseMoved");
		}
		
		if (this.down && (event.type == "mouseup")) {
			this.down = false;
			this.orig = null;
			this.FinishEdit();
			this.UpdateDraw("mouseUp");
		}

	}

	UpdateDraw(info){
		Draw.Editor(this);
	}

	ToggleCreate(){
		console.log(this.status);
		if(this.status == Status.Creating){
			this.status = Status.Editing;
			this.Deselect();
			this.UpdateDraw("set to editing mode");			
		} else if(this.status == Status.Editing){
			this.status = Status.Creating;
	        this.Deselect();
			this.UpdateDraw("set to creating mode");			
		}
	}

	ToggleEditingLever(){
		if(this.status == Status.EditingLever){
			this.status = Status.Editing;
		}
		if(this.status == Status.Editing){
			this.status = Status.EditingLever;
		}		
	}

	ToggleMoveAnchor(evt){
		evt.preventDefault();
		if(this.status == Status.Editing){
			this.status = Status.MovingAnchor;
		} else if(this.status == Status.MovingAnchor){
			this.status = Status.Editing;	
		}
	}

	SetLeverType(evt){
		var typeIndex = parseInt(evt.key),
			typeArray = [4, 3, 2, 0];
		if(typeIndex > 0 && typeIndex < 9){
			if(this.currCurveIndex != null && this.currLeverIndex != null){
				this.CurrLever().leverMode = typeArray[typeIndex];
				this.UpdateDraw();
			}					
		}

	}

	RemoveLeverUpdate(){
		this.RemoveLever();
		this.UpdateDraw("lever removed");
	}

	Zoom(event){
		event.preventDefault();

		var rect = event.target.getBoundingClientRect();
		var mouseV = new Vector(
			Math.max(rect.left, Math.min(rect.right, event.clientX - rect.left)) * 1.5,
			Math.max(rect.top,  Math.min(rect.bottom, event.clientY - rect.top)  * 1.5)
		);

		var zoomInc = event.deltaY*0.00005;
		this.zpr.Zoom(mouseV, zoomInc);
		this.UpdateDraw();
	}

	InitEvents(){
		document.onkeydown = function(evt) {

			if(evt.ctrlKey && evt.key == "c"){
				this.ToggleCreate();
			}

            if(evt.ctrlKey && evt.key == "Delete"){
            	this.RemoveLever(evt);
            }

			if(evt.ctrlKey && evt.key == "a"){
				console.log("here")
				this.ToggleMoveAnchor(evt);
			}                      

			this.SetLeverType(evt);

			if(evt.key == "Shift"){
				this.ToggleEditingLever();
			}

			if(evt.key == "z" && evt.ctrlKey){
				this.zpr.zoom = 1;
				this.UpdateDraw();
			}

		}.bind(this);

		document.onkeyup = function(evt){

			if(evt.key == "Control"){
				evt.preventDefault();
				this.ToggleEditingLever();
			}
		}.bind(this)

		canvas.onmousedown = canvas.onmousemove = canvas.onmouseup = this.Drag.bind(this);

		canvas.onmousewheel = this.Zoom.bind(this);

		document.addEventListener("ondocuchange", function(){
			this.UpdateDraw('redraw by event');
		}.bind(this));
	}

}

module.exports = Editor;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var Status = __webpack_require__(4);

var Document = __webpack_require__(5);
var Curve    = __webpack_require__(2);
var Cast     = __webpack_require__(9);

/**
 * stores current editing context, including
 * 1. current curve index
 * 2. current lever index
 * 3. current select point
 * 4. current translate array (temporarily store the original point set of
 * 	  lever or curve)
 * 5. captured context
 */


class EditorCoreData{
	constructor(){
		
		this.docu = new Document();

		this.status = Status.Editing;

		this.currCurveIndex = null;
		this.currLeverIndex = null;
		this.currPointIndex = null;

		this.transArray = [];

	}

	CurrCurve(){
		return this.docu.curves[this.currCurveIndex];
	}

	CurrLever(){
		return this.docu.curves[this.currCurveIndex].levers[this.currLeverIndex];
	}

	TransCurrCurve(vec){
		this.CurrCurve().TransFromArray(this.transArray, vec);
	}

	TransCurrLever(vec){
		this.CurrLever().TransFromArray(this.transArray, vec);
	}

	AddCurve(curve){
		this.currCurveIndex = this.docu.curves.push(curve) - 1;
	}

	AddPoint(point){
		if(this.currCurveIndex == null){
			this.AddCurve(new Curve());
		}

		this.SelectControlPoint(point, false);
		if(this.currLeverIndex == null){
			this.currLeverIndex = this.CurrCurve().Add({point:point});
		}

		console.log(this.CurrCurve());
	}

	RemoveLever(){
        if(this.currCurveIndex != null){
		    var curve = this.CurrCurve();
		    if(this.currLeverIndex != null){
		        curve.levers.splice(this.currLeverIndex, 1);
		        curve.UpdateOutlines();
		        this.currLeverIndex = null;
		    }

		    if(curve.levers.length == 1){
		        this.curves.splice(this.currCurveIndex, 1);
		        this.currCurveIndex = null;
		    }
		}
	}

	UpdateCurrLever(newPoint){
		if(this.currLeverIndex != null)
			this.CurrCurve().UpdateLever(this.currLeverIndex, this.currPointIndex, newPoint);
	}

	Deselect(){
		this.currCurveIndex = null,
		this.currLeverIndex = null,
		this.currPointIndex = null;
	}

	/**
	 * Once a casted control point of a lever found, set up current
	 * lever index and control point index, and set the status
	 * 
	 * NOTE: the editing status is also set here.
	 */
	SelectControlPoint(point, no_center){

		this.currLeverIndex = null;
		if(this.currCurveIndex != null){
			for (const [i, lever] of this.CurrCurve().levers.entries()){
				var cast = Cast.Lever(lever, point);
				if(cast != -1 && cast != (no_center ? 2 : -1)){
					this.currLeverIndex = i;
					this.currPointIndex = cast;
					this.status = Status.EditingLever;
					break;
				}
			}
		}
	}

	/**
	 * before actually transform the curve, the original position or shape
	 * of the curve / lever should be preserved in order to elimiated the 
	 * accumulative error.
	 *
 	 * NOTE: the editing status is also set here.
	 */

	PrepareLeverTrans(curve, ith, point){

		for (const [i, lever] of this.CurrCurve().levers.entries()){
			var cast = Cast.Lever(lever, point);
			if(cast != -1){
				this.currLeverIndex = i;
				this.currPoint = cast;
				this.status = Status.MovingLever;
				this.transArray = this.CurrLever().ExtractArray();
				break;
			}
		}
	};

	PrepareTrans(point){

		// first clear the transArray
		this.transArray = [];

		// check if we are moving a lever, done by a cast test

		// check if we are moving the whole curve, if not moving a lever
		// also done by cast test
		
		console.log(this.currLeverIndex);
		for (const [ith, curve] of this.docu.curves.entries()){
			if(Cast.Curve(curve, point) != -1) {
				this.currCurveIndex = ith;
				this.PrepareLeverTrans(curve, ith, point);
				console.log(this.transArray);
				if(this.transArray.length == 0){
					this.status = Status.MovingCurve;
					this.transArray = this.CurrCurve().ExtractArray();
				}
				break;
			}
		}
	}

}

module.exports = EditorCoreData;

/***/ }),
/* 18 */
/***/ (function(module, exports) {

class Matrix{

	constructor(){
		this.elements = [

				1, 0, 0,
				0, 1, 0,
				0, 0, 1

		];
	}


	SetPan(vec){
		this.elements[2] = vec.x;
		this.elements[5] = vec.y;
	}

	SetZoom(vec){
		this.elements[0] = vec.x;
		this.elements[4] = vec.y;
	}

	Mult ( m ) {

		// if m is a matrix, then return a new matrix, which
		// stores the product of *THIS* and *m* (the sequence
		// matters)
		// 
		// if m is a vector, then return a new vector which is
		// the product of this and the vector. Notably the vector
		// is extended with third dimension as weight, but we set
		// it 1. 

		if(m.elements != undefined){
			var te = this.elements.slice();
			var me = m.elements;

			var a11 = te[ 0 ], a12 = te[ 3 ], a13 = te[ 6 ];
			var a21 = te[ 1 ], a22 = te[ 4 ], a23 = te[ 7 ];
			var a31 = te[ 2 ], a32 = te[ 5 ], a33 = te[ 8 ];

			var b11 = me[ 0 ], b12 = me[ 3 ], b13 = me[ 6 ];
			var b21 = me[ 1 ], b22 = me[ 4 ], b23 = me[ 7 ];
			var b31 = me[ 2 ], b32 = me[ 5 ], b33 = me[ 8 ];

			te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
			te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
			te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

			te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
			te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
			te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

			te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
			te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
			te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

			var newM = new Matrix();
			newM.elements = te;
			return newM;

		} else if (m.x != undefined && m.y != undefined){

			var newV = m.Copy(),
				e = this.elements;

			newV.x = e[ 0 ] * m.x + e[ 3 ] * m.y + e[ 2 ];
			newV.y = e[ 1 ] * m.x + e[ 4 ] * m.y + e[ 5 ];

			return newV;
		}
	}

	Inv(){

		var me = this.elements.slice(),

		n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ],
		n12 = me[ 3 ], n22 = me[ 4 ], n32 = me[ 5 ],
		n13 = me[ 6 ], n23 = me[ 7 ], n33 = me[ 8 ],

		t11 = n33 * n22 - n32 * n23,
		t12 = n32 * n13 - n33 * n12,
		t13 = n23 * n12 - n22 * n13,

		// since the matrix is always get from the composition of
		// translation / rotation transform, it's guaranteed that
		// it's invertable. So no more determinant check.
		
		detInv = 1/ (n11 * t11 + n21 * t12 + n31 * t13);

		me[ 0 ] = t11 * detInv;
		me[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
		me[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

		me[ 3 ] = t12 * detInv;
		me[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
		me[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

		me[ 6 ] = t13 * detInv;
		me[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
		me[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

		var newM = new Matrix();
		newM.elements = me;
		return newM;
	}

	toString(){
		var e = this.elements;
		return e[0].toFixed(4) + " " + e[1].toFixed(4) + " " + e[2].toFixed(4) + "\n" +
			   e[3].toFixed(4) + " " + e[4].toFixed(4) + " " + e[5].toFixed(4) + "\n" +
			   e[6].toFixed(4) + " " + e[7].toFixed(4) + " " + e[8].toFixed(4);
	}
}

module.exports = Matrix;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {


var Document = __webpack_require__(5);

class Neutron {
	constructor(editor){
		this.editor = editor;
		this.param_ui = document.getElementById("param-group");

		this.AddParamUI();
		this.LoadLink();

		document.getElementById("save").onclick = this.Save.bind(this);
		document.getElementById("init-eval").onclick = function(){
			this.editor.docu.EvalInit();
		}.bind(this);
		document.getElementById("init-code").oninput = function(){
			this.editor.docu.init = document.getElementById("init-code").value;
		}.bind(this);
	}

	ClearDOMChildren(elem){
		while (elem.firstChild) {
		    elem.removeChild(elem.firstChild);
		}
	}

	Request(method, url, content){
		return new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.open(method, url);
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.onload = function(){return resolve(xhr.responseText)};
			xhr.onerror = function(){return reject(xhr.statusText)};
			xhr.send(content);
		})
	}

	async Save(){
		var docu_id = document.getElementById("prefix").value + "_" + document.getElementById("name").value,
			content = JSON.stringify({id: docu_id, data:this.editor.docu});

		this.editor.docu.ClearEval();
		const res = await this.Request('PUT', 'save/', content);
	}

	async Load(docu_id){

		const res = await this.Request('GET', 'load/'+docu_id);
		console.log(res);
		this.editor.docu = new Document(JSON.parse(res));

		this.ReloadExistingParams();
		document.getElementById("init-code").value = this.editor.docu.init;
		document.getElementById("update-code").value = this.editor.docu.update;
		this.editor.docu.InitEval();
		this.editor.docu.EvalInit();
		this.editor.docu.EvalUpdate();
		this.editor.UpdateDraw("loaded");
	}

	async LoadLink(){
		
		const res = await this.Request('GET', 'load_name/');
		console.log(res);

		this.ClearDOMChildren(document.getElementById("list"));

		for (let docu_id of JSON.parse(res).res){
			let a = document.createElement('a');
			a.innerHTML = docu_id.split("_").pop();
			a.class = "char-link";
			a.onclick = function(){
				this.Load(docu_id);
				document.getElementById("prefix").value = docu_id.split("_")[0];
				document.getElementById("name").value = docu_id.split("_")[1];
			}.bind(this);
			list.appendChild(a);
			list.appendChild(document.createTextNode(" "));
		}
	}

	ClearParams(){
		while (this.param_ui.firstChild) {
		    this.param_ui.removeChild(this.param_ui.firstChild);
		}
	}

	AddExistingParam(param){

		var paramElem = document.createElement("div");
		paramElem.className = "param-group";
		paramElem.id = "param-"+param.name;

		var name = document.createElement("block");
		name.className = "param-name-label";
		name.innerHTML = param.name;

		var valueInput = document.createElement("input");
		valueInput.value = param.value;
		valueInput.setAttribute("type", "number");

		var valueSlider = document.createElement("input");
		valueSlider.setAttribute("type", "range");
		valueSlider.value = param.value;
		valueSlider.min = param.min;
		valueSlider.max = param.max;
		valueSlider.step = 0.01;

		valueInput.onchange = valueInput.oninput = function(){
			param.value = valueSlider.value = valueInput.value;
	        this.editor.docu.EvalUpdate();
	        this.editor.UpdateDraw();
		}.bind(this);

		valueSlider.onchange = valueSlider.oninput = function(){
			param.value = valueInput.value = valueSlider.value;
	        this.editor.docu.EvalUpdate();
	        this.editor.UpdateDraw();
		}.bind(this);

		var deleteButton = document.createElement('button');
		deleteButton.innerHTML = "delete";

		deleteButton.onclick = function(){
			var elem = document.getElementById(paramElem.id);
			elem.parentNode.removeChild(elem);
			// console.log(this.editor.docu.params);
			delete this.editor.docu.params[param.name];
		}.bind(this);

		paramElem.appendChild(name);
	 	paramElem.appendChild(valueInput);
	 	paramElem.appendChild(valueSlider);
	 	paramElem.appendChild(deleteButton);

		this.param_ui.appendChild(paramElem);
	}

	ReloadExistingParams(){
		this.ClearParams();
		for(let param in this.editor.docu.params) {
			console.log(this.editor.docu.params[param]);
			this.AddExistingParam(this.editor.docu.params[param]);
		}
		this.AddParamUI();
	}

	AddParamUI(){

		var paramElem = document.createElement("div");

		var nameInput = document.createElement("input");
		nameInput.id = "param-name";
		nameInput.setAttribute("placeholder", "name");

		var defaultValueInput = document.createElement("input");
		defaultValueInput.id = "param-default-value";
		defaultValueInput.setAttribute("type", "number");
		defaultValueInput.setAttribute("placeholder", "default");

		var minInput = document.createElement("input");
		minInput.id = "param-min-value";
		minInput.setAttribute("type", "number");
		minInput.setAttribute("placeholder", "min");

		var maxInput = document.createElement("input");
		maxInput.id = "param-max-value";
		maxInput.setAttribute("type", "number");
		maxInput.setAttribute("placeholder", "max");

		var saveButton = document.createElement("button");
		saveButton.id = "param-save-button";
		saveButton.innerHTML = "save param";

		saveButton.onclick = function(){
			var nameInput = document.getElementById("param-name"),
				defaultValueInput = document.getElementById("param-default-value"),
				minInput = document.getElementById("param-min-value"),
				maxInput = document.getElementById("param-max-value");

			var param = {
				name :nameInput.value,
				value : defaultValueInput.value,
				min : minInput.value,
				max : maxInput.value
			};
			this.editor.docu.params[param.name] = param;

			this.ReloadExistingParams();
		}.bind(this);

		paramElem.appendChild(nameInput);
		paramElem.appendChild(defaultValueInput);
		paramElem.appendChild(minInput);
		paramElem.appendChild(maxInput);
		paramElem.appendChild(saveButton);

		this.param_ui.appendChild(paramElem);
	}

	SetUI(param, id){
		var paramElem = document.getElementById(id);
		var children = paramElem.childNodes;
		children[0].value = param.name;
		children[1].value = param.value;
		children[2].value = param.min;
		children[3].value = param.max;
	}

	GetParam(param, id){
		var paramElem = document.getElementById(id);
		var children = paramElem.childNodes;
		children[0].value = param.name;
		children[1].value = param.value;
		children[2].value = param.min;
		children[3].value = param.max;
	}

}

module.exports = Neutron;

/***/ })
/******/ ]);