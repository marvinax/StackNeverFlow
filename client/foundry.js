"use strict";

require('./styles.css')

var Vector   = require('./model/Vector.js');

(function(){

	var editor = new Editor();
	var canvas = document.getElementById("canvas");
	var neutron = new Neutron(docu);

	window.onload = function() {

		document.onkeydown = function(evt) {

			if(evt.keyCode == 27 && docu.status == Status.Creating){
				docu.status = Status.Editing;
				docu.Deselect();
				docu.UpdateDraw();
			}

			if(evt.ctrlKey && evt.key == "c" && docu.status == Status.Editing){
				docu.status = Status.Creating;
                docu.Deselect();
				docu.UpdateDraw();
			}

            if(evt.ctrlKey && evt.keyCode == 8){
            	editor.RemoveLever();
                docu.UpdateDraw();
            }

			if(evt.key == "Shift" && docu.status == Status.Editing){
				console.log("yay");
				docu.status = Status.MovingAnchor;
			}                      

			if(evt.keyCode == 18){
				isEditingLever = true;
			}

			if(evt.key == "1" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					console.log("yaya");
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 4;
					docu.UpdateDraw();
				}
			}

			if(evt.key == "2" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 3;
					docu.UpdateDraw();
				}
			}

			if(evt.key == "3" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 2;
					docu.UpdateDraw();
				}
			}

			if(evt.key == "4" && evt.ctrlKey){
				if(currCurveIndex != null && currLeverIndex != null){
					docu.curves[currCurveIndex].levers[currLeverIndex].leverMode = 0;
					docu.UpdateDraw();
				}
			}

			if(evt.key == "z" && evt.ctrlKey){
				console.log("zpr");
				// docu.zpr.Zoom(new Vector(0, 0), 1);
				docu.zpr.zoom = 1;
				docu.UpdateDraw();
			}

		};

		document.onkeyup = function(evt){


			if(evt.key == "Shift" && docu.status == Status.MovingAnchor){
				console.log("yey");
				docu.status = Status.Editing;
			}                      

			if(evt.keyCode == 16){
				isRelocatingAnchor = false;
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
			docu.UpdateDraw();
		}

		var saveButton = document.getElementById("save"),
			loadButton = document.getElementById("load"),
			nameInput  = document.getElementById("name");

		saveButton.onclick = function(){
			var prefix = document.getElementById("prefix").value;
			console.log(prefix);
			Save(docu, neutron, prefix + "_" + nameInput.value);
		}

		loadButton.onclick = function(){
			var prefix = document.getElementById("prefix").value;
			Load(docu, neutron, prefix + "_" + nameInput.value);
		}

		document.getElementById("init-eval").onclick = function(){
			docu.Eval(document.getElementById("init-code").value);
			docu.UpdateDraw();
		};

		document.getElementById("init-code").onchange = function(){
			docu.init = document.getElementById("init-code").value;
		}

		document.getElementById("update-code").onchange = function(){
			docu.update = document.getElementById("update-code").value;
		}
	}	
})();
