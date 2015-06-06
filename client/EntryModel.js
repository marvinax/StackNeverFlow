var Utils = require('./Utils.js');

var EntryModel = function(key){
	this.key = key;
	this.currentEditingNote = 0;
	this.notes = Utils.store(key);
	this.onChangeCallBacks = [];

	if(Utils.getStoreLength(this.key) == 0) this.addEntry("Start from here");
	this.notify();
}

EntryModel.prototype.subscribe = function(onChangeCallBack){
	this.onChangeCallBacks.push(onChangeCallBack);
}

EntryModel.prototype.notify = function(){
	Utils.store(this.key, this.notes);
	this.onChangeCallBacks.forEach(function(callback) {callback();});
}

EntryModel.prototype.moveNext = function(){
	this.currentEditingNote += 1;
}

EntryModel.prototype.movePrev = function(){
	this.currentEditingNote -= 1;
}

EntryModel.prototype.isLast = function(){
	return this.currentEditingNote == Utils.getStoreLength(this.key) - 1;
}

EntryModel.prototype.isFirst = function(){
	return this.currentEditingNote == 0;
}

EntryModel.prototype.addEntry = function(content){
	this.notes = this.notes.concat({
		id : Utils.uuid(),
		content : content
	})
}

EntryModel.prototype.saveEntry = function(content){
	this.notes[this.currentEditingNote].content = content;
}

EntryModel.prototype.removeEntry = function(content){
	this.notes.splice(this.currentEditingNote, 1);
	this.movePrev();
}

EntryModel.prototype.mergeEntryToPrev = function() {
	if (!this.isFirst()){
		var contentToBeMerged = this.notes[this.currentEditingNote].content;
		this.notes.splice(this.currentEditingNote, 1);
		this.movePrev();
		this.notes[this.currentEditingNote].content += contentToBeMerged;
		Utils.store(this.key, this.notes);
	}
}

module.exports = EntryModel;