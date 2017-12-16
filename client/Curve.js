
var CurveSideOutline = require('./CurveSideOutline.js');

var Vector = require('./Vector.js');
var Lever =  require('./Lever.js');

var CurveMath = require('./CurveMath.js');

class Curve {

    constructor(orig){

	    this.levers = [];

	    this.orig = orig; 

	    this.lo = new CurveSideOutline(1);
	    this.ro = new CurveSideOutline(3);

	    this.bounding = [new Vector(9999, 9999), new Vector(-9999, -9999)];

    }

    Add(mouseV){
        this.levers.push(new Lever(mouseV));
        this.GetOutlines();
        this.UpdateBoundingRect();
        return this.levers.length - 1;
    }

    Delete(index){
        levers.splice(index, 1);
        this.GetOutlines();
        this.UpdateBoundingRect();
    }
    
    Insert(curveCast) {
        this.levers.splice(Math.floor(curveCast+1), 0, new Lever(new Vector(0, 0)));
        CurveMath.SetInsertedLeverOnCurveGroup(this.levers, Math.floor(curveCast+1), curveCast - Math.floor(curveCast));
        console.log(this.levers.length);

        this.GetOutlines();
        this.UpdateBoundingRect();
        
        return Math.floor(curveCast+1);
    }

    UpdateLever(ithLever, ithPoint, value){
        this.levers[ithLever].SetControlPoint(ithPoint, value);
        this.UpdateOutlines();
        this.UpdateBoundingRect();
    }

    UpdateBoundingRect(){
        this.bounding[0].Set(Infinity, Infinity);
        this.bounding[1].Set(-Infinity, -Infinity);
        for(const lever of this.levers) {
        	for(const point of lever.points) {
	            if(point.x < this.bounding[0].x) this.bounding[0].x = point.x;
	            if(point.x > this.bounding[1].x) this.bounding[1].x = point.x;
	            if(point.y < this.bounding[0].y) this.bounding[0].y = point.y;
	            if(point.y > this.bounding[1].y) this.bounding[1].y = point.y;
	        }
        }
    }

    GetOutlines(){
        this.lo.GetPointFromLevers(this.levers);
        this.ro.GetPointFromLevers(this.levers);
    }

    UpdateOutlines(){
        this.lo.SetPointFromLevers(this.levers);
        this.ro.SetPointFromLevers(this.levers);
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
        this.UpdateOutlines();
    }
}

module.exports = Curve;