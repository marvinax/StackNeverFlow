
var Document = require('./model/Document.js');

class Neutron {
	constructor(editor){
		this.editor = editor;
		this.param_ui = document.getElementById("param-group");

		this.AddParamUI();
		this.LoadLink();

		document.getElementById("save").onclick = this.Save.bind(this);
		document.getElementById("init-eval").onclick = function(){
			this.editor.docu.EvalInit()
		}.bind(this);
		// document.getElementById("init-code").onchange = 
	}

	ClearDOMChildren(elem){
		while (elem.firstChild) {
		    elem.removeChild(elem.firstChild);
		}
	}


	Save(){
		var xhr = new XMLHttpRequest();
		xhr.open('PUT', 'save/');
		xhr.setRequestHeader('Content-Type', 'application/json');
		console.log(this.editor.docu);
		this.editor.docu.ClearEval();
		xhr.onload = function(){
			if(xhr.status == 200) {
		        var res = JSON.parse(xhr.responseText);
				this.LoadLink();				
			}
		}.bind(this);

		var docu_id = document.getElementById("prefix").value + "_" + document.getElementById("name").value;
		xhr.send(JSON.stringify({id: docu_id, data:this.editor.docu}));
	}

	Load(docu_id){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'load/'+docu_id);
		xhr.onload = function() {
		    if (xhr.status === 200) {
		        var res = JSON.parse(xhr.responseText);
		    	console.log(res);
		        this.editor.docu = new Document(res);
		        
		        this.ReloadExistingParams();
		        document.getElementById("init-code").value = this.editor.docu.init;
		        document.getElementById("update-code").value = this.editor.docu.update;
		        this.editor.docu.InitEval();
		        this.editor.docu.EvalInit();
		        this.editor.docu.EvalUpdate();
		        this.editor.UpdateDraw("loaded");
		    }
		    else {
		        alert('Request failed.  Returned status of ' + xhr.status);
		    }
		}.bind(this);
		xhr.send();
	}

	LoadLink(){

		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'load_name/');
		xhr.onload = function() {
		    if (xhr.status === 200) {
		    	console.log(xhr.responseText);
		        var res = JSON.parse(xhr.responseText);
		    	console.log(res);
		    
				this.ClearDOMChildren(document.getElementById("list"));

		    	for (let docu_id of res.res){
		    		let a = document.createElement('a');
		    		a.innerHTML = docu_id.split("_").pop();
		    		a.class = "char-link";
		    		a.onclick = function(){
		    			this.Load(docu_id);
		    			document.getElementById("prefix").value = docu_id.split("_")[0];
		    			document.getElementById("name").value = docu_id.split("_")[1];
		    		}.bind(this);
		    		list.appendChild(a);
		    		list.appendChild(document.createTextNode(" "));
		    	}

		    }
		    else {
		        alert('Request failed.  Returned status of ' + xhr.status);
		    }
		}.bind(this);
		xhr.send();
	}

	ClearParams(){
		while (this.param_ui.firstChild) {
		    this.param_ui.removeChild(this.param_ui.firstChild);
		}
	}

	AddExistingParam(param){

		var paramElem = document.createElement("div");
		paramElem.className = "param-group";
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
	        this.editor.docu.EvalUpdate();
	        this.editor.UpdateDraw();
		}.bind(this);

		valueSlider.onchange = valueSlider.oninput = function(){
			param.value = valueInput.value = valueSlider.value;
	        this.editor.docu.EvalUpdate();
	        this.editor.UpdateDraw();
		}.bind(this);

		var deleteButton = document.createElement('button');
		deleteButton.innerHTML = "delete";

		deleteButton.onclick = function(){
			var elem = document.getElementById(paramElem.id);
			elem.parentNode.removeChild(elem);
			// console.log(this.editor.docu.params);
			delete this.editor.docu.params[param.name];
		}.bind(this);

		paramElem.appendChild(name);
	 	paramElem.appendChild(valueInput);
	 	paramElem.appendChild(valueSlider);
	 	paramElem.appendChild(deleteButton);

		this.param_ui.appendChild(paramElem);
	}

	ReloadExistingParams(){
		this.ClearParams();
		for(let param in this.editor.docu.params) {
			console.log(this.editor.docu.params[param]);
			this.AddExistingParam(this.editor.docu.params[param]);
		}
		this.AddParamUI();
	}

	AddParamUI(){

		var paramElem = document.createElement("div");

		var nameInput = document.createElement("input");
		nameInput.id = "param-name";
		nameInput.setAttribute("placeholder", "name");

		var defaultValueInput = document.createElement("input");
		defaultValueInput.id = "param-default-value";
		defaultValueInput.setAttribute("type", "number");
		defaultValueInput.setAttribute("placeholder", "default");

		var minInput = document.createElement("input");
		minInput.id = "param-min-value";
		minInput.setAttribute("type", "number");
		minInput.setAttribute("placeholder", "min");

		var maxInput = document.createElement("input");
		maxInput.id = "param-max-value";
		maxInput.setAttribute("type", "number");
		maxInput.setAttribute("placeholder", "max");

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
			this.editor.docu.params[param.name] = param;

			this.ReloadExistingParams();
		}.bind(this);

		paramElem.appendChild(nameInput);
		paramElem.appendChild(defaultValueInput);
		paramElem.appendChild(minInput);
		paramElem.appendChild(maxInput);
		paramElem.appendChild(saveButton);

		this.param_ui.appendChild(paramElem);
	}

	SetUI(param, id){
		var paramElem = document.getElementById(id);
		var children = paramElem.childNodes;
		children[0].value = param.name;
		children[1].value = param.value;
		children[2].value = param.min;
		children[3].value = param.max;
	}

	GetParam(param, id){
		var paramElem = document.getElementById(id);
		var children = paramElem.childNodes;
		children[0].value = param.name;
		children[1].value = param.value;
		children[2].value = param.min;
		children[3].value = param.max;
	}

}

module.exports = Neutron;