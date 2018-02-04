var Document = require('./model/Document.js');
var Neutron  = require('./Neutron.js');

var Vector   = require('./model/Vector.js');
var Lever    = require('./model/Lever.js');
var Curve    = require('./model/Curve.js');
var Outline  = require('./model/Outline.js');

var Cast     = require('./control/Cast.js');
var Draw     = require('./control/Draw.js');
var ZPR      = require('./control/ZPR.js');

class Editor extends EditorCoreData {
	constructor(){
		
		this.docu = new Document();
		this.zpr = new ZPR();
		this.canvas = document.getElementById("canvas").getContext("2d");

		this.down = null;
		this.curr = null;
		this.orig = null;

	}

	setAnchor(newPoint){
		this.docu.anchor = newPoint;
	}

	checkMovingCapture(){
		if(this.captured != null){
			var cap = this.curr.Copy(),
				other = this.captured.over == "x" ? "y" : "x";
			cap[other] = this.captured.by[other];
			this.CurrLever().TransFromArray(transArray, cap.Sub(orig));
		} else {
			this.CurrLever().TransFromArray(transArray, this.curr.Sub(orig));
		}		
	}

	checkEditingCapture(){
		if(this.captured != null){
			var cent = this.CurrLever().points[2],
				vec  = curr.Copy().Sub(cent),
				over = this.captured.over;
			this.UpdateCurrLever(cent.Add(over.Mult(vec.Dot(over) / over.Dot(over))));
		} else {
			this.UpdateCurrLever(curr);
		}		
	}

	UpdateEdit(){

		switch(this.status){
		case Status.Creaating:
			this.CurrCurve().UpdateLever(this.currLeverIndex, 4, curr);
			break;
		case Status.MovingCurve:
			this.CurrCurve().TransFromArray(this.transArray, 
				zpr.InvTransform(this.curr).Sub(zpr.InvTransform(this.orig)));
			break;
		case Status.MovingLever:
			this.checkMovingCapture();
            break;
		case Status.EditingLever:
			this.checkEditingCapture();
			break;
		}
	}

	FinishEdit(){
		if(this.status != Status.Editing && this.status != Status.Creating){
			this.status = Status.Editing;
		}
	}

	CaptureFramework(ithPoint, enter, leave){
		if(this.captured == null){
			for(const [ithc, curve] of this.docu.curves.entries()){
				for(const [ithl, lever] of curve.levers.entries()){
					var curveMatch = this.currCurveIndex == ithc,
						leverMatch = this.currLeverMatch == ithl;
					if(!curveMatch || !leverMatch && curveMatch)
						enter(lever, ithPoint);
				}
			}			
		} else {
			leave(lever, ithPoint);
		}
	}

	CapturedMove(){

		var enter = function(lever){
				if(this.CurrLever().points[2].Dist(lever.points[2]) < 100){
					var abs = mouseV.Sub(lever.points[2]).Abs();
					this.captured = {
						by   : lever.points[2],
						over : (abs.x < abs.y) ? "x" : "y",
						type : "center"
					};
				}
			}.bind(this);
		var leave = function(){
			if(this.captured.type == "center"){
				var otherDir = this.captured.over == "x" ? "y" : "x";
				if(Math.abs(this.curr[otherDir] - this.captured.by[otherDir]) > 50){
					this.captured = null;
				}				
			}
		}.bind(this);

		this.CaptureFramework(null, enter, leave);
	}


	CapturedEdit(){

		var enter = function(lever, ithPoint){

				var angle = mouseV.Sub(this.CurrLever().points[2]).Angle(),
					control = lever.points[ithPoint].Sub(lever.points[2]),
					leverAngle = control.Angle();
				
				for(let i = 0; i < 3; i++){
					if(Math.abs(angle - Math.PI/2 * i) < 0.09){
						var x = Math.cos(Math.PI/2 * i),
							y = Math.sin(Math.PI/2 * i);
						this.captured = {
							by:this.CurrLever().points[2],
							over: new Vector(x, y),
							type: "control"
						}
					}								
				}

				if(Math.abs(angle - leverAngle) < 0.09){
					this.captured = {
						by : lever.points[2],
						over: control,
						type: "control"
					};
				}
			}.bind(this);
		var leave = function(){
			if(this.captured.type == "center"){
				var control = lever.points[pIndex].Sub(lever.points[2]);
				if(Math.abs(angle - control.Angle()) >= 0.09){
					this.captured = null;
				}
			}
		}.bind(this);

		this.CaptureFramework(null, enter, leave);
	}


	Drag(event) {
		
		event.stopPropagation();

		if (!this.down && (event.type == "mousedown")) {
			this.down   = true;
			this.orig = this.MouseV(event);
			this.curr = this.MouseV(event);

			switch(this.status){
			case Status.Creating:
				this.AddPoint(this.orig); break;
			case Status.MovingAnchor:
				this.setAnchor(zpr.InvTransform(curr)); break;
			case Status.EditingLever:
				this.SelectControlPoint(zpr.InvTransform(curr));
				if(this.currLeverIndex == null) this.Deselect(); break;
			case Status.Editing:
				this.PrepareTrans(zpr.InvTransform(curr));
				if(tempTransArray.length == 0) this.Deselect(); break;
			}
			this.UpdateDraw("mouseDown");
		}

		if (this.down && (event.type == "mousemove")) {
			this.curr = this.MouseV(event);
			
			switch(this.status){
				case Status.MovingLever:
					this.CaptureCenterTest(curr); break;
				case Status.EditingLever:
					this.CaptureControlTest(curr, currPointIndex);
			}
				
			this.UpdateEdit();
			this.UpdateDraw("mouseMoved");
		}
		
		if (this.down && (event.type == "mouseup")) {
			this.down = false;
			this.orig = null;
			this.FinishEdit();
			this.ClearCapture();
			this.UpdateDraw("mouseUp");
		}

	}

	ClearCapture(){
		this.captured = null;		
	}


	UpdateDraw(info){
		console.log(info);
		for(var curve of this.docu.curves){
			curve.GetOutlines();
		}
		Draw.Curves(this.canvas.getContext("2d"), this);
		for(var sub_curves in this.importedDocuments){
			Draw.Curve(this.canvas.getContext("2d"), this.importedDocuments[sub_curves], this.zpr);
		}
	}

	SetEdit(){
		docu.status = Status.Editing;
		docu.Deselect();
		docu.UpdateDraw();
	}

	SetCreate(){
		docu.status = Status.Creating;
        docu.Deselect();
		docu.UpdateDraw();
	}
	
}

module.exports = Editor;