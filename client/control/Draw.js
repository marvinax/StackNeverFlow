var ZPR = require('./ZPR.js');
var Vector = require('../model/Vector.js');

class Draw{

    static Status(ctx, docu){
        var zpr = docu.zpr;
        ctx.strokeStyle = "#000000";
        ctx.font = "16px TheMixMono";

        ctx.strokeStyle = "#CCCCCC";
        ctx.lineWidth = 1;
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
            case 5: ctx.fillText('MovingAnchor', 10, 25); break;
        }

        ctx.fillText(docu.zpr.zoom.toFixed(3)+"x", 10, 45);        
    }

    static CurrCurve(ctx, curves, currCurve){

        if(currCurve != null) {
            console.log(currCurve);
            var curve = curves[currCurve];

            for (var [i, lever] of curve.levers.entries()) {

                for(var [j, point] of lever.points.entries()){

                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                    ctx.fillText("p"+i+","+j, point.x-10, point.y-10);
                    ctx.stroke();
                }

                ctx.beginPath();
                for (var i of [0, 1, 3, 4]) {
                    ctx.moveTo(lever.points[2].x, lever.points[2].y);
                    ctx.lineTo(lever.points[i].x, lever.points[i].y);
                }
                ctx.stroke();

                var s;
                switch(lever.leverMode){
                    case 0: s = "broken"; break;
                    case 2: s = "linear"; break;
                    case 3: s = "proper"; break;
                    case 4: s = "symmetric"; break;
                }

                ctx.fillText(s, lever.points[4].x + 10, lever.points[4].y + 5);
            }

        }

    }


    static Outline(ctx, curves){

        for (const [ith, curve] of curves.entries()) {
            ctx.lineWidth = 1;
            if(curve.levers.length > 1){


                ctx.strokeStyle = "#434343";
                var i = 0;
                ctx.beginPath();
                for (; i < curve.o.length; i++) {
                    // console.log(curve.o[i][0]);
                    ctx.moveTo(curve.o[i][0].x,curve.o[i][0].y)
                    ctx.bezierCurveTo(
                        curve.o[i][1].x,curve.o[i][1].y,
                        curve.o[i][2].x,curve.o[i][2].y,
                        curve.o[i][3].x,curve.o[i][3].y
                    )
                }
                ctx.stroke();
                ctx.beginPath();
                i = 0;
                for (; i < curve.i.length; i++) {
                    ctx.moveTo(curve.i[i][0].x,curve.i[i][0].y)
                    ctx.bezierCurveTo(
                        curve.i[i][1].x,curve.i[i][1].y,
                        curve.i[i][2].x,curve.i[i][2].y,
                        curve.i[i][3].x,curve.i[i][3].y
                    )
                }
                // ctx.lineTo(curve.o[i-1][3].x, curve.o[i-1][3].y)
                ctx.stroke();


                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 2;

                var first = curve.levers[0].points[2],
                    sec   = curve.levers[0].points[1],
                    diam  = sec.Sub(first).Normalize().Mult(20);

                for (const [i, lever] of curve.levers.entries()) {
                    var point = lever.points[2];
                    ctx.fillText(i, point.x+10, point.y-10);
                }

                ctx.beginPath();
                ctx.moveTo(curve.levers[0].points[2].x, curve.levers[0].points[2].y);
                for (var i = 0; i < curve.levers.length - 1; i++) {
                    ctx.bezierCurveTo(
                        curve.levers[i].points[4].x,   curve.levers[i].points[4].y,
                        curve.levers[i+1].points[0].x, curve.levers[i+1].points[0].y,
                        curve.levers[i+1].points[2].x, curve.levers[i+1].points[2].y
                    )
                }
                ctx.stroke();

            }

        }

    }

    static Curve(ctx, docu, zpr, currCurve){
        var zpr_curves = docu.curves.map(function(curve){
            return { levers: curve.levers.map(function(lever){
                        return {
                            points: lever.points.map(function(point){ return zpr.Transform(point);}),
                            leverMode : lever.leverMode
                        }
                    }),
                o : curve.outline.outer.map(function(group){return group.map(function(point){return zpr.Transform(point)})}),
                i : curve.outline.inner.map(function(group){return group.map(function(point){return zpr.Transform(point)})})
            }

        });

        // console.log(zpr_curves);
        Draw.CurrCurve(ctx, zpr_curves, currCurve);
        Draw.Outline(ctx, zpr_curves);
        for (var sub_docu in docu.importedDocuments){
            console.log(sub_docu);
            Draw.Curve(ctx, docu.importedDocuments[sub_docu], zpr);
        }
    }

    static Anchor(ctx, docu, zpr){
        ctx.strokeStyle = "#606060";
        var zpr_anchor = zpr.Transform(docu.anchor);
        ctx.beginPath();
            ctx.moveTo(zpr_anchor.x-10, zpr_anchor.y);
            ctx.lineTo(zpr_anchor.x+10, zpr_anchor.y);
            ctx.moveTo(zpr_anchor.x, zpr_anchor.y-10);
            ctx.lineTo(zpr_anchor.x, zpr_anchor.y+10);
            ctx.moveTo(zpr_anchor.x+15, zpr_anchor.y);
            ctx.arc(zpr_anchor.x, zpr_anchor.y, 15, 0, Math.PI*2);
        ctx.stroke();   

    }


    static Captured(ctx, docu){
        var captured = docu.captured;

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
    }

    static Editor(editor){

        var ctx = editor.context;

        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

        Draw.Status(ctx, editor);
        // Draw.Captured(ctx, docu);

        ctx.strokeStyle = "#000000";
        Draw.Curve(ctx,  editor.docu, editor.zpr, editor.currCurveIndex);
        Draw.Anchor(ctx, editor.docu, editor.zpr);
    }
}

module.exports = Draw;