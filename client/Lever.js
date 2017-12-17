var Vector = require("./Vector.js");

var LeverMode = Object.freeze({
    BROKEN		: 0,
    LINEAR 		: 1,
    PROPER 		: 2,
    SYMMETRIC	: 4
});

var SelectMode = Object.freeze({
	NONE 		 : 0,
	CURVE_SELECT : 1,
	LEVER_SELECT : 2
});

var LeverPoint = Object.freeze({
	POINT 		 : 2,
	CONTROL_1	 : 0,
	CONTROL_2 	 : 4,
	WIDTH_1 	 : 1,
	WIDTH_2	 	 : 3
});

class Lever {

	constructor(points){

		if(typeof points == "Array") {
			this.points = points;
		}
		if(typeof points == "object") {
			this.points = [
				points.Copy(),
				points.Copy(),
				points.Copy(),
				points.Copy(),
				points.Copy()
			]
		}
		if(typeof points == "undefined") {
			this.points = [
				Vector.Zero,
				Vector.Zero,
				Vector.Zero,
				Vector.Zero,
				Vector.Zero
			]
		}

		this.leverMode = LeverMode.SYMMETRIC;
		this.selectMode = SelectMode.NONE;
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
	        case PROPER:
	            this.SetOppo(ith, oppoNorm, ratioOppo * this.points[2].Dist(newPoint));

            /// recalculate to make three points aligned on same
            /// line. use new direction and original distance of
            /// opposite control point.
	        case LINEAR:
	            this.SetOppo(ith, oppoNorm, this.points[2].Dist(this.points[this.OppoOf(ith)]));

            /// set new control point without affecting the oppo-
            /// site. The tangent will be broken.
     	   case BROKEN:
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
    	var array = ExtractArray();
    	TransFromArray(array, inc);
    }
}

module.exports = Lever;