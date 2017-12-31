/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	__webpack_require__(1)

	var Vector   = __webpack_require__(5);
	var Document = __webpack_require__(6);
	var LoadData = __webpack_require__(14);

	var Draw = __webpack_require__(12);
	var Neutron = __webpack_require__(15);

	function ClearDOMChildren(elem){
		while (elem.firstChild) {
		    elem.removeChild(elem.firstChild);
		}
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
				
				var zoomInc = event.deltaY*0.00005;
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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../node_modules/css-loader/index.js!./styles.css", function() {
				var newContent = require("!!../node_modules/css-loader/index.js!./styles.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, "/* CSS */\nbody\n{\n\tfont-family: helvetica, sans-serif;\n\tfont-size: 85%;\n\tmargin: 10px 15px;\n\tcolor: #333;\n\tbackground-color: #ddd;\n}\n\nh1\n{\t\n\tfont-family: TheMixMono;\n\tfont-size: 2.6em;\n\tfont-weight: black;\n\tletter-spacing: -0.12em;\n\tmargin: 0 0 0.3em 0;\n}\n\nh2\n{\n\tfont-size: 1.4em;\n\tfont-weight: normal;\n\tmargin: 1.5em 0 0 0;\n}\n\n#img{\n\twidth:3em;\n}\n\ncanvas\n{\n\tclear:left;\n\tfloat:left;\n\tdisplay: inline;\n\twidth:  600px;\n\theight: 600px;\n\tmargin: 0 10px 10px 0;\n\tbackground-color: #fff;\n}\n\n#button_group{\n}\n\n#list{\n\tmargin: 10px;\n}\n\n#save_group{\n\t/*clear:left;*/\n}\n\n.char-link{\n\tmargin : 10px;\n}\n\n.code\n{\n\tdisplay: block;\n\twidth: 580px;\n\toutline: none;\n\tborder:none;\n    border-color: Transparent; \n    border-radius: 4px;\n    resize:none;\n\n\theight: 4em;\n\tfont-family: \"TheMixMono\", monospace;\n\tfont-size: 1em;\n\t/*padding: 2px 4px;*/\n\tmargin: 8px;\n\tcolor: #555;\n\tbackground-color: #eee;\n\tborder: 1px solid #999;\n\toverflow: auto;\n}\n\n#param-group{\n\tmargin : 10px;\n}\n\n#param-name{\n\tmargin-top: 3px;\n\twidth:74px;\n}\n\n.param-name-label{\n\t/*margin-right: 50px;*/\n\t/*float:left;*/\n\t/*margin-top: 50px;*/\n\tdisplay: inline-block;\n\twidth:80px;\n}", ""]);

	// exports


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	class Vector{

		constructor(x, y){
			this.x = x;
			this.y = y;
		}

		Copy(){
			return new Vector(this.x, this.y);
		}

		Dist(v){
			var dx = v.x - this.x;
			var dy = v.y - this.y;
			return Math.hypot(dx, dy);
		}

	    Dot(v){
	        return this.x*v.x + this.y*v.y;
	    }

		Mag(){
	        return Math.hypot(this.x, this.y);
		}

		static Dist(v1, v2){
			var dx = v2.x - v1.x;
			var dy = v2.y - v1.y;
			return Math.hypot(dx, dy);
		}

		Normalize() {
			var d = Math.hypot(this.x, this.y);
			return new Vector(this.x/d, this.y/d);
		}

		Sub(v){
			return new Vector(this.x - v.x, this.y - v.y);
		}

	    Subl(v){
	        this.x -= v.x;
	        this.y -= v.y;
	    }

		Add(v){
			return new Vector(this.x + v.x, this.y + v.y);
		}

	    Addl(v){
	        this.x += v.x;
	        this.y += v.y;
	    }

		Mult(s){
			return new Vector(this.x * s, this.y * s);
		}

	    Multl(s){
	        this.x *= s;
	        this.y *= s;
	    }

		Set(x, y){
			if(typeof y !== "undefined"){
				this.x = x;
				this.y = y;
			} else {
				this.x = x.x;
				this.y = x.y;
			}
		}

		get Zero(){
			return new Vector(0, 0);
		}

	}

	module.exports = Vector;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	
	var Vector =  __webpack_require__(5);
	var Lever =   __webpack_require__(7);
	var Curve =   __webpack_require__(8);
	var Outline = __webpack_require__(9);

	var Cast =   __webpack_require__(11);
	var Draw =   __webpack_require__(12);
	var ZPR =    __webpack_require__(13);


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
			EditingLever : 4
		});

	class Document{
		constructor(canvas){
			this.canvas = canvas;
			this.curves = [];

			this.params = {};
			this.init = "";
			this.update = "";

			this.status = Status.Editing;
			this.isTranslatingLever = false;
			this.isEditingLever = false;

			this.currCurveIndex = null,
			this.currLeverIndex = null,
			this.currPoint = null;

			this.zpr = new ZPR();
		}

		CurrCurve(){
			return this.curves[this.currCurveIndex];
		}

		CurrLever(){
			return this.curves[this.currCurveIndex].levers[this.currLeverIndex];
		}

		AddCurve(curve){
			this.currCurveIndex = this.curves.push(curve) - 1;
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
			var curve = this.curves[ith];

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
			for (const [ith, curve] of this.curves.entries()){
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
					this.CurrLever().TransFromArray(transArray, curr.Sub(orig));
		            this.CurrCurve().UpdateOutlines();
		            break;
				case Status.EditingLever:
					console.log(this.currPoint);
					this.CurrCurve().UpdateLever(this.currLeverIndex, this.currPoint, curr);
					break;

			}
		}

		FinishEdit(){
			if(this.status != Status.Editing && this.status != Status.Creating){
				this.status = Status.Editing;
			}
		}

		InitEval(){
			this.dstack = [];
			this.consts = {};
		}

		UpdateDraw(context){
			for(let curve of this.curves){
				curve.UpdateOutlines();
			}
			Draw.Curves(context, this);
		}

		Eval(expr){
			var text = expr.split('\n'),
				exec_hold_flag = false,
				exec_err_flag = false;

			var hold = function(){
				exec_hold_flag = true;
			}

			var unhold = function(){
				exec_hold_flag = false;
			}

			var pop = function(){
				return this.dstack.pop();
			}.bind(this);

			var push = function(elem){
				this.dstack.push(elem);
				// console.log(JSON.stringify(dstack));
			}.bind(this);

			var refer = function(){
				var name = pop();
				var xhr = new XMLHttpRequest();
				xhr.open('GET', 'load/'+name);
				xhr.onload = function() {
					if (xhr.status === 200) {
						var res = JSON.parse(xhr.responseText);
						push(LoadData.Curves(res.curves));

					}
					else {
						console.log('Request failed.  Returned status of ' + xhr.status);
						exec_err_flag = true;
					}
				};
				xhr.send();
			};

			var put = function(){
				var key = pop();
				var val = pop();
				this.consts[key] = val.Copy();
			}.bind(this);

			var get = function(){
				var key = pop();
				var res = this.consts[key];
				if(res == undefined){
					console.log('key "'+ key +'" not found');
					exec_err_flag = true;
				} else
					push(res);
			}.bind(this);

			var vec = function(){
				var x = pop();
				var y = pop();
				push(new Vector(parseFloat(x), parseFloat(y)));
			}

			var set = function(){
				var first = pop();
				var second;
				if(first == "c" || first == "curve"){
					second = parseInt(pop());
					this.curves[second] = pop();
				} else if (first == "l" || first == "lever") {
					second = parseInt(pop());
					var third = pop();
					if(third == "c" || third == "curve"){
						var fourth = parseInt(pop());
						console.log(fourth);
						var fifth = pop();
						console.log(JSON.stringify(fifth));
						this.curves[fourth].levers[second] = fifth;
					}
				} else if (first == "p") {
					second = parseInt(pop());
					var third = pop();
					if(third == "l" || third == "curve"){
						var fourth = parseInt(pop());
						console.log(fourth);
						var fifth = pop();
						if(fifth == "c" || fifth == "curve"){
							var sixth = parseInt(pop());
							this.curves[sixth].levers[fourth].SetControlPoint(second, pop());
						}
					}
				}
			}.bind(this);

			var plus = function(){
				var p1 = pop();
				var p2 = pop();

				push(p1.Add(p2));
			}

			var mult = function(){
				var p = pop();
				var n  = pop();
				if(typeof p == "number" && typeof n == "number")
					push(n * p);
				else if(typeof p == "object" && typeof p.x == "number" && typeof n == "number")
					push(p.Mult(n));
				else{
					console.log("mult type error");
					exec_err_flag = true;
				}
			}

			var trans = function(){
				var elem = pop(),
					increm = pop();
				push(elem.TransCreate(increm));
			}

			var drag = function(){
				var elem = pop(),
					newPoint = pop(),
					ith = parseInt(pop());
				elem.SetControlPoint(ith, newPoint);
			}

			var curve = function(){
				var ith = parseInt(pop());
				push(this.curves[ith]);
			}.bind(this);

			var lever = function(){
				var ith = parseInt(pop());
				var elem = pop();
				if(elem.levers != undefined)
					push(elem.levers[ith]);
				else{
					console.log("lever needs a curve ref ahead");
					exec_err_flag = true;
				}
			}

			var point = function(){
				var ith = parseInt(pop());
				var elem = pop();
				if(elem.points != undefined)
					push(elem.points[ith]);
				else{
					console.log("point needs a lever ref ahead");
					exec_err_flag = true;
				}
			}

			var param = function(){
				var name = pop();
				var byName = this.params[name]
				if(byName != undefined){
					push(parseFloat(byName.value));
				} else {
					console.log("param name "+name+" not found");
					exec_err_flag = true;
				}
			}.bind(this);

			var curr;
			var stack;

			for (var i = 0; i < text.length; i++) {
				stack = text[i].split(" ");
				while(true){
					curr = stack.pop();
					if(exec_hold_flag && curr != "unhold"){
						push(curr);
					} else {
						switch(curr){
							case "hold"	 : hold();	 break;
							case "unhold": unhold();   break;
							case "set"   : set();	  break;
							case "vec"   : vec();	  break;
							case "get"   : get();	   break;
							case "put"   : put();	  break;
							case "c":
							case "curve" : curve();	break;
							case "l":
							case "lever" : lever();	break;
							case "p":
							case "point" : point();	break;
							case "plus"  : plus();	 break;
							case "mult"  : mult();	 break;
							case "trans" : trans();	break;
							case "drag"  : drag();	 break;
							case "param" : param();	break;
							default	  : push(curr);
						}
					}
					if(stack.length == 0) break;
					if(exec_err_flag) {
						console.log("at "+curr);
						break;
					}
					// console.log(JSON.stringify(this.consts));
				}
				if(exec_err_flag){
					console.log("error raised, further Eval stopped");
					break;
				}
			}
		}
	}

	module.exports = Document;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	var Vector = __webpack_require__(5);

	var LeverMode = Object.freeze({
	    BROKEN		: 0,
	    LINEAR 		: 2,
	    PROPER 		: 3,
	    SYMMETRIC	: 4
	});

	var StrokeMode = Object.freeze({
	    FREE : 0,
	    PERP : 1
	})

	var SelectMode = Object.freeze({
		NONE 		 : 0,
		LEVER_SELECT : 1
	});

	var LeverPoint = Object.freeze({
		POINT 		 : 2,
		CONTROL_1	 : 0,
		CONTROL_2 	 : 4,
		WIDTH_1 	 : 1,
		WIDTH_2	 	 : 3
	});

	class Lever {

		constructor(points){

			if(typeof points == "Array") {
				this.points = points;
			}
			if(typeof points == "object") {
				this.points = [
					points.Copy(),
					points.Copy(),
					points.Copy(),
					points.Copy(),
					points.Copy()
				]
			}
			if(typeof points == "undefined") {
				this.points = [
					Vector.Zero,
					Vector.Zero,
					Vector.Zero,
					Vector.Zero,
					Vector.Zero
				]
			}

			this.leverMode = LeverMode.SYMMETRIC;
			this.selectMode = SelectMode.NONE;
	        this.strokeMode = StrokeMode.FREE;
		}

	    Copy(){
	        var newLever = new Lever();
	        for (var i = newLever.points.length - 1; i >= 0; i--) {
	            newLever.points[i] = this.points[i].Copy();
	        }
	        newLever.leverMode = this.leverMode;
	        newLever.selectMode = this.selectMode;
	        newLever.strokeMode = this.strokeMode;

	        return newLever;
	    }

	    OppoOf(ith){
	    	return 4 - ith;
	    }

	    Ratio(ith) {
	    	var ithSide  = this.points[2].Dist(this.points[ith]),
	    		oppoSide = this.points[2].Dist(this.points[this.OppoOf(ith)]);
	        return ithSide / oppoSide;
	    }

	    OppoNorm(newPoint) {
	        return (this.points[2].Sub(newPoint)).Normalize();
	    }

	    SetOppo(ith, oppoNorm, newDistance) {
	        this.points[this.OppoOf(ith)] = this.points[2].Add(oppoNorm.Mult(newDistance));
	    }

	    SetControlPoint(ith, newPoint) {
	    	var ratioOppo = this.Ratio(this.OppoOf(ith));
	    	var oppoNorm  = this.OppoNorm(newPoint);

	    	var dist;
	    	switch(this.leverMode){

	            /// for symmetric case, ratio is overwritten as 1
	    		case LeverMode.SYMMETRIC:
	    			ratioOppo = 1;

	            /// recalculate to make proportional lever, the distance
	            /// is calculated from the new distance between origin
	            /// and currently selected control point.
		        case LeverMode.PROPER:
		            this.SetOppo(ith, oppoNorm, ratioOppo * this.points[2].Dist(newPoint));

	            /// recalculate to make three points aligned on same
	            /// line. use new direction and original distance of
	            /// opposite control point.
		        case LeverMode.LINEAR:
		            this.SetOppo(ith, oppoNorm, this.points[2].Dist(this.points[this.OppoOf(ith)]));

	            /// set new control point without affecting the oppo-
	            /// site. The tangent will be broken.
	     	   case LeverMode.BROKEN:
		            this.points[ith].Set(newPoint);

	    	}
	    }

	    // ExtractArray and TransFromArray should be appear in Dragging handler,
	    // to implement the real time update during dragging. When dragging around,
	    // the lever should be always translated from same array (or point group)
	    // until mouseup.

	    ExtractArray(){
	    	return [this.points[0].Copy(),
	    			this.points[1].Copy(),
	    			this.points[2].Copy(),
	    			this.points[3].Copy(),
	    			this.points[4].Copy()];
	    }

	    TransFromArray(points, inc){
	    	this.points[0] = inc.Add(points[0]);
	    	this.points[1] = inc.Add(points[1]);
	    	this.points[2] = inc.Add(points[2]);
	    	this.points[3] = inc.Add(points[3]);
	    	this.points[4] = inc.Add(points[4]);
	    }

	    Trans(inc){
	    	var array = this.ExtractArray();
	    	this.TransFromArray(array, inc);
	    }

	    TransCreate(inc){
	        console.log(JSON.stringify(inc));
	        var lever = this.Copy();
	        lever.Trans(inc);
	        return lever;
	    }
	}

	module.exports = Lever;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	
	var Outline = __webpack_require__(9);
	var Vector  = __webpack_require__(5);
	var Lever   = __webpack_require__(7);

	var CurveMath = __webpack_require__(10);

	class Curve {

	    constructor(orig){

		    this.levers = [];

		    this.orig = orig; 

		    this.lo = new Outline(1);
		    this.ro = new Outline(3);

	    }

	    Add(mouseV){
	        this.levers.push(new Lever(mouseV));
	        this.GetOutlines();
	        return this.levers.length - 1;
	    }

	    Delete(index){
	        levers.splice(index, 1);
	        this.GetOutlines();
	    }
	    
	    Insert(curveCast) {
	        this.levers.splice(Math.floor(curveCast+1), 0, new Lever(new Vector(0, 0)));
	        CurveMath.SetInsertedLeverOnCurveGroup(this.levers, Math.floor(curveCast+1), curveCast - Math.floor(curveCast));
	        console.log(this.levers.length);

	        this.GetOutlines();
	        
	        return Math.floor(curveCast+1);
	    }

	    UpdateLever(ithLever, ithPoint, value){
	        this.levers[ithLever].SetControlPoint(ithPoint, value);
	        this.UpdateOutlines();
	    }

	    GetOutlines(){
	        this.lo.GetPointFromLevers(this.levers);
	        this.ro.GetPointFromLevers(this.levers);
	    }

	    UpdateOutlines(){
	        this.lo.SetPointFromLevers(this.levers);
	        this.ro.SetPointFromLevers(this.levers);
	    }


	    ExtractArray(){
	    	var res = [];
	        for(var lever of this.levers) res.push(lever.ExtractArray());
	        return res;
	    }

	    TransFromArray(array, increment) {
	    	// console.log(array);
	        for (var i = 0; i < this.levers.length; i++) {
	            this.levers[i].TransFromArray(array[i], increment);
	        }
	        this.UpdateOutlines();
	    }
	}

	module.exports = Curve;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	var Vector = __webpack_require__(5);
	var Lever =  __webpack_require__(7);
	var CurveMath = __webpack_require__(10);

	var CurveSide = Object.freeze({
	    LEFT :  1,
	    RIGHT : 3
	});

	class Outline{

		constructor(side){
			this.points = [];
			this.side = side;
		}

	    /// this should be called immediately after a new curve is formed.
	    GetPointFromLevers(levers){

	        this.points = [];
	        for (var i = 0; i < levers.length * 3 - 2; i ++){
	            this.points.push(new Vector(0, 0));
	        }
	        this.SetPointFromLevers(levers);
	    }

		GetIdenticalCurve(p1, p2){
	        return CurveMath.GetIdenticalCurve(p1.points[this.side], p2.points[this.side], p1, p2);
	    }

	    /// update with every redraw.
	    SetPointFromLevers(levers){
	        if(this.points != null){
	            for(var i = 0; i < levers.length; i++){

	                this.points[3*i].Set(levers[i].points[this.side]);

	                if(i < levers.length - 1){
	                    var aux = this.GetIdenticalCurve(levers[i], levers[i+1]);
	                    this.points[3 * i + 1].Set(aux[0]);
	                    this.points[3 * i + 2].Set(aux[1]);
	                }
	            }
	        }
	    }
	}

	module.exports = Outline;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	var Vector = __webpack_require__(5);

	class CurveMath{

	    static GetPointOnCurve(t, points){
	        return   points[0].Mult((1-t)  *(1-t)*(1-t))
	        	.Add(points[1].Mult(3*(1-t)*(1-t)*(t)  ))
	        	.Add(points[2].Mult(3*(t)  *(t)  *(1-t)))
	            .Add(points[3].Mult((t)    *(t)  *(t)  ));
	    }
	  
	    static GetPointOnCurveBetweenLever(t, l0, l1) {
	    	return this.GetPointOnCurve(t, [l0.points[2], l0.points[4], l1.points[0], l1.points[2]]);
	    }

	    static SetInsertedLever(
	        p0p,
	        p0cp2,
	        p1cp1,
	        p1p,
	        p1cp2,
	        p2cp1,
	        p2p, t
	    ){

	        var P0 = p0p;
	        var P1 = p0cp2;
	        var P2 = p2cp1;
	        var P3 = p2p;

	        var P0_1       = P0.Mult(1-t).Add(P1.Mult(t));
	        var P1_2       = P1.Mult(1-t).Add(P2.Mult(t));
	        var P2_3       = P2.Mult(1-t).Add(P3.Mult(t));
	        var P01_12     = P0_1.Mult(1-t).Add(P1_2.Mult(t));
	        var P12_23     = P1_2.Mult(1-t).Add(P2_3.Mult(t));
	        var P0112_1223 = P01_12.Mult(1-t).Add(P12_23.Mult(t));

	        p0cp2.Set(P0_1);
	        p1cp1.Set(P01_12);
	        p1p.Set(P0112_1223);
	        p1cp2.Set(P12_23);
	        p2cp1.Set(P2_3);

	        // return [p0p, p0cp2, p1cp1, p1p, p1cp2, p2cp1, p2p];

	    }

	    static SetInsertedLeverOnCurve(p0, p1, p2, t){
	      
	        var strokePointsLeft	= [];
	        var strokePointsRight	= [];
	        
	        var res = this.GetIdenticalCurve(p0.points[1], p2.points[1], p0, p2);
	        strokePointsLeft.push(p0.points[1]);
	        strokePointsLeft.push(res[0].Copy());
	        strokePointsLeft.push(res[1].Copy());
	        strokePointsLeft.push(p2.points[1]);
	      
	        res = this.GetIdenticalCurve(p0.points[3], p2.points[3], p0, p2);
	        strokePointsRight.push(p0.points[3]);
	        strokePointsRight.push(res[0].Copy());
	        strokePointsRight.push(res[1].Copy());
			strokePointsRight.push(p2.points[3]);
	        
	        p1.points[1] = this.GetPointOnCurve(t, strokePointsLeft);
	        p1.points[3] = this.GetPointOnCurve(t, strokePointsRight);

	        this.SetInsertedLever(
	            p0.points[2],
	            p0.points[4],
	            p1.points[0],
	            p1.points[2],
	            p1.points[4],
	            p2.points[0],
	            p2.points[2], t);
	    }

	    static SetInsertedLeverOnCurveGroup(levers, ithNode, t){
	        this.SetInsertedLeverOnCurve(
	            levers[ithNode == 0 ? 0 : ithNode - 1],
	            levers[ithNode],
	            levers[(ithNode == levers.length - 1 ? ithNode : ithNode + 1)],
	            t);
	        // console.log(JSON.stringify([levers[ithNode == 0 ? 0 : ithNode - 1], levers[ithNode], levers[(ithNode == levers.length - 1 ? ithNode : ithNode + 1)]], null, '\t'));
	    }

	    static GetClosestTFromGivenPoint(p0, p1, givenPoint, iter, slices) {

	        var start = 0;
	        var end   = 1;

	        var curr_d = 0,
	        	best_t = 0,
	        	best_d = Infinity,
	        	curr_P = new Vector(0, 0);

	        for (var i = 0; i < iter; i++) {
	            var tick = 0.1 * (end - start) / slices;

	            for (var t = start; t <= end; t += tick) {
	                
	                curr_d = this.GetPointOnCurveBetweenLever(t, p0, p1).Dist(givenPoint);
	                if (curr_d < best_d) {
	                    best_d = curr_d;
	                    best_t = t;
	                }
	            }

	            start = Math.max(best_t - tick, 0);
	            end   = Math.min(best_t + tick, 1);
	        }

	        return (start + end)/2;
	    }

	    static GetIdenticalCurve(p0, p1, b0, b1){
	        var c0 = b0.points[2].Add(b1.points[0]).Sub(b0.points[4].Mult(2));
	        var c1 = b1.points[2].Add(b0.points[4]).Sub(b1.points[0].Mult(2));

	        var sign0 = Math.sign(p0.Sub(b0.points[2]).Dot(c0));
	        var sign1 = Math.sign(p1.Sub(b1.points[2]).Dot(c1));

	        var distc0 = c0.Mag();
	        var distc1 = c1.Mag();

	        var distA = b0.points[4].Sub(b0.points[2]).Mult(Math.max(0.001, 1 - 0.001* sign0 * distc0));
	        var distD = b1.points[0].Sub(b1.points[2]).Mult(Math.max(0.001, 1 - 0.001* sign1 * distc1));
	        var a0a1 = p0.Add(distA);
	        var d0d1 = p1.Add(distD);

	        return [a0a1, d0d1];
	    }
	}

	module.exports = CurveMath;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	
	var CurveMath = __webpack_require__(10);

	class Cast{
	    
	    static CurveRect(curve, mouseV){
	        return curve.bounding[0].x < mouseV.x && curve.bounding[1].x > mouseV.x &&
	               curve.bounding[0].y < mouseV.y && curve.bounding[1].y > mouseV.y;
	    }
	    
	    static CurveBody(curve, mouseV) {
	        
	    	var CAST_DIST = 9;

	        var t, p, dist;
	        console.log(JSON.stringify(curve));
	        for (var i = 0; i < curve.levers.length - 1; i++) {

	            t = CurveMath.GetClosestTFromGivenPoint(curve.levers[i], curve.levers[i+1], mouseV, 6, 4);
	            p = CurveMath.GetPointOnCurveBetweenLever(t, curve.levers[i], curve.levers[i+1]);
	            dist = p.Dist(mouseV);
	            if (dist < CAST_DIST)
	                return i + t;
	        }
	        return -1;
	    } 

	    static Curve(curve, mouseV){
	    	// console.log(curve.bounding);
	        // if(this.CurveRect(curve, mouseV)){
	            return this.CurveBody(curve, mouseV);
	        // }
	        // else
	        //     return -1;
	    }

	    static CurveIthLever(curve, mouseV) {

	    	var CAST_DIST = 9;

	        var i = 0,
	        	found = false;

	        for (; i < curve.levers.length; i ++) {
	        	found = PVector.dist(curve.levers[i].points[2], mouseV) < CAST_DIST;
	        	if(found) break;	
	        } 

	        if(!found) i = -1;

	        return i;
	    }

	    static Lever(lever, mouseV){

			var CAST_DIST = 9;    
	        var castSequence = [0, 4, 1, 3, 2];
	        
	        var res = -1;
	        for(var ith = 0; ith < 5; ith++)
	            if(lever.points[castSequence[ith]].Dist(mouseV) < CAST_DIST){
	            	console.log(ith + " " + castSequence[ith]);
	                res = castSequence[ith];
	                break;
	            }
	        return res;
	    }
	}

	module.exports = Cast;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var ZPR = __webpack_require__(13);
	var Vector = __webpack_require__(5);

	class Draw{

	    static CurvesFill(ctx, curves, currCurveIndex){

	        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

	        for (var ithCurve = curves.length - 1; ithCurve >= 0; ithCurve--) {
	            var curve = curves[ithCurve];

	            ctx.lineWidth = 1;

	            ctx.beginPath();
	            ctx.moveTo(curve.lo.points[0].x, curve.lo.points[0].y);
	            for(var i = 1; i < curve.levers.length; i++){

	                ctx.lineTo(curve.lo.points[3*i-2].x,   curve.lo.points[3*i-2].y);
	                ctx.moveTo(curve.lo.points[3*i-1].x,   curve.lo.points[3*i-1].y);
	                ctx.lineTo(curve.lo.points[3*i+0].x,   curve.lo.points[3*i-0].y);
	                ctx.moveTo(curve.lo.points[3*(i-1)].x, curve.lo.points[3*(i-1)].y);

	                ctx.bezierCurveTo(
	                    curve.lo.points[3*i-2].x, curve.lo.points[3*i-2].y,
	                    curve.lo.points[3*i-1].x, curve.lo.points[3*i-1].y,
	                    curve.lo.points[3*i+0].x, curve.lo.points[3*i-0].y
	                )
	            }
	            ctx.lineTo(curve.ro.points[curve.ro.points.length-1].x, curve.ro.points[curve.ro.points.length-1].y);
	            for(var i = curve.levers.length-1; i >0; i--){

	                ctx.lineTo(curve.ro.points[3*i-1].x,   curve.ro.points[3*i-1].y);
	                ctx.moveTo(curve.ro.points[3*i-2].x,   curve.ro.points[3*i-2].y);
	                ctx.lineTo(curve.ro.points[3*(i-1)].x,   curve.ro.points[3*(i-1)].y);
	                ctx.moveTo(curve.ro.points[3*i].x,     curve.ro.points[3*i].y);

	                ctx.bezierCurveTo(
	                    curve.ro.points[3*i-1].x, curve.ro.points[3*i-1].y,
	                    curve.ro.points[3*i-2].x, curve.ro.points[3*i-2].y,
	                    curve.ro.points[3*(i-1)].x, curve.ro.points[3*(i-1)].y
	                )
	            }
	            // ctx.lineTo(curve.lo.points[0].x, curve.lo.points[0].y);
	            // ctx.closePath();
	            ctx.stroke();
	        };

	    }

	    static Curves(ctx, docu){

	        var curves = docu.curves,
	            currCurveIndex = docu.currCurveIndex,
	            currLeverIndex = docu.currLeverIndex ,
	            zpr = docu.zpr;

	        ctx.lineWidth = 1;
	        ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

	        ctx.font = "16px TheMixMono";

	        ctx.strokeStyle = "#CCCCCC";
	        ctx.beginPath();
	        for(let i=0; i<50; i++){
	            var y1 = zpr.Transform(new Vector(i*30-300, -300)),
	                y2 = zpr.Transform(new Vector(i*30-300, 1500)),
	                x1 = zpr.Transform(new Vector(-300, i*30-300)),
	                x2 = zpr.Transform(new Vector(1500, i*30-300));
	            ctx.moveTo(y1.x, y1.y);
	            ctx.lineTo(y2.x, y2.y);
	            ctx.moveTo(x1.x, x1.y);
	            ctx.lineTo(x2.x, x2.y);
	        }
	        ctx.stroke();

	        ctx.strokeStyle = "#000000";
	        var status;
	        switch(docu.status){
	            case 0: ctx.fillText('Editing', 10, 25); break; 
	            case 1: ctx.fillText('Creating', 10, 25); break; 
	            case 2: ctx.fillText('MovingCurve', 10, 25); break; 
	            case 3: ctx.fillText('MovingLever', 10, 25); break; 
	            case 4: ctx.fillText('EditingLever', 10, 25); break;
	        }

	        ctx.fillText(docu.zpr.zoom, 10, 45);

	        var zpr_curves = docu.curves.map(function(curve){
	            
	            return { levers: curve.levers.map(function(lever){
	                        return {
	                            points: lever.points.map(function(point){ return zpr.Transform(point);}),
	                            leverMode : lever.leverMode
	                        }
	                    }),
	                lo_points : curve.lo.points.map(function(point){return zpr.Transform(point)}),
	                ro_points : curve.ro.points.map(function(point){return zpr.Transform(point)})
	            }

	        });

	        if(currCurveIndex != null){
	            var levers = zpr_curves[currCurveIndex].levers;

	            for (var i = 0; i < levers.length; i++) {

	                if(i == currLeverIndex){
	                    for(var j = 0; j < 5; j++){

	                        ctx.beginPath();
	                        ctx.arc(levers[i].points[j].x, levers[i].points[j].y, 4, 0, 2 * Math.PI);
	                        ctx.stroke();
	                    }

	                    ctx.beginPath();
	                    // for (var i = 0; i < levers.length; i++) {
	                        ctx.moveTo(levers[i].points[0].x, levers[i].points[0].y);
	                        ctx.lineTo(levers[i].points[2].x, levers[i].points[2].y);
	                        ctx.lineTo(levers[i].points[4].x, levers[i].points[4].y);
	                        ctx.moveTo(levers[i].points[1].x, levers[i].points[1].y);
	                        ctx.lineTo(levers[i].points[2].x, levers[i].points[2].y);
	                        ctx.lineTo(levers[i].points[3].x, levers[i].points[3].y);
	                    // }
	                    ctx.stroke();

	                    var s;
	                    switch(levers[i].leverMode){
	                        case 0: s = "broken"; break;
	                        case 2: s = "linear"; break;
	                        case 3: s = "proper"; break;
	                        case 4: s = "symmetric"; break;
	                    }

	                    ctx.fillText(s, levers[i].points[4].x + 10, levers[i].points[4].y + 5);

	                } else {
	                    ctx.beginPath();
	                    ctx.arc(levers[i].points[2].x, levers[i].points[2].y, 4, 0, 2 * Math.PI);
	                    ctx.stroke();
	                }
	            }
	        }

	        ctx.font = "20px TheMixMono";
	        for (var ith = zpr_curves.length - 1; ith >= 0; ith--) {
	            ctx.lineWidth = 1;
	            if(zpr_curves[ith].levers.length > 1){


	                ctx.beginPath();
	                ctx.moveTo(zpr_curves[ith].lo_points[0].x, zpr_curves[ith].lo_points[0].y);
	                for (var i = 1; i < zpr_curves[ith].levers.length; i++) {
	                    ctx.bezierCurveTo(
	                        zpr_curves[ith].lo_points[3*i-2].x, zpr_curves[ith].lo_points[3*i-2].y,
	                        zpr_curves[ith].lo_points[3*i-1].x, zpr_curves[ith].lo_points[3*i-1].y,
	                        zpr_curves[ith].lo_points[3*i+0].x, zpr_curves[ith].lo_points[3*i-0].y
	                    )
	                }
	                ctx.stroke();
	                ctx.beginPath();
	                ctx.moveTo(zpr_curves[ith].ro_points[0].x, zpr_curves[ith].ro_points[0].y);
	                for (var i = 1; i < zpr_curves[ith].levers.length; i++) {
	                    ctx.bezierCurveTo(
	                        zpr_curves[ith].ro_points[3*i-2].x, zpr_curves[ith].ro_points[3*i-2].y,
	                        zpr_curves[ith].ro_points[3*i-1].x, zpr_curves[ith].ro_points[3*i-1].y,
	                        zpr_curves[ith].ro_points[3*i+0].x, zpr_curves[ith].ro_points[3*i-0].y
	                    )
	                }
	                ctx.stroke();

	                ctx.lineWidth = 2;

	                var first = zpr_curves[ith].levers[0].points[2],
	                    sec   = zpr_curves[ith].levers[0].points[1],
	                    diam  = sec.Sub(first).Normalize().Mult(20);
	                ctx.fillText("C"+ith, first.x + diam.y - 10, first.y -diam.x - 10);

	                for (var i = 0; i < zpr_curves[ith].levers.length; i++) {
	                    var point = zpr_curves[ith].levers[i].points[2];
	                    ctx.fillText(i, point.x+10, point.y-10);
	                }

	                ctx.beginPath();
	                ctx.moveTo(zpr_curves[ith].levers[0].points[2].x, zpr_curves[ith].levers[0].points[2].y);
	                for (var i = 0; i < zpr_curves[ith].levers.length - 1; i++) {
	                    ctx.bezierCurveTo(
	                        zpr_curves[ith].levers[i].points[4].x,   zpr_curves[ith].levers[i].points[4].y,
	                        zpr_curves[ith].levers[i+1].points[0].x, zpr_curves[ith].levers[i+1].points[0].y,
	                        zpr_curves[ith].levers[i+1].points[2].x, zpr_curves[ith].levers[i+1].points[2].y
	                    )
	                }
	                ctx.stroke();

	            }

	        }
	    }
	}

	module.exports = Draw;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	var Vector = __webpack_require__(5);

	/**
	 * Zoom, Pan and Rotate
	 */
	class ZPR {
		
		constructor(){
			this.zoom = 1;
			this.pan = new Vector(0, 0);
		}

		/**
		 * for transforming model to screen point
		 * @param {[type]} vec [description]
		 */
		Transform(vec){
			return vec.Sub(this.pan).Mult(this.zoom).Add(this.pan);
		}

		/**
		 * for transforming screen point to model
		 * @param {[type]} vec [description]
		 */
		InvTransform(vec){
			return vec.Sub(this.pan).Mult(1/this.zoom).Add(this.pan);
		}

		/**
		 * for doing zpr operation with mouse event
		 * @param  {[type]} mouseScreenVec [description]
		 * @return {[type]}                [description]
		 */
		Zoom(mouseScreenVec, zoomInc){
			var newZoom = (this.zoom >= 3 && zoomInc > 0) ? 1 : (this.zoom <= 0.6 && zoomInc < 0) ? 1 : 1 + zoomInc;
			this.zoom *= newZoom;
			this.pan = mouseScreenVec.Mult(newZoom);
		}

		Save(){
			this.hist = this.pan.Copy();
		}
	}

	module.exports = ZPR;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	
	var Vector = __webpack_require__(5);
	var Lever =  __webpack_require__(7);
	var Curve =  __webpack_require__(8);
	var Outline = __webpack_require__(9);

	class LoadData {
		static Curves(curves){
			return curves.map(function(x){return this.Curve(x)}.bind(this));
		}

		static Curve(curve){
			var curveRes = new Curve();
			// console.log(curve);
			curveRes.lo = this.Outline(curve.lo);
			curveRes.ro = this.Outline(curve.ro);
			curveRes.levers = curve.levers.map(function(x){return this.Lever(x)}.bind(this));
			curveRes.orig = this.Point(curve.orig);
			return curveRes;
		}

		static Lever(lever){
			var leverRes = new Lever();
			leverRes.leverMode = lever.leverMode;
			leverRes.points = lever.points.map(function(x){return this.Point(x)}.bind(this));
			return leverRes;
		}

		static Outline(outline){
			var outlineRes = new Outline();
			outlineRes.side = outline.side;
			outlineRes.points = outline.points.map(function(x){return this.Point(x)}.bind(this));
			return outlineRes;
		}

		static Point(point){
			return new Vector(point.x, point.y);
		}
	}

	module.exports = LoadData;

/***/ }),
/* 15 */
/***/ (function(module, exports) {

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

/***/ })
/******/ ]);