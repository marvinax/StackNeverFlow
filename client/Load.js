
var Vector = require('./model/Vector.js');
var Lever =  require('./model/Lever.js');
var Curve =  require('./model/Curve.js');
var Outline = require('./model/Outline.js');

class LoadData {
	static Curves(curves){
		return curves.map(function(x){return this.Curve(x)}.bind(this));
	}

	static Curve(curve){
		var curveRes = new Curve();
		// console.log(curve);
		curveRes.lo = this.Outline(curve.lo);
		curveRes.ro = this.Outline(curve.ro);
		curveRes.levers = curve.levers.map(function(x){return this.Lever(x)}.bind(this));
		curveRes.orig = this.Point(curve.orig);
		return curveRes;
	}

	static Lever(lever){
		var leverRes = new Lever();
		leverRes.leverMode = lever.leverMode;
		leverRes.points = lever.points.map(function(x){return this.Point(x)}.bind(this));
		return leverRes;
	}

	static Outline(outline){
		var outlineRes = new Outline();
		outlineRes.side = outline.side;
		outlineRes.points = outline.points.map(function(x){return this.Point(x)}.bind(this));
		return outlineRes;
	}

	static Point(point){
		return new Vector(point.x, point.y);
	}
}

module.exports = LoadData;