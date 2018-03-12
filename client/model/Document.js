var Vector =  require('./Vector.js');
var Lever =   require('./Lever.js');
var Curve =   require('./Curve.js');
var Draw =    require('../control/Draw.js');

Array.prototype.last = function(){
	return this[this.length - 1];
}

class Document{

	constructor(input){

		this.params = {};
		this.curves = [];
		this.anchor = new Vector(0, 0);
		this.importedDocuments = {};

		if(input != undefined)
			this.SetDocument(input);
	}

	SetDocument(input){
		this.params = input.params;
		this.curves = input.curves.map(function(curve){return new Curve(curve)});
		this.anchor = new Vector(input.anchor);
		for(var docName in input.importDocuments){
			this.importedDocuments[docName] = new Document(this.importedDocuments[docName]);
			document.dispatchEvent(new Event('ondocuchange'));
		}
	}	
}

module.exports = Document;
