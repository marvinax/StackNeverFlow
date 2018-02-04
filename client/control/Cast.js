
var CurveMath = require('../math/CurveMath.js');

class Cast{
    
    static CurveRect(curve, curr){
        return curve.bounding[0].x < curr.x && curve.bounding[1].x > curr.x &&
               curve.bounding[0].y < curr.y && curve.bounding[1].y > curr.y;
    }
    
    static CurveBody(curve, curr) {
        
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

    static Curve(curve, curr){
    	// console.log(curve.bounding);
        // if(this.CurveRect(curve, curr)){
            return this.CurveBody(curve, curr);
        // }
        // else
        //     return -1;
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