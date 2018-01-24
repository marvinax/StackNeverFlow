var ZPR = require('./ZPR.js');
var Vector = require('../model/Vector.js');

class Draw{

    static CurvesFill(ctx, curves, currCurveIndex){

        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

        for (var ithCurve = curves.length - 1; ithCurve >= 0; ithCurve--) {
            var curve = curves[ithCurve];

            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(curve.lo.points[0].x, curve.lo.points[0].y);
            for(var i = 1; i < curve.levers.length; i++){

                ctx.lineTo(curve.lo.points[3*i-2].x,   curve.lo.points[3*i-2].y);
                ctx.moveTo(curve.lo.points[3*i-1].x,   curve.lo.points[3*i-1].y);
                ctx.lineTo(curve.lo.points[3*i+0].x,   curve.lo.points[3*i-0].y);
                ctx.moveTo(curve.lo.points[3*(i-1)].x, curve.lo.points[3*(i-1)].y);

                ctx.bezierCurveTo(
                    curve.lo.points[3*i-2].x, curve.lo.points[3*i-2].y,
                    curve.lo.points[3*i-1].x, curve.lo.points[3*i-1].y,
                    curve.lo.points[3*i+0].x, curve.lo.points[3*i-0].y
                )
            }
            ctx.lineTo(curve.ro.points[curve.ro.points.length-1].x, curve.ro.points[curve.ro.points.length-1].y);
            for(var i = curve.levers.length-1; i >0; i--){

                ctx.lineTo(curve.ro.points[3*i-1].x,   curve.ro.points[3*i-1].y);
                ctx.moveTo(curve.ro.points[3*i-2].x,   curve.ro.points[3*i-2].y);
                ctx.lineTo(curve.ro.points[3*(i-1)].x,   curve.ro.points[3*(i-1)].y);
                ctx.moveTo(curve.ro.points[3*i].x,     curve.ro.points[3*i].y);

                ctx.bezierCurveTo(
                    curve.ro.points[3*i-1].x, curve.ro.points[3*i-1].y,
                    curve.ro.points[3*i-2].x, curve.ro.points[3*i-2].y,
                    curve.ro.points[3*(i-1)].x, curve.ro.points[3*(i-1)].y
                )
            }
            // ctx.lineTo(curve.lo.points[0].x, curve.lo.points[0].y);
            // ctx.closePath();
            ctx.stroke();
        };

    }

