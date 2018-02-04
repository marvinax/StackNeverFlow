var Status = require("./Status.js");
var EditorCoreData = require('./EditorCoreData.js');

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
		super();
		
		this.neutron = new Neutron();
		this.docu = new Document();
		this.zpr = new ZPR();
		this.context = document.getElementById("canvas").getContext("2d");

		this.down = null;
		this.curr = null;
		this.orig = null;

		this.InitEvents();
		this.UpdateDraw("init");
	}

	setAnchor(newPoint){
		this.docu.anchor = newPoint;
	}

	MoveLever(){
		// if(this.captured != null){
		// 	var cap = this.curr.Copy(),
		// 		other = this.captured.over == "x" ? "y" : "x";
		// 	cap[other] = this.captured.by[other];
		// 	this.TransCurrLever(cap.Sub(this.orig));
		// } else {
			this.TransCurrLever(this.curr.Sub(this.orig));
		// }		
	}

	EditLever(){
		// if(this.captured != null){
		// 	var cent = this.CurrLever().points[2],
		// 		vec  = this.curr.Copy().Sub(cent),
		// 		over = this.captured.over,
		// 		cap  = cent.Add(over.Mult(vec.Dot(over) / over.Dot(over)));
		// 	this.UpdateCurrLever(cap);
		// } else {
			this.UpdateCurrLever(this.curr);
		// }		
	}

	UpdateEdit(){

		switch(this.status){
		case Status.Creating:
			this.CurrCurve().UpdateLever(this.currLeverIndex, 4, this.curr);
			break;
		case Status.MovingCurve:
			this.TransCurrCurve(this.curr.Sub(this.orig));
			break;
		case Status.MovingLever:
			this.MoveLever();
            break;
		case Status.EditingLever:
			this.EditLever();
			break;
		}

		for(var curve of this.docu.curves){
			curve.GetOutlines();
			console.log(curve.outline);
		}

	}

	FinishEdit(){
		if(this.status != Status.Editing && this.status != Status.Creating){
			this.status = Status.Editing;
		}
	}

	// CaptureFramework(ithPoint, enter, leave){
	// 	for(const [ithc, curve] of this.docu.curves.entries()){
	// 		for(const [ithl, lever] of curve.levers.entries()){
	// 			var curveMatch = this.currCurveIndex == ithc,
	// 				leverMatch = this.currLeverMatch == ithl;
	// 			if(this.captured == null){
	// 				if(!curveMatch || (!leverMatch && curveMatch)) enter(lever, ithPoint);							
	// 			} else {
	// 				leave(lever, ithPoint);
	// 			}
	// 		}
	// 	}			
	// }

	// CapturedMove(){

	// 	var enter = function(lever){
	// 			if(this.CurrLever().points[2].Dist(lever.points[2]) < 100){
	// 				var abs = this.curr.Sub(lever.points[2]).Abs();
	// 				this.captured = {
	// 					by   : lever.points[2],
	// 					over : (abs.x < abs.y) ? "x" : "y",
	// 					type : "center"
	// 				};
	// 			}
	// 		}.bind(this);
	// 	var leave = function(){
	// 		if(this.captured.type == "center"){
	// 			var otherDir = this.captured.over == "x" ? "y" : "x";
	// 			if(Math.abs(this.curr[otherDir] - this.captured.by[otherDir]) > 50){
	// 				this.captured = null;
	// 			}				
	// 		}
	// 	}.bind(this);

	// 	this.CaptureFramework(null, enter, leave);
	// 	this.UpdateDraw("MoveLever");
	// }


	// CapturedEdit(ithPoint){

	// 	var enter = function(lever, ithPoint){

	// 		console.log(ithPoint);

	// 			var angle = this.curr.Sub(this.CurrLever().points[2]).Angle(),
	// 				control = lever.points[ithPoint].Sub(lever.points[2]),
	// 				leverAngle = control.Angle();
				
	// 			for(let i = 0; i < 3; i++){
	// 				if(Math.abs(angle - Math.PI/2 * i) < 0.09){
	// 					var x = Math.cos(Math.PI/2 * i),
	// 						y = Math.sin(Math.PI/2 * i);
	// 					this.captured = {
	// 						by:this.CurrLever().points[2],
	// 						over: new Vector(x, y),
	// 						type: "control"
	// 					}
	// 				}								
	// 			}

	// 			if(Math.abs(angle - leverAngle) < 0.09){
	// 				this.captured = {
	// 					by : lever.points[2],
	// 					over: control,
	// 					type: "control"
	// 				};
	// 			}
	// 		}.bind(this);
	// 	var leave = function(){
	// 		if(this.captured.type == "center"){
	// 			var control = lever.points[pIndex].Sub(lever.points[2]);
	// 			if(Math.abs(angle - control.Angle()) >= 0.09){
	// 				this.captured = null;
	// 			}
	// 		}
	// 	}.bind(this);

	// 	this.CaptureFramework(ithPoint, enter, leave);
	// 	this.UpdateDraw("EditLever");
	// }

	Drag(event) {
		
		event.stopPropagation();

		var rect = event.target.getBoundingClientRect();
		var MouseV = new Vector(
			Math.max(rect.left, Math.min(rect.right, event.clientX - rect.left)) * 1.5,
			Math.max(rect.top,  Math.min(rect.bottom, event.clientY - rect.top)  * 1.5)
		);

		if (!this.down && (event.type == "mousedown")) {
			this.down   = true;
			this.orig = this.zpr.InvTransform(MouseV);
			this.curr = this.zpr.InvTransform(MouseV);

			switch(this.status){
			case Status.Creating:
				this.AddPoint(this.orig); break;
			case Status.MovingAnchor:
				this.setAnchor(this.curr); break;
			case Status.EditingLever:
				this.SelectControlPoint(this.curr);
				if(this.currLeverIndex == null) this.Deselect(); break;
			case Status.Editing:
				this.PrepareTrans(this.curr);
				if(this.transArray.length == 0) this.Deselect(); break;
			}
			this.UpdateDraw("mouseDown");
		}

		if (this.down && (event.type == "mousemove")) {
			
			this.curr = this.zpr.InvTransform(MouseV);
							
			this.UpdateEdit();
			this.UpdateDraw("mouseMoved");
		}
		
		if (this.down && (event.type == "mouseup")) {
			this.down = false;
			this.orig = null;
			this.FinishEdit();
			this.UpdateDraw("mouseUp");
		}

	}

	UpdateDraw(info){
		console.log(info);
		Draw.Editor(this);
	}

	ToggleCreate(){
		console.log(this.status);
		if(this.status == Status.Creating){
			this.status = Status.Editing;
			this.Deselect();
			this.UpdateDraw("set to editing mode");			
		} else if(this.status == Status.Editing){
			this.status = Status.Creating;
	        this.Deselect();
			this.UpdateDraw("set to creating mode");			
		}
	}

	ToggleEditingLever(){
		if(this.status == Status.EditingLever){
			this.status = Status.Editing;
		}
		if(this.status == Status.Editing){
			this.status = Status.EditingLever;
		}		
	}

	ToggleMoveAnchor(){
		evt.preventDefault();
		if(editor.status == Status.Editing){
			editor.status = Status.MovingAnchor;
		}
		if(editor.status == Status.MovingAnchor){
			editor.status = Status.Editing;	
		}
	}

	SetLeverType(evt){
		var typeIndex = parseInt(evt.key),
			typeArray = [4, 3, 2, 0];
		if(typeIndex > 0 && typeIndex < 9){
			if(this.currCurveIndex != null && this.currLeverIndex != null){
				this.CurrLever().leverMode = typeArray[typeIndex];
				this.UpdateDraw();
			}					
		}

	}

	RemoveLeverUpdate(){
		this.RemoveLever();
		this.UpdateDraw("lever removed");
	}

	Zoom(event){
		event.preventDefault();
		
		var zoomInc = event.deltaY*0.00005;
		this.zpr.Zoom(this.curr, zoomInc);
		this.UpdateDraw();
	}

	InitEvents(){
		document.onkeydown = function(evt) {

			if(evt.ctrlKey && evt.key == "c"){
				this.ToggleCreate();
			}

            if(evt.ctrlKey && evt.key == "Delete"){
            	this.RemoveLever();
            }

			if(evt.ctrlKey && evt.key == "a"){
				this.ToggleMoveAnchor();
			}                      

			this.SetLeverType(evt);

			if(evt.key == "Shift"){
				this.ToggleEditingLever();
			}

			if(evt.key == "z" && evt.ctrlKey){
				this.zpr.zoom = 1;
				this.UpdateDraw();
			}

		}.bind(this);

		document.onkeyup = function(evt){

			if(evt.key == "Control"){
				evt.preventDefault();
				this.ToggleEditingLever();
			}
		}.bind(this)

		canvas.onmousedown = canvas.onmousemove = canvas.onmouseup = this.Drag.bind(this);

		canvas.onmousewheel = this.Zoom.bind(this);

	}

}

module.exports = Editor;