class Neutron {
	constructor(context, docu){
		this.context = context;
		this.docu = docu;
		this.param_ui = document.getElementById("param-group");
	}

	ClearParams(){
		while (this.param_ui.firstChild) {
		    this.param_ui.removeChild(this.param_ui.firstChild);
		}
	}

	AddExistingParam(param){

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

	        this.docu.Eval(this.docu.update);
	        this.docu.UpdateDraw(context);
		}.bind(this);

		valueSlider.onchange = valueSlider.oninput = function(){
			param.value = valueInput.value = valueSlider.value;

	        this.docu.Eval(this.docu.update);
	        this.docu.UpdateDraw(this.context);
		}.bind(this);

		var deleteButton = document.createElement('button');
		deleteButton.innerHTML = "delete";

		deleteButton.onclick = function(){
			var elem = document.getElementById(paramElem.id);
			elem.parentNode.removeChild(elem);
			console.log(this.docu.params);
			// delete this.params[param.name];
		}.bind(this);

		paramElem.appendChild(name);
	 	paramElem.appendChild(valueInput);
	 	paramElem.appendChild(valueSlider);
	 	paramElem.appendChild(deleteButton);

		this.param_ui.appendChild(paramElem);
	}

	ReloadExistingParams(){
		this.ClearParams();
		for(let param in this.docu.params) {
			console.log(this.docu.params[param]);
			this.AddExistingParam(this.docu.params[param]);
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
			this.docu.params[param.name] = param;

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