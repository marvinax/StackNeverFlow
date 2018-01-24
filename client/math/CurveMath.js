var Vector = require("../model/Vector.js");

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
        
        var res = this.GetIdenticalCurve(p0, p2, 1);
        strokePointsLeft.push(p0.points[1]);
        strokePointsLeft.push(res[0].Copy());
        strokePointsLeft.push(res[1].Copy());
        strokePointsLeft.push(p2.points[1]);
      
        res = this.GetIdenticalCurve(p0, p2, 3);
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

        console.log((s).toFixed(3), " ", (t).toFixed(3));

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