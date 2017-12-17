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

	var Vector = __webpack_require__(5);
	var Lever =  __webpack_require__(6);

	var Cast =  __webpack_require__(7);
	var Curve = __webpack_require__(9);

	var Document = __webpack_require__(11);

	(function(){

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

		function Save(docu, docu_id){
			var xhr = new XMLHttpRequest();
			xhr.open('PUT', 'save/');
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.onload = function() {
			    if (xhr.status === 200) {
			        var userInfo = JSON.parse(xhr.responseText);
			        console.log(userInfo);
			    }
			};

			console.log(docu.curves);

			xhr.send(JSON.stringify({id: docu_id, data:docu.curves}));
		}

		function Load(docu_id){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'load/'+docu_id);
			xhr.onload = function() {
			    if (xhr.status === 200) {
			    	console.log(xhr.responseText);
			        var res = JSON.parse(xhr.responseText);
			    	console.log(res);
			        docu.LoadCurves(res);
			    }
			    else {
			        alert('Request failed.  Returned status of ' + xhr.status);
			    }
			};
			xhr.send();
		}

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
				docu.DrawCurves(currCurveIndex);
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
					console.log(tempLeverTransArray);
					docu.curves[currCurveIndex].levers[currLeverIndex].TransFromArray(tempLeverTransArray, curr.Sub(orig));
	                docu.curves[currCurveIndex].UpdateBoundingRect();
	                docu.curves[currCurveIndex].UpdateOutlines();

				} else if (status == Status.EditingLever){
					console.log(currPoint);
					docu.curves[currCurveIndex].UpdateLever(currLeverIndex, currPoint, curr);
				}
				docu.DrawCurves(currCurveIndex);
			}
			
			if (down && (event.type == "mouseup")) {
				down = false;
				orig = null;
				if(status == Status.Creating){
					docu.curves[currCurveIndex].UpdateBoundingRect();
				} else if (status == Status.MovingCurve){
					status = Status.Editing;
				} else if (status == Status.MovingLever){
					status = Status.Editing;
				} else if (status == Status.EditingLever){
					console.log(docu.curves[currCurveIndex].lo);
					status = Status.Editing;
				}

				docu.DrawCurves(currCurveIndex);
			}

		}

		window.onload = function() {
			var cvs = document.getElementById("canvas");
			
			document.onkeydown = function(evt) {

				if(evt.keyCode == 27 && status == Status.Creating){
					document.getElementById("status").innerHTML = "Editing";
					status = Status.Editing;
					currCurveIndex = null;
				}

				if(evt.key == "c" && status == Status.Editing){
					document.getElementById("status").innerHTML = "Drawing new curve";
					status = Status.Creating;
	                currCurveIndex = null;
					console.log(status);
				}

	            if(evt.keyCode == 8){
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
	                docu.DrawCurves(currCurveIndex);
	            }

				if(evt.keyCode == 16){
					// status = Status.MovingLever;
					isTranslatingLever = true;
				}

				if(evt.keyCode == 18){
					isEditingLever = true;
				}

	            if(evt.key=="d"){
	                docu.DrawCurvesFill();
	            }
			};

			document.onkeyup = function(evt){
				if(evt.keyCode == 16){
					isTranslatingLever = false;
				}

				if(evt.keyCode == 18){
					console.log('leave editing lever');
					isEditingLever = false;
				}

	            if(evt.key=="d"){
	                docu.DrawCurves(currCurveIndex);
	            }
			}

			cvs.onmousedown = cvs.onmousemove = cvs.onmouseup = Drag;

			var saveButton = document.getElementById("save"),
				loadButton = document.getElementById("load"),
				nameInput  = document.getElementById("name");

			saveButton.onclick = function(){
				Save(docu, nameInput.value);
			}

			loadButton.onclick = function(){
				Load(nameInput.value);
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
	exports.push([module.id, "/* CSS */\nbody\n{\n\tfont-family: helvetica, sans-serif;\n\tfont-size: 85%;\n\tmargin: 10px 15px;\n\tcolor: #333;\n\tbackground-color: #ddd;\n}\n\nh1\n{\n\tfont-family: TheMixMono;\n\tfont-size: 2.6em;\n\tfont-weight: black;\n\tletter-spacing: -0.09em;\n\tmargin: 0 0 0.3em 0;\n}\nh1::first-letter{\n\tletter-spacing:-0.15em;\n}\n\nh2\n{\n\tfont-size: 1.4em;\n\tfont-weight: normal;\n\tmargin: 1.5em 0 0 0;\n}\n\n#img{\n\twidth:3em;\n\tfloat: left;\n}\n\ncanvas\n{\n\tdisplay: inline;\n\tfloat: left;\n\twidth:  600px;\n\theight: 600px;\n\tmargin: 0 10px 10px 0;\n\tbackground-color: #fff;\n}\n\n#code\n{\n\tdisplay: block;\n\twidth: 500px;\n\theight: 4em;\n\tfont-family: \"TheMixMono\", monospace;\n\tfont-size: 1em;\n\tpadding: 2px 4px;\n\tmargin: 0;\n\tcolor: #555;\n\tbackground-color: #eee;\n\tborder: 1px solid #999;\n\toverflow: auto;\n}", ""]);

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

	var Vector = __webpack_require__(5);

	var LeverMode = Object.freeze({
	    BROKEN		: 0,
	    LINEAR 		: 1,
	    PROPER 		: 2,
	    SYMMETRIC	: 4
	});

	var SelectMode = Object.freeze({
		NONE 		 : 0,
		CURVE_SELECT : 1,
		LEVER_SELECT : 2
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
		        case PROPER:
		            this.SetOppo(ith, oppoNorm, ratioOppo * this.points[2].Dist(newPoint));

	            /// recalculate to make three points aligned on same
	            /// line. use new direction and original distance of
	            /// opposite control point.
		        case LINEAR:
		            this.SetOppo(ith, oppoNorm, this.points[2].Dist(this.points[this.OppoOf(ith)]));

	            /// set new control point without affecting the oppo-
	            /// site. The tangent will be broken.
	     	   case BROKEN:
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
	    	var array = ExtractArray();
	    	TransFromArray(array, inc);
	    }
	}

	module.exports = Lever;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	
	var CurveMath = __webpack_require__(8);

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
/* 8 */
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	
	var CurveSideOutline = __webpack_require__(10);

	var Vector = __webpack_require__(5);
	var Lever =  __webpack_require__(6);

	var CurveMath = __webpack_require__(8);

	class Curve {

	    constructor(orig){

		    this.levers = [];

		    this.orig = orig; 

		    this.lo = new CurveSideOutline(1);
		    this.ro = new CurveSideOutline(3);

		    this.bounding = [new Vector(9999, 9999), new Vector(-9999, -9999)];

	    }

	    Add(mouseV){
	        this.levers.push(new Lever(mouseV));
	        this.GetOutlines();
	        this.UpdateBoundingRect();
	        return this.levers.length - 1;
	    }

	    Delete(index){
	        levers.splice(index, 1);
	        this.GetOutlines();
	        this.UpdateBoundingRect();
	    }
	    
	    Insert(curveCast) {
	        this.levers.splice(Math.floor(curveCast+1), 0, new Lever(new Vector(0, 0)));
	        CurveMath.SetInsertedLeverOnCurveGroup(this.levers, Math.floor(curveCast+1), curveCast - Math.floor(curveCast));
	        console.log(this.levers.length);

	        this.GetOutlines();
	        this.UpdateBoundingRect();
	        
	        return Math.floor(curveCast+1);
	    }

	    UpdateLever(ithLever, ithPoint, value){
	        this.levers[ithLever].SetControlPoint(ithPoint, value);
	        this.UpdateOutlines();
	        this.UpdateBoundingRect();
	    }

	    UpdateBoundingRect(){
	        this.bounding[0].Set(Infinity, Infinity);
	        this.bounding[1].Set(-Infinity, -Infinity);
	        for(const lever of this.levers) {
	        	for(const point of lever.points) {
		            if(point.x < this.bounding[0].x) this.bounding[0].x = point.x;
		            if(point.x > this.bounding[1].x) this.bounding[1].x = point.x;
		            if(point.y < this.bounding[0].y) this.bounding[0].y = point.y;
		            if(point.y > this.bounding[1].y) this.bounding[1].y = point.y;
		        }
	        }
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
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	var CurveSide = Object.freeze({
	    LEFT :  1,
	    RIGHT : 3
	});

	var Vector = __webpack_require__(5);
	var Lever =  __webpack_require__(6);
	var CurveMath = __webpack_require__(8);

	class CurveSideOutline{

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

	module.exports = CurveSideOutline;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	
	var Vector = __webpack_require__(5);
	var Lever =  __webpack_require__(6);
	var Curve = __webpack_require__(9);
	var CurveSideOutline = __webpack_require__(10);


	class Document{
		constructor(canvas){
			this.canvas = canvas;
			this.context = canvas.getContext("2d")
			this.curves = [];

			this.status = "Editing Existing Curves.";
		}

		LoadCurves(curves){
			this.curves = curves.map(function(x){return this.LoadCurve(x)}.bind(this));
			this.DrawCurves(null);
		}

		LoadCurve(curve){
			var curveRes = new Curve();
			// console.log(curve);
			curveRes.lo = this.LoadOutline(curve.lo);
			curveRes.ro = this.LoadOutline(curve.ro);
			curveRes.levers = curve.levers.map(function(x){return this.LoadLever(x)}.bind(this));
			curveRes.orig = this.LoadPoint(curve.orig);
			curveRes.bounding  = this.LoadBounding(curve.bounding);
			return curveRes;
		}

		LoadLever(lever){
			var leverRes = new Lever();
			leverRes.leverMode = lever.leverMode;
			leverRes.points = lever.points.map(function(x){return this.LoadPoint(x)}.bind(this));
			return leverRes;
		}

		LoadOutline(outline){
			var outlineRes = new CurveSideOutline();
			outlineRes.side = outline.side;
			outlineRes.points = outline.points.map(function(x){return this.LoadPoint(x)}.bind(this));
			return outlineRes;
		}

		LoadPoint(point){
			return new Vector(point.x, point.y);
		}

		LoadBounding(bounding){
			return [new Vector(bounding[0].x, bounding[0].y), new Vector(bounding[1].x, bounding[1].y)];
		}

	    DrawCurvesFill(currCurveIndex){

	        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

	        for (var ithCurve = this.curves.length - 1; ithCurve >= 0; ithCurve--) {
	            var curve = this.curves[ithCurve];

	            this.context.lineWidth = 1;

	            // for (var i = Things.length - 1; i >= 0; i--) {
	            //     Things[i]
	            // }

	            this.context.beginPath();
	            this.context.moveTo(curve.lo.points[0].x, curve.lo.points[0].y);
	            for(var i = 1; i < curve.levers.length; i++){

	                this.context.lineTo(curve.lo.points[3*i-2].x,   curve.lo.points[3*i-2].y);
	                this.context.moveTo(curve.lo.points[3*i-1].x,   curve.lo.points[3*i-1].y);
	                this.context.lineTo(curve.lo.points[3*i+0].x,   curve.lo.points[3*i-0].y);
	                this.context.moveTo(curve.lo.points[3*(i-1)].x, curve.lo.points[3*(i-1)].y);

	                this.context.bezierCurveTo(
	                    curve.lo.points[3*i-2].x, curve.lo.points[3*i-2].y,
	                    curve.lo.points[3*i-1].x, curve.lo.points[3*i-1].y,
	                    curve.lo.points[3*i+0].x, curve.lo.points[3*i-0].y
	                )
	            }
	            this.context.lineTo(curve.ro.points[curve.ro.points.length-1].x, curve.ro.points[curve.ro.points.length-1].y);
	            for(var i = curve.levers.length-1; i >0; i--){

	                this.context.lineTo(curve.ro.points[3*i-1].x,   curve.ro.points[3*i-1].y);
	                this.context.moveTo(curve.ro.points[3*i-2].x,   curve.ro.points[3*i-2].y);
	                this.context.lineTo(curve.ro.points[3*(i-1)].x,   curve.ro.points[3*(i-1)].y);
	                this.context.moveTo(curve.ro.points[3*i].x,     curve.ro.points[3*i].y);

	                this.context.bezierCurveTo(
	                    curve.ro.points[3*i-1].x, curve.ro.points[3*i-1].y,
	                    curve.ro.points[3*i-2].x, curve.ro.points[3*i-2].y,
	                    curve.ro.points[3*(i-1)].x, curve.ro.points[3*(i-1)].y
	                )
	            }
	            // this.context.lineTo(curve.lo.points[0].x, curve.lo.points[0].y);
	            // this.context.closePath();
	            this.context.stroke();
	        };
	    }

		DrawCurves(currCurveIndex){

	        this.context.lineWidth = 1;
			this.context.clearRect(0,0, this.canvas.width, this.canvas.height);

			if(currCurveIndex != null){			
				var levers = this.curves[currCurveIndex].levers;
				for (var i = 0; i < levers.length; i++) {
					for(var j = 0; j < 5; j++){
						this.context.beginPath();
						this.context.arc(levers[i].points[j].x, levers[i].points[j].y, 4, 0, 2 * Math.PI);
						this.context.stroke();
					}
				}

				this.context.beginPath();
				for (var i = 0; i < levers.length; i++) {
					this.context.moveTo(levers[i].points[0].x, levers[i].points[0].y);
					this.context.lineTo(levers[i].points[2].x, levers[i].points[2].y);
					this.context.lineTo(levers[i].points[4].x, levers[i].points[4].y);
					this.context.moveTo(levers[i].points[1].x, levers[i].points[1].y);
					this.context.lineTo(levers[i].points[2].x, levers[i].points[2].y);
					this.context.lineTo(levers[i].points[3].x, levers[i].points[3].y);
				}
				this.context.stroke();
			}


			for (var ith = this.curves.length - 1; ith >= 0; ith--) {
	            this.context.lineWidth = 1;
				if(this.curves[ith].levers.length > 1){

					// console.log("entered");

					this.context.beginPath();
					this.context.moveTo(this.curves[ith].lo.points[0].x, this.curves[ith].lo.points[0].y);
					for (var i = 1; i < this.curves[ith].levers.length; i++) {
						this.context.bezierCurveTo(
							this.curves[ith].lo.points[3*i-2].x, this.curves[ith].lo.points[3*i-2].y,
							this.curves[ith].lo.points[3*i-1].x, this.curves[ith].lo.points[3*i-1].y,
							this.curves[ith].lo.points[3*i+0].x, this.curves[ith].lo.points[3*i-0].y
						)
					}
					this.context.stroke();
					this.context.beginPath();
					this.context.moveTo(this.curves[ith].ro.points[0].x, this.curves[ith].ro.points[0].y);
					for (var i = 1; i < this.curves[ith].levers.length; i++) {
						this.context.bezierCurveTo(
							this.curves[ith].ro.points[3*i-2].x, this.curves[ith].ro.points[3*i-2].y,
							this.curves[ith].ro.points[3*i-1].x, this.curves[ith].ro.points[3*i-1].y,
							this.curves[ith].ro.points[3*i+0].x, this.curves[ith].ro.points[3*i-0].y
						)
					}
					this.context.stroke();

	                this.context.lineWidth = 2;
	                this.context.beginPath();
	                this.context.moveTo(this.curves[ith].levers[0].points[2].x, this.curves[ith].levers[0].points[2].y);
	                for (var i = 0; i < this.curves[ith].levers.length - 1; i++) {
	                    this.context.bezierCurveTo(
	                        this.curves[ith].levers[i].points[4].x,   this.curves[ith].levers[i].points[4].y,
	                        this.curves[ith].levers[i+1].points[0].x, this.curves[ith].levers[i+1].points[0].y,
	                        this.curves[ith].levers[i+1].points[2].x, this.curves[ith].levers[i+1].points[2].y
	                    )
	                }
	                this.context.stroke();

				}

			}


		}
	}

	module.exports = Document;

/***/ })
/******/ ]);