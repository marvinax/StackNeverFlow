var Vector = require('./Vector.js');
var Lever =  require('./Lever.js');
var CurveMath = require('../math/CurveMath.js');

var CurveSide = Object.freeze({
    LEFT :  1,
    RIGHT : 3
});

class Outline{

	constructor(input){
        if(input == undefined){
            this.outer = [];
            this.inner = [];            
        } else {
            if(input.outer != undefined){
                this.outer = input.outer.map(function(bezGroup){ return bezGroup.map(function(point){return new Vector(point)})});
            }
            if(input.inner != undefined){
                this.inner = input.inner.map(function(bezGroup){ return bezGroup.map(function(point){return new Vector(point)})});
            }
        }
	}


    GetOutline(levers){
        this.outer = [];
        this.inner = [];
        for (var i = 0; i < levers.length - 1; i++) {
            this.GetOutlineSegment(levers[i], levers[i+1], 0);
        }
    }


    GetOutlineSegment(l0, l1, level){
        // console.log("level"+level);
        // console.log(l0, l1);
        var l0aux1 = l0.points[1].Sub(l0.points[2]).Add(l0.points[4]),
            l1aux1 = l1.points[1].Sub(l1.points[2]).Add(l1.points[0]),
            l0aux3 = l0.points[3].Sub(l0.points[2]).Add(l0.points[4]),
            l1aux3 = l1.points[3].Sub(l1.points[2]).Add(l1.points[0]);

        var cent_segment = l0.points[4].Sub(l1.points[0]);

        var offl01 = cent_segment.RightPerp().Normalize().Mult(l0.points[1].Dist(l0.points[2])).Add(l0.points[4]),
            offl11 = cent_segment.RightPerp().Normalize().Mult(l1.points[1].Dist(l1.points[2])).Add(l1.points[0]),
            offl03 = cent_segment.LeftPerp().Normalize().Mult(l0.points[3].Dist(l0.points[2])).Add(l0.points[4]),
            offl13 = cent_segment.LeftPerp().Normalize().Mult(l1.points[3].Dist(l1.points[2])).Add(l1.points[0]);

        var l0c1 = CurveMath.LineLineIntersection(l0.points[1], l0aux1, offl01, offl11),
            l1c1 = CurveMath.LineLineIntersection(offl01, offl11, l1aux1, l1.points[1]),
            l0c3 = CurveMath.LineLineIntersection(l0.points[3], l0aux3, offl03, offl13),
            l1c3 = CurveMath.LineLineIntersection(offl03, offl13, l1aux3, l1.points[3]),
            l0l11 = CurveMath.SegSegIntersection(l0.points[1], l0aux1, l1aux1, l1.points[1]),
            l0l13 = CurveMath.SegSegIntersection(l0.points[3], l0aux3, l1aux3, l1.points[3]),
            l0l1 = CurveMath.SegSegIntersection(l0.points[2], l0.points[4], l1.points[0], l1.points[2]);

        var l0width = l0.points[1].Dist(l0.points[2]),
            l1width = l1.points[1].Dist(l1.points[2]);

        // console.log("level "+level+": l0l1 s:" + l0l1.s.toFixed(3) + " t:" + l0l1.t.toFixed(3) + "\n",
        //             "l0c1.p "+l0c1.p.toFixed(3) + " l1c1.p "+l1c1.p.toFixed(3)+
        //             " l0c3.p "+l0c3.p.toFixed(3) + "l1c3.p "+l1c3.p.toFixed(3));

        if(l0c1.p > 0.96){ l0c1.v = offl01; }
        if(l1c1.p > 0.96){ l1c1.v = offl11; }
        if(l0c3.p > 0.96){ l0c3.v = offl03; }
        if(l1c3.p > 0.99){ l1c3.v = offl13; }

        if(l0l1.s < 1 && l0l1.s > 0 && l0l1.t < 1 && l0l1.t > 0){
            this.outer.push([l0.points[1], l0l11.v, l0l11.v, l1.points[1]]);
            this.inner.push([l0.points[3], l0l13.v, l0l13.v, l1.points[3]]);            
        } else if(level == 2 || l0l1.s > 1 && l0l1.t < 0){
            this.outer.push([l0.points[1], l0c1.v, l1c1.v, l1.points[1]]);
            this.inner.push([l0.points[3], l0c3.v, l1c3.v, l1.points[3]]);
        } else {

            var vwo = (l0l1.s > 1 ? l1c1.v : l0c1.v),
                vwi = (l0l1.s > 1 ? l1c3.v : l0c3.v),
                vp  = (l0l1.s > 1 ? l1.points[0] : l0.points[4]);

            var t = CurveMath.GetClosestTFromGivenPoint(l0, l1, vwo, 3, 3);
            // console.log("t val:"+t);

            var s = new Lever({point:new Vector(0,0)}),
                l1copy = l1.Copy(),
                l0copy = l0.Copy();
                
            CurveMath.SetInsertedLeverOnCurve(l0copy, s, l1copy, t);

            s.points[1] = s.points[2].Add(vwo.Sub(vp).Normalize().Mult((l1width + t*(l0width - l1width))));
            s.points[3] = s.points[2].Add(vwi.Sub(vp).Normalize().Mult((l1width + t*(l0width - l1width))));

            // console.log("haha"+JSON.stringify(s));
            this.GetOutlineSegment(l0copy, s, level+1);
            this.GetOutlineSegment(s, l1copy, level+1);                    
        }

    }

}

module.exports = Outline;