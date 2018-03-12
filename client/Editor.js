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
		
		this.docu = new Document();
		this.neutron = new Neutron(this);
		this.zpr = new ZPR();
		this.context = document.getElementById("canvas").getContext("2d");

		this.down = null;
		this.curr = null;
		this.orig = null;

		this.InitEvents();
		this.UpdateDraw("init");
	}

	SetAnchor(newPoint){
		this.docu.anchor = newPoint;
	}

	MoveLever(){
		this.TransCurrLever(this.curr.Sub(this.orig));
	}

	EditLever(){
		this.UpdateCurrLever(this.curr);
	}

	UpdateEdit(){

		switch(this.status){
		case Status.Creating:
			this.CurrCurve().UpdateLever(this.currLeverIndex, 4, this.curr);
			break;
		case Status.MovingAnchor:
			this.SetAnchor(this.curr); break;
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
			// console.log(curve.outline);
		}
		// console.log(this.docu);

	}

	FinishEdit(){
		if(this.status != Status.Editing && this.status != Status.Creating){
			this.status = Status.Editing;
		}
	}

	
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
				this.SetAnchor(this.curr); break;
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

	ToggleMoveAnchor(evt){
		evt.preventDefault();
		if(this.status == Status.Editing){
			this.status = Status.MovingAnchor;
		} else if(this.status == Status.MovingAnchor){
			this.status = Status.Editing;	
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

		var rect = event.target.getBoundingClientRect();
		var mouseV = new Vector(
			Math.max(rect.left, Math.min(rect.right, event.clientX - rect.left)) * 1.5,
			Math.max(rect.top,  Math.min(rect.bottom, event.clientY - rect.top)  * 1.5)
		);

		var zoomInc = event.deltaY*0.00005;
		this.zpr.Zoom(mouseV, zoomInc);
		this.UpdateDraw();
	}

	InitEvents(){
		document.onkeydown = function(evt) {

			if(evt.ctrlKey && evt.key == "c"){
				this.ToggleCreate();
			}

            if(evt.ctrlKey && evt.key == "Delete"){
            	this.RemoveLever(evt);
            }

			if(evt.ctrlKey && evt.key == "a"){
				console.log("here")
				this.ToggleMoveAnchor(evt);
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

		document.addEventListener("ondocuchange", function(){
			this.UpdateDraw('redraw by event');
		}.bind(this));
	}

}

module.exports = Editor;