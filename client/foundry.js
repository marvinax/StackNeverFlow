"use strict";

require('./styles.css')

var Vector   = require('./model/Vector.js');
var Document = require('./Document.js');
var LoadData = require('./Load.js');

var Draw = require('./control/Draw.js');
var Neutron = require('./Neutron.js');

function ClearDOMChildren(elem){
	while (elem.firstChild) {
	    elem.removeChild(elem.firstChild);
	}
}


function Save(context, docu, neutron, docu_id){
	var xhr = new XMLHttpRequest();
	xhr.open('PUT', 'save/');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function() {
	    if (xhr.status === 200) {
	        var userInfo = JSON.parse(xhr.responseText);
	        console.log(userInfo);
	        LoadName(context, docu, neutron);
	    }
	};
	docu.ClearEval();
	xhr.send(JSON.stringify({id: docu_id, data:docu}));
}


function Load(context, docu, neutron, docu_id){

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'load/'+docu_id);
	xhr.onload = function() {
	    if (xhr.status === 200) {
	        var res = JSON.parse(xhr.responseText);
	    	console.log(res);
	        docu.curves = LoadData.Curves(res.curves);
	        docu.params = res.params;
	        docu.init   = res.init;
	        docu.update = res.update;

	        console.log(neutron);
	        neutron.ReloadExistingParams();

	        document.getElementById("init-code").value = docu.init;
	        document.getElementById("update-code").value = docu.update;

	        docu.InitEval();
	        docu.Eval(docu.init);
	        docu.Eval(docu.update);
	        docu.UpdateDraw(context);

	    }
	    else {
	        alert('Request failed.  Returned status of ' + xhr.status);
	    }
	};
	xhr.send();
}

function LoadName(context, docu, neutron){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'load_name/');
	xhr.onload = function() {
	    if (xhr.status === 200) {
	    	console.log(xhr.responseText);
	        var res = JSON.parse(xhr.responseText);
	    	console.log(res);
	    
			ClearDOMChildren(document.getElementById("list"));

	    	for (let r of res.res){
	    		let a = document.createElement('a');
	    		a.innerHTML = r.split("_").pop();
	    		a.class = "char-link";
	    		a.onclick = function(){
	    			Load(context, docu, neutron, r);
	    			document.getElementById("prefix").value = r.split("_")[0];
	    			document.getElementById("name").value = r.split("_")[1];
	    		}
	    		list.appendChild(a);
	    		list.appendChild(document.createElement('br'));
	    	}

	    }
	    else {
	        alert('Request failed.  Returned status of ' + xhr.status);
	    }
	};
	xhr.send();
}