    static Curves(ctx, docu){

        var curves = docu.curves,
            currCurveIndex = docu.currCurveIndex,
            currLeverIndex = docu.currLeverIndex,
            captured = docu.captured,
            zpr = docu.zpr;

        ctx.lineWidth = 1;
        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

        ctx.strokeStyle = "#000000";
        ctx.font = "16px TheMixMono";

        ctx.strokeStyle = "#CCCCCC";
        ctx.beginPath();
        for(let i=0; i<50; i++){
            var y1 = zpr.Transform(new Vector(i*30-300, -300)),
                y2 = zpr.Transform(new Vector(i*30-300, 1500)),
                x1 = zpr.Transform(new Vector(-300, i*30-300)),
                x2 = zpr.Transform(new Vector(1500, i*30-300));
            ctx.moveTo(y1.x, y1.y);
            ctx.lineTo(y2.x, y2.y);
            ctx.moveTo(x1.x, x1.y);
            ctx.lineTo(x2.x, x2.y);
        }
        ctx.stroke();

        var status;
        switch(docu.status){
            case 0: ctx.fillText('Editing', 10, 25); break; 
            case 1: ctx.fillText('Creating', 10, 25); break; 
            case 2: ctx.fillText('MovingCurve', 10, 25); break; 
            case 3: ctx.fillText('MovingLever', 10, 25); break; 
            case 4: ctx.fillText('EditingLever', 10, 25); break;
        }

        ctx.fillText(docu.zpr.zoom.toFixed(3)+"x", 10, 45);

        ctx.strokeStyle = "#AE0000";
        if(captured != null){
            ctx.beginPath();
                if(captured.type == "center")
                    if(captured.over == "x"){
                        ctx.moveTo(captured.by.x, captured.by.y);
                        ctx.lineTo(docu.CurrLever().points[2].x, captured.by.y);
                    } else {
                        ctx.moveTo(captured.by.x, captured.by.y);
                        ctx.lineTo(captured.by.x, docu.CurrLever().points[2].y);                    
                    }
                if(captured.type == "control"){
                    var longer = captured.over.Mult(10);
                    ctx.moveTo(captured.by.x, captured.by.y);
                    ctx.lineTo(captured.by.x + longer.x, captured.by.y + longer.y);
                }

                ctx.arc(captured.by.x, captured.by.y, 10, 0, 2 * Math.PI);
            ctx.stroke();
        }

        ctx.strokeStyle = "#000000";
        var zpr_curves = docu.curves.map(function(curve){
            
            return { levers: curve.levers.map(function(lever){
                        return {
                            points: lever.points.map(function(point){ return zpr.Transform(point);}),
                            leverMode : lever.leverMode
                        }
                    }),
                lo_points : curve.lo.points.map(function(point){return zpr.Transform(point)}),
                ro_points : curve.ro.points.map(function(point){return zpr.Transform(point)})
            }

        });

        if(currCurveIndex != null){
            var levers = zpr_curves[currCurveIndex].levers;

            for (var i = 0; i < levers.length; i++) {

                // if(i == currLeverIndex){
                    for(var j = 0; j < 5; j++){

                        ctx.beginPath();
                        ctx.arc(levers[i].points[j].x, levers[i].points[j].y, 4, 0, 2 * Math.PI);
                        ctx.fillText("p"+i+","+j, levers[i].points[j].x-10, levers[i].points[j].y-10);
                        ctx.stroke();
                    }

                    ctx.beginPath();
                    // for (var i = 0; i < levers.length; i++) {
                        ctx.moveTo(levers[i].points[0].x, levers[i].points[0].y);
                        ctx.lineTo(levers[i].points[2].x, levers[i].points[2].y);
                        ctx.lineTo(levers[i].points[4].x, levers[i].points[4].y);
                        ctx.moveTo(levers[i].points[1].x, levers[i].points[1].y);
                        ctx.lineTo(levers[i].points[2].x, levers[i].points[2].y);
                        ctx.lineTo(levers[i].points[3].x, levers[i].points[3].y);
                    // }
                    ctx.stroke();

                    var s;
                    switch(levers[i].leverMode){
                        case 0: s = "broken"; break;
                        case 2: s = "linear"; break;
                        case 3: s = "proper"; break;
                        case 4: s = "symmetric"; break;
                    }

                    ctx.fillText(s, levers[i].points[4].x + 10, levers[i].points[4].y + 5);

                // } else {
                //     ctx.beginPath();
                //     ctx.arc(levers[i].points[2].x, levers[i].points[2].y, 4, 0, 2 * Math.PI);
                //     ctx.stroke();
                // }
            }
        }

        ctx.font = "20px TheMixMono";
        for (var ith = zpr_curves.length - 1; ith >= 0; ith--) {
            ctx.lineWidth = 1;
            if(zpr_curves[ith].levers.length > 1){


                ctx.strokeStyle = "#434343";
                ctx.beginPath();
                ctx.moveTo(zpr_curves[ith].lo_points[0].x, zpr_curves[ith].lo_points[0].y);
                for (var i = 1; i < zpr_curves[ith].levers.length; i++) {
                        ctx.bezierCurveTo(
                            zpr_curves[ith].lo_points[3*i-2].x, zpr_curves[ith].lo_points[3*i-2].y,
                            zpr_curves[ith].lo_points[3*i-1].x, zpr_curves[ith].lo_points[3*i-1].y,
                            zpr_curves[ith].lo_points[3*i+0].x, zpr_curves[ith].lo_points[3*i-0].y
                        )
                        ctx.moveTo(zpr_curves[ith].lo_points[3*(i-1)].x, zpr_curves[ith].lo_points[3*(i-1)].y),
                        ctx.lineTo(zpr_curves[ith].lo_points[3*i-2].x, zpr_curves[ith].lo_points[3*i-2].y);
                        ctx.lineTo(zpr_curves[ith].lo_points[3*i-1].x, zpr_curves[ith].lo_points[3*i-1].y);
                        ctx.lineTo(zpr_curves[ith].lo_points[3*i+0].x, zpr_curves[ith].lo_points[3*i-0].y);
                }
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(zpr_curves[ith].ro_points[0].x, zpr_curves[ith].ro_points[0].y);
                for (var i = 1; i < zpr_curves[ith].levers.length; i++) {
                        ctx.bezierCurveTo(
                            zpr_curves[ith].ro_points[3*i-2].x, zpr_curves[ith].ro_points[3*i-2].y,
                            zpr_curves[ith].ro_points[3*i-1].x, zpr_curves[ith].ro_points[3*i-1].y,
                            zpr_curves[ith].ro_points[3*i+0].x, zpr_curves[ith].ro_points[3*i-0].y
                        )
                        ctx.moveTo(zpr_curves[ith].ro_points[3*(i-1)].x, zpr_curves[ith].ro_points[3*(i-1)].y),
                        ctx.lineTo(zpr_curves[ith].ro_points[3*i-2].x, zpr_curves[ith].ro_points[3*i-2].y);
                        ctx.lineTo(zpr_curves[ith].ro_points[3*i-1].x, zpr_curves[ith].ro_points[3*i-1].y);
                        ctx.lineTo(zpr_curves[ith].ro_points[3*i+0].x, zpr_curves[ith].ro_points[3*i-0].y);
                }
                ctx.stroke();

                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 2;

                var first = zpr_curves[ith].levers[0].points[2],
                    sec   = zpr_curves[ith].levers[0].points[1],
                    diam  = sec.Sub(first).Normalize().Mult(20);
                ctx.fillText("C"+ith, first.x + diam.y - 10, first.y -diam.x - 10);

                for (var i = 0; i < zpr_curves[ith].levers.length; i++) {
                    var point = zpr_curves[ith].levers[i].points[2];
                    ctx.fillText(i, point.x+10, point.y-10);
                }

                ctx.beginPath();
                ctx.moveTo(zpr_curves[ith].levers[0].points[2].x, zpr_curves[ith].levers[0].points[2].y);
                for (var i = 0; i < zpr_curves[ith].levers.length - 1; i++) {
                    ctx.bezierCurveTo(
                        zpr_curves[ith].levers[i].points[4].x,   zpr_curves[ith].levers[i].points[4].y,
                        zpr_curves[ith].levers[i+1].points[0].x, zpr_curves[ith].levers[i+1].points[0].y,
                        zpr_curves[ith].levers[i+1].points[2].x, zpr_curves[ith].levers[i+1].points[2].y
                    )
                }
                ctx.stroke();

            }

        }
    }
}

module.exports = Draw;