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
            currLeverIndex = docu.currLeverIndex;

        ctx.lineWidth = 1;
        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

        ctx.font = "16px TheMixMono";
        if(currCurveIndex != null){         
            var levers = curves[currCurveIndex].levers;

            for (var i = 0; i < levers.length; i++) {

                if(i == currLeverIndex){                
                    for(var j = 0; j < 5; j++){
                        ctx.beginPath();
                        ctx.arc(levers[i].points[j].x, levers[i].points[j].y, 4, 0, 2 * Math.PI);
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

                } else {
                    ctx.beginPath();
                    ctx.arc(levers[i].points[2].x, levers[i].points[2].y, 4, 0, 2 * Math.PI);
                    ctx.stroke();                    
                }
            }
        }

        ctx.font = "20px TheMixMono";
        for (var ith = curves.length - 1; ith >= 0; ith--) {
            ctx.lineWidth = 1;
            if(curves[ith].levers.length > 1){


                ctx.beginPath();
                ctx.moveTo(curves[ith].lo.points[0].x, curves[ith].lo.points[0].y);
                for (var i = 1; i < curves[ith].levers.length; i++) {
                    ctx.bezierCurveTo(
                        curves[ith].lo.points[3*i-2].x, curves[ith].lo.points[3*i-2].y,
                        curves[ith].lo.points[3*i-1].x, curves[ith].lo.points[3*i-1].y,
                        curves[ith].lo.points[3*i+0].x, curves[ith].lo.points[3*i-0].y
                    )
                }
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(curves[ith].ro.points[0].x, curves[ith].ro.points[0].y);
                for (var i = 1; i < curves[ith].levers.length; i++) {
                    ctx.bezierCurveTo(
                        curves[ith].ro.points[3*i-2].x, curves[ith].ro.points[3*i-2].y,
                        curves[ith].ro.points[3*i-1].x, curves[ith].ro.points[3*i-1].y,
                        curves[ith].ro.points[3*i+0].x, curves[ith].ro.points[3*i-0].y
                    )
                }
                ctx.stroke();

                ctx.lineWidth = 2;

                var first = curves[ith].levers[0].points[2],
                    sec   = curves[ith].levers[0].points[1],
                    diam  = sec.Sub(first).Normalize().Mult(20);
                ctx.fillText("C"+ith, first.x + diam.y - 10, first.y -diam.x - 10);

                for (var i = 0; i < curves[ith].levers.length; i++) {
                    var point = curves[ith].levers[i].points[2];
                    ctx.fillText(i, point.x+10, point.y-10);
                }
                
                ctx.beginPath();
                ctx.moveTo(curves[ith].levers[0].points[2].x, curves[ith].levers[0].points[2].y);
                for (var i = 0; i < curves[ith].levers.length - 1; i++) {
                    ctx.bezierCurveTo(
                        curves[ith].levers[i].points[4].x,   curves[ith].levers[i].points[4].y,
                        curves[ith].levers[i+1].points[0].x, curves[ith].levers[i+1].points[0].y,
                        curves[ith].levers[i+1].points[2].x, curves[ith].levers[i+1].points[2].y
                    )
                }
                ctx.stroke();

            }

        }
    }
}

module.exports = Draw;