(function(){

	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d")
	var docu = new Document(canvas);
	var zpr  = docu.zpr;
	
	var neutron = new Neutron(context, docu);

	var Status = Object.freeze({
		Editing : 0,
		Creating : 1,
		MovingCurve : 2,
		MovingLever : 3,
		EditingLever : 4
	});

	var isTranslatingLever = false,
		isEditingLever = false;

	function MouseV(event) {
		var rect = event.target.getBoundingClientRect();

		return new Vector(
			Math.max(rect.left, Math.min(rect.right, event.clientX - rect.left)) * 1.5,
			Math.max(rect.top,  Math.min(rect.bottom, event.clientY - rect.top)  * 1.5)
		)
	}


	var down = false,
		orig,
		curr;

	var currGroupIndex = null,
		currCurveIndex = null,
		currLeverIndex = null,
		currPointIndex = null,
		currPoint = null;

	var tempTransArray=[];

	function Drag(event) {
		
		event.stopPropagation();

		if (!down && (event.type == "mousedown")) {
			down   = true;
			orig = MouseV(event);
			curr = MouseV(event);
			if(docu.status == Status.Creating){
				console.log("creating");
    			docu.AddPoint(orig);

			} else if (docu.status == Status.Editing){
				if(isEditingLever){
					currPointIndex = docu.SelectControlPoint(zpr.InvTransform(curr));
				} else {
					tempTransArray = docu.PrepareTrans(zpr.InvTransform(curr));
				}
				if (currPointIndex == -1 || tempTransArray.length == 0){
					docu.Deselect();
				}
			}
			Draw.Curves(context, docu);
		}
		
		if (event.type == "mousemove"){
			// console.log("executed");
			// zpr.Save();
		}

		if (down && (event.type == "mousemove")) {
			curr = MouseV(event);
			
			if(docu.status == Status.MovingLever)
				docu.CaptureCenterTest(curr);
			else if(docu.status == Status.EditingLever)
				docu.CaptureControlTest(curr, currPointIndex);
			
			docu.UpdateEdit(zpr.InvTransform(curr), zpr.InvTransform(orig), tempTransArray);
			Draw.Curves(context, docu);
		}
		
		if (down && (event.type == "mouseup")) {
			down = false;
			orig = null;
			docu.FinishEdit();
			docu.ClearCapture();
			Draw.Curves(context, docu);
		}

	}

	window.onload = function() {
		
		LoadName(context, docu, neutron);

		document.onkeydown = function(evt) {

			if(evt.keyCode == 27 && docu.status == Status.Creating){
				docu.status = Status.Editing;
				docu.Deselect();
				Draw.Curves(context, docu);
			}

			if(evt.ctrlKey && evt.key == "c" && docu.status == Status.Editing){
				docu.status = Status.Creating;
                docu.Deselect();
				Draw.Curves(context, docu);
			}

            if(evt.ctrlKey && evt.keyCode == 8){
                if(docu.currCurveIndex != null){
                    var curve = docu.CurrCurve();
                    if(docu.currLeverIndex != null){
                        curve.levers.splice(docu.currLeverIndex, 1);
                        curve.UpdateOutlines();
                        docu.currLeverIndex = null;
                    }

                    if(curve.levers.length == 1){
                        docu.curves.splice(docu.currCurveIndex, 1);
                        docu.currCurveIndex = null;
                    }
                }
                Draw.Curves(context, docu);
            }
                      

			if(evt.keyCode == 18){
				isEditingLever = true;
			}

			if(evt.key == "1" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					console.log("yaya");
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 4;
					Draw.Curves(context, docu);
				}
			}

			if(evt.key == "2" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 3;
					Draw.Curves(context, docu);
				}
			}

			if(evt.key == "3" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 2;
					Draw.Curves(context, docu);
				}
			}

			if(evt.key == "4" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 0;
					Draw.Curves(context, docu);
				}
			}

		};

		document.onkeyup = function(evt){

            if(evt.ctrlKey && evt.key=="d"){
                Draw.Curves(context, docu);
            }

			if(evt.keyCode == 16){
				isTranslatingLever = false;
			}

			if(evt.keyCode == 18){
				console.log('leave editing lever');
				isEditingLever = false;
			}
		}

		canvas.onmousedown = canvas.onmousemove = canvas.onmouseup = Drag;

		canvas.onmousewheel = function(event){
			event.preventDefault();
			
			var zoomInc = event.deltaY*0.00005;
			docu.zpr.Zoom(docu.zpr.InvTransform(MouseV(event)), zoomInc);
			Draw.Curves(context, docu);
		}

		var saveButton = document.getElementById("save"),
			loadButton = document.getElementById("load"),
			nameInput  = document.getElementById("name");

		saveButton.onclick = function(){
			var prefix = document.getElementById("prefix").value;
			console.log(prefix);
			Save(context, docu, neutron, prefix + "_" + nameInput.value);
		}

		loadButton.onclick = function(){
			var prefix = document.getElementById("prefix").value;
			Load(context, docu, neutron, prefix + "_" + nameInput.value);
		}

		document.getElementById("init-eval").onclick = function(){
			docu.Eval(document.getElementById("init-code").value);
			docu.UpdateDraw(context);
		};

		document.getElementById("init-code").onchange = function(){
			docu.init = document.getElementById("init-code").value;
		}

		document.getElementById("update-code").onchange = function(){
			docu.update = document.getElementById("update-code").value;
		}
	}	
})();
