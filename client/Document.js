var DocuCore = require('./DocuCore.js');

var Vector =  require('./model/Vector.js');
var Lever =   require('./model/Lever.js');
var Curve =   require('./model/Curve.js');
var Outline = require('./model/Outline.js');

var Cast =   require('./control/Cast.js');
var Draw =   require('./control/Draw.js');
var ZPR =    require('./control/ZPR.js');

var LoadData = require('./Load.js');

Array.prototype.last = function(){
	return this[this.length - 1];
}

class Param{
 	constructor(name, value, min, max){
		this.name = name;
		this.value = value;
		this.min = min;
		this.max = max;
	}
}

var Status = Object.freeze({
		Editing : 0,
		Creating : 1,
		MovingCurve : 2,
		MovingLever : 3,
		EditingLever : 4,
		MovingAnchor : 5
	});

class Document extends DocuCore{
	constructor(canvas){
		
		this.docu = new DocuCore();
		this.canvas = canvas;

		this.status = Status.Editing;
		this.isTranslatingLever = false;
		this.isEditingLever = false;

		this.currCurveIndex = null,
		this.currLeverIndex = null,
		this.currPoint = null;

		this.captured = null;

		this.zpr = new ZPR();
	}

	CurrCurve(){
		return this.docu.curves[this.currCurveIndex];
	}

	CurrLever(){
		return this.docu.curves[this.currCurveIndex].levers[this.currLeverIndex];
	}

	AddCurve(curve){
		this.currCurveIndex = this.docu.curves.push(curve) - 1;
	}

	AddPoint(point){
		if(this.currCurveIndex == null){
			this.AddCurve(new Curve(point));
		} else {
			if(this.SelectControlPoint(point, false) == -1){
				this.currLeverIndex = this.CurrCurve().Add(point);
				console.log(this.currLeverIndex);
			}
		}

		// otherwise the status will be switched to EditingLever.
		// watchout the side effect.

	}

	Deselect(){
		this.currCurveIndex = null,
		this.currLeverIndex = null,
		this.currPoint = null;
	}

	/**
	 * Once a casted control point of a lever found, set up current
	 * lever index and control point index, and set the status
	 * @param {[type]} point [description]
	 */
	SelectControlPoint(point, no_center){

		var cast = -1;
		if(this.currCurveIndex != null){

			for (const [i, lever] of this.CurrCurve().levers.entries()){
				cast = Cast.Lever(lever, point);
				if(cast != -1 && cast != (no_center ? 2 : -1)){
					this.currLeverIndex = i;
					this.currPoint = cast;
					this.status = Status.EditingLever;
					break;
				}
			}
		}

		return cast;
	}

	PrepareLeverTrans(ith, point){
		var transArray = [];
		var curve = this.docu.curves[ith];

		for (const [i, lever] of this.CurrCurve().levers.entries()){
			var cast = Cast.Lever(lever, point);
			if(cast != -1){
				this.currLeverIndex = i;
				this.currPoint = cast;
				this.status = Status.MovingLever;
				transArray = this.CurrLever().ExtractArray();
				break;
			}
		}

		return transArray;

	}

	PrepareTrans(point){
		var transArray = [];
		for (const [ith, curve] of this.docu.curves.entries()){
			if(Cast.Curve(curve, point) != -1) {
				this.currCurveIndex = ith;
				transArray = this.PrepareLeverTrans(ith, point);
				if(transArray.length == 0){
					this.status = Status.MovingCurve;
					transArray = this.CurrCurve().ExtractArray();
				}
				break;
			}
		}
		return transArray;
	}

