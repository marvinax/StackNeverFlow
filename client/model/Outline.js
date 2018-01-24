var Vector = require('./Vector.js');
var Lever =  require('./Lever.js');
var CurveMath = require('../math/CurveMath.js');

var CurveSide = Object.freeze({
    LEFT :  1,
    RIGHT : 3
});

class Outline{

	constructor(side){
		this.points = [];
		this.side = side;
	}

    /// this should be called immediately after a new curve is formed.
    GetPointFromLevers(levers){

        this.points = [];
        for (var i = 0; i < levers.length * 3 - 2; i ++){
            this.points.push(new Vector(0, 0));
        }
        this.SetPointFromLevers(levers);
    }

	GetIdenticalCurve(p1, p2){
        return CurveMath.GetIdenticalCurve(p1, p2, this.side);
    }

    /// update with every redraw.
    SetPointFromLevers(levers){
        if(this.points != null){
            for(var i = 0; i < levers.length; i++){

                this.points[3*i].Set(levers[i].points[this.side]);

                if(i < levers.length - 1){
                    var aux = this.GetIdenticalCurve(levers[i], levers[i+1]);
                    this.points[3 * i + 1].Set(aux[0]);
                    this.points[3 * i + 2].Set(aux[1]);
                }
            }
        }
    }
}

module.exports = Outline;