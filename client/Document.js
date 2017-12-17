
var Vector = require('./Vector.js');
var Lever =  require('./Lever.js');
var Curve = require('./Curve.js');
var CurveSideOutline = require('./CurveSideOutline.js');


class Document{
	constructor(canvas){
		this.canvas = canvas;
		this.context = canvas.getContext("2d")
		this.curves = [];

		this.status = "Editing Existing Curves.";
	}

	LoadCurves(curves){
		this.curves = curves.map(function(x){return this.LoadCurve(x)}.bind(this));
		this.DrawCurves(null);
	}

	LoadCurve(curve){
		var curveRes = new Curve();
		// console.log(curve);
		curveRes.lo = this.LoadOutline(curve.lo);
		curveRes.ro = this.LoadOutline(curve.ro);
		curveRes.levers = curve.levers.map(function(x){return this.LoadLever(x)}.bind(this));
		curveRes.orig = this.LoadPoint(curve.orig);
		curveRes.bounding  = this.LoadBounding(curve.bounding);
		return curveRes;
	}

	LoadLever(lever){
		var leverRes = new Lever();
		leverRes.leverMode = lever.leverMode;
		leverRes.points = lever.points.map(function(x){return this.LoadPoint(x)}.bind(this));
		return leverRes;
	}

	LoadOutline(outline){
		var outlineRes = new CurveSideOutline();
		outlineRes.side = outline.side;
		outlineRes.points = outline.points.map(function(x){return this.LoadPoint(x)}.bind(this));
		return outlineRes;
	}

	LoadPoint(point){
		return new Vector(point.x, point.y);
	}

	LoadBounding(bounding){
		return [new Vector(bounding[0].x, bounding[0].y), new Vector(bounding[1].x, bounding[1].y)];
	}

    DrawCurvesFill(currCurveIndex){

        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

        for (var ithCurve = this.curves.length - 1; ithCurve >= 0; ithCurve--) {
            var curve = this.curves[ithCurve];

            this.context.lineWidth = 1;

            // for (var i = Things.length - 1; i >= 0; i--) {
            //     Things[i]
            // }

            this.context.beginPath();
            this.context.moveTo(curve.lo.points[0].x, curve.lo.points[0].y);
            for(var i = 1; i < curve.levers.length; i++){

                this.context.lineTo(curve.lo.points[3*i-2].x,   curve.lo.points[3*i-2].y);
                this.context.moveTo(curve.lo.points[3*i-1].x,   curve.lo.points[3*i-1].y);
                this.context.lineTo(curve.lo.points[3*i+0].x,   curve.lo.points[3*i-0].y);
                this.context.moveTo(curve.lo.points[3*(i-1)].x, curve.lo.points[3*(i-1)].y);

                this.context.bezierCurveTo(
                    curve.lo.points[3*i-2].x, curve.lo.points[3*i-2].y,
                    curve.lo.points[3*i-1].x, curve.lo.points[3*i-1].y,
                    curve.lo.points[3*i+0].x, curve.lo.points[3*i-0].y
                )
            }
            this.context.lineTo(curve.ro.points[curve.ro.points.length-1].x, curve.ro.points[curve.ro.points.length-1].y);
            for(var i = curve.levers.length-1; i >0; i--){

                this.context.lineTo(curve.ro.points[3*i-1].x,   curve.ro.points[3*i-1].y);
                this.context.moveTo(curve.ro.points[3*i-2].x,   curve.ro.points[3*i-2].y);
                this.context.lineTo(curve.ro.points[3*(i-1)].x,   curve.ro.points[3*(i-1)].y);
                this.context.moveTo(curve.ro.points[3*i].x,     curve.ro.points[3*i].y);

                this.context.bezierCurveTo(
                    curve.ro.points[3*i-1].x, curve.ro.points[3*i-1].y,
                    curve.ro.points[3*i-2].x, curve.ro.points[3*i-2].y,
                    curve.ro.points[3*(i-1)].x, curve.ro.points[3*(i-1)].y
                )
            }
            // this.context.lineTo(curve.lo.points[0].x, curve.lo.points[0].y);
            // this.context.closePath();
            this.context.stroke();
        };
    }

	DrawCurves(currCurveIndex){

        this.context.lineWidth = 1;
		this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

		if(currCurveIndex != null){			
			var levers = this.curves[currCurveIndex].levers;
			for (var i = 0; i < levers.length; i++) {
				for(var j = 0; j < 5; j++){
					this.context.beginPath();
					this.context.arc(levers[i].points[j].x, levers[i].points[j].y, 4, 0, 2 * Math.PI);
					this.context.stroke();
				}
			}

			this.context.beginPath();
			for (var i = 0; i < levers.length; i++) {
				this.context.moveTo(levers[i].points[0].x, levers[i].points[0].y);
				this.context.lineTo(levers[i].points[2].x, levers[i].points[2].y);
				this.context.lineTo(levers[i].points[4].x, levers[i].points[4].y);
				this.context.moveTo(levers[i].points[1].x, levers[i].points[1].y);
				this.context.lineTo(levers[i].points[2].x, levers[i].points[2].y);
				this.context.lineTo(levers[i].points[3].x, levers[i].points[3].y);
			}
			this.context.stroke();
		}


		for (var ith = this.curves.length - 1; ith >= 0; ith--) {
            this.context.lineWidth = 1;
			if(this.curves[ith].levers.length > 1){

				// console.log("entered");

				this.context.beginPath();
				this.context.moveTo(this.curves[ith].lo.points[0].x, this.curves[ith].lo.points[0].y);
				for (var i = 1; i < this.curves[ith].levers.length; i++) {
					this.context.bezierCurveTo(
						this.curves[ith].lo.points[3*i-2].x, this.curves[ith].lo.points[3*i-2].y,
						this.curves[ith].lo.points[3*i-1].x, this.curves[ith].lo.points[3*i-1].y,
						this.curves[ith].lo.points[3*i+0].x, this.curves[ith].lo.points[3*i-0].y
					)
				}
				this.context.stroke();
				this.context.beginPath();
				this.context.moveTo(this.curves[ith].ro.points[0].x, this.curves[ith].ro.points[0].y);
				for (var i = 1; i < this.curves[ith].levers.length; i++) {
					this.context.bezierCurveTo(
						this.curves[ith].ro.points[3*i-2].x, this.curves[ith].ro.points[3*i-2].y,
						this.curves[ith].ro.points[3*i-1].x, this.curves[ith].ro.points[3*i-1].y,
						this.curves[ith].ro.points[3*i+0].x, this.curves[ith].ro.points[3*i-0].y
					)
				}
				this.context.stroke();

                this.context.lineWidth = 2;
                this.context.beginPath();
                this.context.moveTo(this.curves[ith].levers[0].points[2].x, this.curves[ith].levers[0].points[2].y);
                for (var i = 0; i < this.curves[ith].levers.length - 1; i++) {
                    this.context.bezierCurveTo(
                        this.curves[ith].levers[i].points[4].x,   this.curves[ith].levers[i].points[4].y,
                        this.curves[ith].levers[i+1].points[0].x, this.curves[ith].levers[i+1].points[0].y,
                        this.curves[ith].levers[i+1].points[2].x, this.curves[ith].levers[i+1].points[2].y
                    )
                }
                this.context.stroke();

			}

		}


	}
}

module.exports = Document;