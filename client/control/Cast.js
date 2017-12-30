
var CurveMath = require('../math/CurveMath.js');

class Cast{
    
    static CurveRect(curve, mouseV){
        return curve.bounding[0].x < mouseV.x && curve.bounding[1].x > mouseV.x &&
               curve.bounding[0].y < mouseV.y && curve.bounding[1].y > mouseV.y;
    }
    
    static CurveBody(curve, mouseV) {
        
    	var CAST_DIST = 9;

        var t, p, dist;
        console.log(JSON.stringify(curve));
        for (var i = 0; i < curve.levers.length - 1; i++) {

            t = CurveMath.GetClosestTFromGivenPoint(curve.levers[i], curve.levers[i+1], mouseV, 6, 4);
            p = CurveMath.GetPointOnCurveBetweenLever(t, curve.levers[i], curve.levers[i+1]);
            dist = p.Dist(mouseV);
            if (dist < CAST_DIST)
                return i + t;
        }
        return -1;
    } 

    static Curve(curve, mouseV){
    	// console.log(curve.bounding);
        // if(this.CurveRect(curve, mouseV)){
            return this.CurveBody(curve, mouseV);
        // }
        // else
        //     return -1;
    }

    static CurveIthLever(curve, mouseV) {

    	var CAST_DIST = 9;

        var i = 0,
        	found = false;

        for (; i < curve.levers.length; i ++) {
        	found = PVector.dist(curve.levers[i].points[2], mouseV) < CAST_DIST;
        	if(found) break;	
        } 

        if(!found) i = -1;

        return i;
    }

    static Lever(lever, mouseV){

		var CAST_DIST = 9;    
        var castSequence = [0, 4, 1, 3, 2];
        
        var res = -1;
        for(var ith = 0; ith < 5; ith++)
            if(lever.points[castSequence[ith]].Dist(mouseV) < CAST_DIST){
            	console.log(ith + " " + castSequence[ith]);
                res = castSequence[ith];
                break;
            }
        return res;
    }
}

module.exports = Cast;