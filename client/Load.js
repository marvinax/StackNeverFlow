
var Vector = require('./model/Vector.js');
var Lever =  require('./model/Lever.js');
var Curve =  require('./model/Curve.js');
var Outline = require('./model/Outline.js');

class LoadData {
	static Doc(doc) {
		var actualDoc = new Document();
		doc.curves = this.Curves(doc.curves);
		doc.anchor = new Vector(doc.anchor.x, doc.anchor.y);

		return doc
	}

	static Curves(curves){
		return curves.map(function(x){return this.Curve(x)}.bind(this));
	}

	static Curve(curve){
		var curveRes = new Curve();
		// console.log(curve);
		curveRes.levers = curve.levers.map(function(x){return this.Lever(x)}.bind(this));
		curveRes.GetOutlines();
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
		outlineRes.points = outline.points.map(function(x){return this.Point(x)}.bind(this));
		return outlineRes;
	}

	static Point(point){
		return new Vector(point.x, point.y);
	}
}

module.exports = LoadData;