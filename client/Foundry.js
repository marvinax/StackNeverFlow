"use strict";

require('./styles.css')

var Editor = require('./Editor');
var Vector   = require('./model/Vector.js');

(function(){
	window.onload = function() {
		var editor = new Editor();
	}	
})();
