"use strict";

require('./styles.css')

var Vector = require('./Vector.js');
var Lever =  require('./Lever.js');

var Cast =  require('./Cast.js');
var Curve = require('./Curve.js');

var Document = require('./Document.js');
var LoadData = require('./Load.js');

var Draw = require('./Draw.js');


function Save(docu, docu_id){

	var xhr = new XMLHttpRequest();
	xhr.open('PUT', 'save/');
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onload = function() {
	    if (xhr.status === 200) {
	        var userInfo = JSON.parse(xhr.responseText);
	        console.log(userInfo);
	        LoadName();
	    }
	};

	console.log(docu.curves);

	xhr.send(JSON.stringify({id: docu_id, data:docu.curves}));
}

function Load(context, docu, docu_id){

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'load/'+docu_id);
	xhr.onload = function() {
	    if (xhr.status === 200) {
	    	console.log(xhr.responseText);
	        var res = JSON.parse(xhr.responseText);
	    	console.log(res);
	        docu.curves = LoadData.Curves(res);
	        Draw.Curves(context, docu.curves, null);
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
	    
	    	var list = document.getElementById("list");
	    	while (list.firstChild) {
			    list.removeChild(list.firstChild);
			}
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

	var context = canvas.getContext("2d")

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

	var docu = new Document(document.getElementById("canvas"));


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

	var currCurveIndex = null,
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
							if(res != -1){
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
			Draw.Curves(context, docu.curves, currCurveIndex);
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
			Draw.Curves(context, docu.curves, currCurveIndex);
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

			Draw.Curves(context, docu.curves, currCurveIndex);
		}

	}

	window.onload = function() {
		var cvs = document.getElementById("canvas");
		
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
                Draw.Curves(context, docu.curves, currCurveIndex);
            }

            if(evt.ctrlKey && evt.key=="d"){
                Draw.CurvesFill(context, docu.curves);
            }

			if(evt.keyCode == 16){
				evt.preventFromDefault();
				isTranslatingLever = true;
			}

			if(evt.keyCode == 18){
				isEditingLever = true;
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

		cvs.onmousedown = cvs.onmousemove = cvs.onmouseup = Drag;

		var saveButton = document.getElementById("save"),
			loadButton = document.getElementById("load"),
			nameInput  = document.getElementById("name");

		saveButton.onclick = function(){
			var prefix = document.getElementById("prefix").value;
			console.log(prefix);
			Save(docu, prefix + "_" + nameInput.value);
		}

		loadButton.onclick = function(){
			var prefix = document.getElementById("prefix").value;
			Load(context, docu, prefix + "_" + nameInput.value);
		}
	}	
})();
