"use strict";

require('./styles.css')

var Vector = require('./Vector.js');
var Lever =  require('./Lever.js');

var Cast =  require('./Cast.js');
var Curve = require('./Curve.js');

var Document = require('./Document.js');
var LoadData = require('./Load.js');

var Draw = require('./Draw.js');

function ClearDOMChildren(elem){
	while (elem.firstChild) {
	    elem.removeChild(elem.firstChild);
	}
}

function AddParamUIOfExistingParam(param){
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
		valueSlider.value = valueInput.value;
	}

	valueSlider.onchange = valueSlider.oninput = function(){
		valueInput.value = valueSlider.value;
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
			AddParamUIOfExistingParam(param);
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
	        Draw.Curves(context, docu.curves, null);

	        ClearDOMChildren(document.getElementById("param-group"));
    		for(let param of docu.params) {
				console.log(param);
				AddParamUIOfExistingParam(param);
			}
	        AddParamUI(docu);

	        document.getElementById("init-code").value = docu.init;

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

	var tempCurveTransArray=[],
		tempLeverTransArray=[];


	function Drag(event) {
		
		event.stopPropagation();

		if (!down && (event.type == "mousedown")) {
			down   = true;
			orig = MouseV(event);
			curr = MouseV(event);
			if(status == Status.Creating){
				if(currGroupIndex == null){
					currGroupIndex = docu.groups.push({curves:[]}) - 1;
					docu_group = docu.groups[0];
				}

				if(currCurveIndex == null){
					currCurveIndex = docu.curves.push(new Curve(orig)) - 1;	
					console.log(currCurveIndex);
				}
				console.log(docu.curves[currCurveIndex]);

                var res = -1;
                var curve = docu.curves[currCurveIndex];
                for (var j = curve.levers.length-1; j >=0; j--){
                    var res = Cast.Lever(curve.levers[j], curr);
                    if(res != -1){
                        currLeverIndex = j;
                        currPoint = res;
                        status = Status.EditingLever;
                        document.getElementById("status").innerHTML = "Editing";
                        break;
                    }
                }
                if(res == -1){
                    currLeverIndex = docu.curves[currCurveIndex].Add(orig);
                }

			} else if (status == Status.Editing){
				if(isEditingLever){
					if(currCurveIndex != null){
						var curve = docu.curves[currCurveIndex];
						for (var j = curve.levers.length-1; j >=0; j--){
							var res = Cast.Lever(curve.levers[j], curr);
							if(res != -1 && res != 2){
								currLeverIndex = j;
								currPoint = res;
								status = Status.EditingLever;
								break;
							}
						}						
					}
				} else {
                    console.log(docu.curves.length + " curves");
					for (var i = docu.curves.length-1; i >= 0 ; i--){
						var res = Cast.Curve(docu.curves[i], curr);
                        console.log("casted " + res);
						if(res != -1) {

                            var newCast = res;

                            res = -1;
							currCurveIndex = i;
							var curve = docu.curves[currCurveIndex];
							for (var j = curve.levers.length-1; j >=0; j--){
								res = Cast.Lever(curve.levers[j], curr);
								if(res != -1){
									currLeverIndex = j;
									currPoint = res;
									if(isTranslatingLever){
										console.log("moving_lever");
										status = Status.MovingLever;
										tempLeverTransArray = curve.levers[currLeverIndex].ExtractArray();
										console.log(tempLeverTransArray);
									}
                                    break;
								}
							}

							if(res == -1){
                                console.log(currCurveIndex);
                                if(isTranslatingLever){
                                    currLeverIndex = docu.curves[currCurveIndex].Insert(newCast);
                                } else {                                
                                    status = Status.MovingCurve;
                                    tempCurveTransArray = docu.curves[currCurveIndex].ExtractArray();
                                }
                                break;
							}

						}

					}					
				}
			}
			Draw.Curves(context, docu.curves, currCurveIndex, currLeverIndex);
		}
		
		if (down && (event.type == "mousemove")) {
			curr = MouseV(event);
			if(status == Status.Creating){
				docu.curves[currCurveIndex].UpdateLever(currLeverIndex, 4, curr);
			} else if (status == Status.Editing){

			} else if (status == Status.MovingCurve){
				// console.log(tempCurveTransArray);
				docu.curves[currCurveIndex].TransFromArray(tempCurveTransArray, curr.Sub(orig));
			} else if (status == Status.MovingLever){
				// console.log(tempLeverTransArray);
				docu.curves[currCurveIndex].levers[currLeverIndex].TransFromArray(tempLeverTransArray, curr.Sub(orig));
                docu.curves[currCurveIndex].UpdateOutlines();

			} else if (status == Status.EditingLever){
				console.log(currPoint);
				docu.curves[currCurveIndex].UpdateLever(currLeverIndex, currPoint, curr);
			}
			Draw.Curves(context, docu.curves, currCurveIndex, currLeverIndex);
		}
		
		if (down && (event.type == "mouseup")) {
			down = false;
			orig = null;
			if(status == Status.Creating){
			} else if (status == Status.MovingCurve){
				status = Status.Editing;
			} else if (status == Status.MovingLever){
				status = Status.Editing;
			} else if (status == Status.EditingLever){
				console.log(docu.curves[currCurveIndex].lo);
				status = Status.Editing;
			}

			Draw.Curves(context, docu.curves, currCurveIndex, currLeverIndex);
		}

	}

	window.onload = function() {
		
		LoadName(context, docu);

		document.onkeydown = function(evt) {

			if(evt.keyCode == 27 && status == Status.Creating){
				document.getElementById("status").innerHTML = "Editing";
				status = Status.Editing;
				currCurveIndex = null;
			}

			if(evt.ctrlKey && evt.key == "c" && status == Status.Editing){
				document.getElementById("status").innerHTML = "Drawing new context, docu.curves, curve";
				status = Status.Creating;
                currCurveIndex = null;
				console.log(status);
			}

            if(evt.ctrlKey && evt.keyCode == 8){
                if(currCurveIndex != null){
                    var curve = docu.curves[currCurveIndex];
                    if(currLeverIndex != null){
                        curve.levers.splice(currLeverIndex, 1);
                        curve.UpdateOutlines();
                        currLeverIndex = null;
                    }

                    if(curve.levers.length == 1){
                        docu.curves.splice(currCurveIndex, 1);
                        currCurveIndex = null;
                    }
                }
                Draw.Curves(context, docu.curves, currCurveIndex, currLeverIndex);
            }

            if(evt.ctrlKey && evt.key=="d"){
                Draw.CurvesFill(context, docu.curves);
            }

			if(evt.keyCode == 16){
				isTranslatingLever = true;
			}

			if(evt.keyCode == 18){
				isEditingLever = true;
			}

			if(evt.key == "1" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 4;
					Draw.Curves(context, docu.curves, currCurveIndex, currLeverIndex);
				}
			}

			if(evt.key == "2" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 3;
					Draw.Curves(context, docu.curves, currCurveIndex, currLeverIndex);
				}
			}

			if(evt.key == "3" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 2;
					Draw.Curves(context, docu.curves, currCurveIndex, currLeverIndex);
				}
			}

			if(evt.key == "4" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 0;
					Draw.Curves(context, docu.curves, currCurveIndex, currLeverIndex);
				}
			}

		};

		document.onkeyup = function(evt){

            if(evt.ctrlKey && evt.key=="d"){
                Draw.Curves(context, docu.curves, currCurveIndex);
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
			docu.eval(document.getElementById("init-code").value);
			for(let curve of docu.curves){
				curve.UpdateOutlines();
			}
	        Draw.Curves(context, docu.curves, null);
		};

		document.getElementById("init-code").onchange = function(){
			docu.init = document.getElementById("init-code").value;
		}
	}	
})();