	UpdateEdit(curr, orig, transArray){

		switch(this.status){
			case Status.Creating:
				this.CurrCurve().UpdateLever(this.currLeverIndex, 4, curr);
				break;
			case Status.MovingCurve:
				this.CurrCurve().TransFromArray(transArray, curr.Sub(orig));
				break;
			case Status.MovingLever:
				if(this.captured != null){
					var cap = curr.Copy(),
						other = this.captured.over == "x" ? "y" : "x";
					cap[other] = this.captured.by[other];
					this.CurrLever().TransFromArray(transArray, cap.Sub(orig));
				} else {
					this.CurrLever().TransFromArray(transArray, curr.Sub(orig));
				}
	            this.CurrCurve().GetOutlines();
	            break;
			case Status.EditingLever:
				
				if(this.captured != null){
					var cent = this.CurrLever().points[2],
						vec  = curr.Copy().Sub(cent),
						over = this.captured.over;
					this.CurrCurve().UpdateLever(this.currLeverIndex, this.currPoint, cent.Add(over.Mult(vec.Dot(over) / over.Dot(over))));
				} else {
					this.CurrCurve().UpdateLever(this.currLeverIndex, this.currPoint, curr);
				}
				break;

		}
	}

	FinishEdit(){
		if(this.status != Status.Editing && this.status != Status.Creating){
			this.status = Status.Editing;
		}
	}

	CaptureCenterTest(mouseV){
		for(const [ithc, curve] of this.docu.curves.entries()){
			for(const [ithl, lever] of curve.levers.entries()){
				if(this.captured == null){
					if((this.currCurveIndex != ithc) || (this.currCurveIndex == ithc && this.currLeverIndex != ithl))
						if(this.CurrLever().points[2].Dist(lever.points[2]) < 100){
							if(Math.abs(mouseV.x - lever.points[2].x) < Math.abs(mouseV.y - lever.points[2].y)){
								this.captured = {by : lever.points[2], over : "x", type: "center"};
							} else {
								this.captured = {by : lever.points[2], over : "y", type: "center"};
							}
						}
				}
				if(this.captured != null && this.captured.type == "center"){
					console.log("here " +this.captured.over + " " +mouseV[this.captured.over] + " " + this.captured.by[this.captured.over]);
					var otherDir = this.captured.over == "x" ? "y" : "x";
					if(Math.abs(mouseV[otherDir] - this.captured.by[otherDir]) > 50){
						this.captured = null;
					}
				}
			}
		}
	}

	CaptureControlTest(mouseV, pIndex){
		if(pIndex != 2 && pIndex != null)
			for(const [ithc, curve] of this.docu.curves.entries()){
				for(const [ithl, lever] of curve.levers.entries()){

					var angle = mouseV.Sub(this.CurrLever().points[2]).Angle();

					if(this.captured == null){
						if((this.currCurveIndex != ithc) || (this.currCurveIndex == ithc && this.currLeverIndex != ithl)){

							for(let i = 0; i < 3; i++){
								if(Math.abs(angle - Math.PI/2 * i) < 0.09){
									this.captured = {by:this.CurrLever().points[2], over: new Vector(Math.cos(Math.PI/2 * i), Math.sin(Math.PI/2*i)), type: "control"}
								}								
							}

							if(Math.abs(angle - lever.points[pIndex].Sub(lever.points[2]).Angle()) < 0.09){
								this.captured = {by:lever.points[2], over: lever.points[pIndex].Sub(lever.points[2]), type: "control"};
							}
						}
					}
					if(this.captured != null && this.captured.type == "control"){
						console.log(this.captured);
						if(Math.abs(angle - lever.points[pIndex].Sub(lever.points[2]).Angle()) >= 0.09){
							this.captured = null;
						}
					}
				}
			}		
	}

	ClearCapture(){
		this.captured = null;		
	}


	UpdateDraw(info){
		console.log(info);
		for(let curve of this.docu.curves){
			curve.GetOutlines();
		}
		Draw.Curves(this.canvas.getContext("2d"), this);
		for(let sub_curves in this.importedDocuments){
			Draw.Curve(this.canvas.getContext("2d"), this.importedDocuments[sub_curves], this.zpr);
		}
	}
	
}

module.exports = Document;