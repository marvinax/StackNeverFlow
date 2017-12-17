var Vector = require("./Vector.js");

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
      
        var strokePointsLeft	= [];
        var strokePointsRight	= [];
        
        var res = this.GetIdenticalCurve(p0.points[1], p2.points[1], p0, p2);
        strokePointsLeft.push(p0.points[1]);
        strokePointsLeft.push(res[0].Copy());
        strokePointsLeft.push(res[1].Copy());
        strokePointsLeft.push(p2.points[1]);
      
        res = this.GetIdenticalCurve(p0.points[3], p2.points[3], p0, p2);
        strokePointsRight.push(p0.points[3]);
        strokePointsRight.push(res[0].Copy());
        strokePointsRight.push(res[1].Copy());
		strokePointsRight.push(p2.points[3]);
        
        p1.points[1] = this.GetPointOnCurve(t, strokePointsLeft);
        p1.points[3] = this.GetPointOnCurve(t, strokePointsRight);

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
        // console.log(JSON.stringify([levers[ithNode == 0 ? 0 : ithNode - 1], levers[ithNode], levers[(ithNode == levers.length - 1 ? ithNode : ithNode + 1)]], null, '\t'));
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

    static GetIdenticalCurve(p0, p1, b0, b1){
        var c0 = b0.points[2].Add(b1.points[0]).Sub(b0.points[4].Mult(2));
        var c1 = b1.points[2].Add(b0.points[4]).Sub(b1.points[0].Mult(2));

        var sign0 = Math.sign(p0.Sub(b0.points[2]).Dot(c0));
        var sign1 = Math.sign(p1.Sub(b1.points[2]).Dot(c1));

        var distc0 = c0.Mag();
        var distc1 = c1.Mag();

        var distA = b0.points[4].Sub(b0.points[2]).Mult(Math.max(0.001, 1 - 0.001* sign0 * distc0));
        var distD = b1.points[0].Sub(b1.points[2]).Mult(Math.max(0.001, 1 - 0.001* sign1 * distc1));
        var a0a1 = p0.Add(distA);
        var d0d1 = p1.Add(distD);

        return [a0a1, d0d1];
    }
}

module.exports = CurveMath;