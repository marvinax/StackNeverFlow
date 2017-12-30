"use strict";

require('./styles.css')

var Vector   = require('./model/Vector.js');
var Document = require('./Document.js');
var LoadData = require('./Load.js');

var Draw = require('./control/Draw.js');

function ClearDOMChildren(elem){
	while (elem.firstChild) {
	    elem.removeChild(elem.firstChild);
	}
}

function AddParamUIOfExistingParam(context, docu, param){
	var paramUI = document.getElementById("param-group");

	var paramElem = document.createElement("div");
	paramElem.id = "param-"+param.name;

	var name = document.createElement("block");
	name.className = "param-name-label";
	name.innerHTML = param.name;

	var valueInput = document.createElement("input");
	valueInput.value = param.value;
	valueInput.setAttribute("type", "number");

	var valueSlider = document.createElement("input");
	valueSlider.setAttribute("type", "range");
	valueSlider.value = param.value;
	valueSlider.min = param.min;
	valueSlider.max = param.max;
	valueSlider.step = 0.01;

	valueInput.onchange = valueInput.oninput = function(){
		param.value = valueSlider.value = valueInput.value;

        docu.Eval(docu.update);
        docu.UpdateDraw(context);
	}

	valueSlider.onchange = valueSlider.oninput = function(){
		param.value = valueInput.value = valueSlider.value;

        docu.Eval(docu.update);
        docu.UpdateDraw(context);

	}

	paramElem.appendChild(name);
 	paramElem.appendChild(valueInput);
 	paramElem.appendChild(valueSlider);

	paramUI.appendChild(paramElem);
}

function AddParamUI(docu){
	var paramUI = document.getElementById("param-group");

	var paramElem = document.createElement("div");

	var nameInput = document.createElement("input");
	nameInput.id = "param-name";

	var defaultValueInput = document.createElement("input");
	defaultValueInput.id = "param-default-value";
	defaultValueInput.setAttribute("type", "number");

	var minInput = document.createElement("input");
	minInput.id = "param-min-value";
	minInput.setAttribute("type", "number");

	var maxInput = document.createElement("input");
	maxInput.id = "param-max-value";
	maxInput.setAttribute("type", "number");

	var saveButton = document.createElement("button");
	saveButton.id = "param-save-button";
	saveButton.innerHTML = "save param";
	
	var context = document.getElementById("canvas").getContext("2d");

	saveButton.onclick = function(){
		var nameInput = document.getElementById("param-name"),
			defaultValueInput = document.getElementById("param-default-value"),
			minInput = document.getElementById("param-min-value"),
			maxInput = document.getElementById("param-max-value");

		var param = {
			name :nameInput.value,
			value : defaultValueInput.value,
			min : minInput.value,
			max : maxInput.value
		};
		docu.params.push(param);

		var paramUI = document.getElementById("param-group");

		ClearDOMChildren(paramUI);
		for(let param of docu.params) {
			console.log(param);
			AddParamUIOfExistingParam(context, docu, param);
		}

		AddParamUI(docu);
	}

	paramElem.appendChild(nameInput);
	paramElem.appendChild(defaultValueInput);
	paramElem.appendChild(minInput);
	paramElem.appendChild(maxInput);
	paramElem.appendChild(saveButton);

	paramUI.appendChild(paramElem);
}

function SetUI(param, id){
	var paramElem = document.getElementById(id);
	var children = paramElem.childNodes;
	children[0].value = param.name;
	children[1].value = param.value;
	children[2].value = param.min;
	children[3].value = param.max;
}

function GetParam(param, id){
	var paramElem = document.getElementById(id);
	var children = paramElem.childNodes;
	children[0].value = param.name;
	children[1].value = param.value;
	children[2].value = param.min;
	children[3].value = param.max;
}

function Save(context, docu, docu_id){
	var xhr = new XMLHttpRequest();
	xhr.open('PUT', 'save/');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function() {
	    if (xhr.status === 200) {
	        var userInfo = JSON.parse(xhr.responseText);
	        console.log(userInfo);
	        LoadName(context, docu);
	    }
	};
	xhr.send(JSON.stringify({id: docu_id, data:docu}));
}


function Load(context, docu, docu_id){

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

	        ClearDOMChildren(document.getElementById("param-group"));
    		for(let param of docu.params) {
				console.log(param);
				AddParamUIOfExistingParam(context, docu, param);
			}
	        AddParamUI(docu);

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

function LoadName(context, docu){
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
	    			Load(context, docu, r);
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
	var docu_group = null;

	var Status = Object.freeze({
		Editing : 0,
		Creating : 1,
		MovingCurve : 2,
		MovingLever : 3,
		EditingLever : 4
	});

	var status = Status.Editing,
		isTranslatingLever = false,
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
				var cast;
				if(isEditingLever){
					cast = docu.SelectControlPoint(zpr.InvTransform(curr));
				} else {
					tempTransArray = docu.PrepareTrans(zpr.InvTransform(curr));
				}
				if (cast == -1 || tempTransArray.length == 0){
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
			docu.UpdateEdit(zpr.InvTransform(curr), zpr.InvTransform(orig), tempTransArray);
			Draw.Curves(context, docu);
		}
		
		if (down && (event.type == "mouseup")) {
			down = false;
			orig = null;
			docu.FinishEdit();
			docu.Eval(docu.init);
			console.log(docu.consts);
			Draw.Curves(context, docu);
		}

	}

	window.onload = function() {
		
		LoadName(context, docu);

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

            // if(evt.ctrlKey && evt.key=="d"){
            //     Draw.CurvesFill(context, docu);
            // }

			if(evt.keyCode == 18){
				isEditingLever = true;
			}

			if(evt.key == "1" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
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
			
			var zoomInc = event.deltaY*0.0001;
			docu.zpr.Zoom(docu.zpr.InvTransform(MouseV(event)), zoomInc);
			console.log(docu.zpr.pan);
			Draw.Curves(context, docu);
		}

		var saveButton = document.getElementById("save"),
			loadButton = document.getElementById("load"),
			nameInput  = document.getElementById("name");

		saveButton.onclick = function(){
			var prefix = document.getElementById("prefix").value;
			console.log(prefix);
			Save(context, docu, prefix + "_" + nameInput.value);
		}

		loadButton.onclick = function(){
			var prefix = document.getElementById("prefix").value;
			Load(context, docu, prefix + "_" + nameInput.value);
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
