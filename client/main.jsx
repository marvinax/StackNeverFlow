var React = require('react');
var Notette = require('./Notette.jsx');
var EntryModel = require('./EntryModel.js');
var Utils = require('./Utils.js');

var Entry = React.createClass({

	saveText : function(text){
		var currentNoteRef = this.refs["entry-"+entryModel.currentEditingNote];
		var currentNoteText = text ? text : currentNoteRef.refs.textArea.value;
		entryModel.saveEntry(currentNoteText);
	},

	getText : function(){
		var currentNoteRef = this.refs["entry-"+entryModel.currentEditingNote];
		return currentNoteRef.refs.textArea.value;
	},

	keyDownHandler : function(e){
		if( e.which == 9 ){
			e.preventDefault();

			this.saveText();

			if (!e.shiftKey){
				if (entryModel.isLast())
					entryModel.addEntry("Any thoughts?");
				entryModel.moveNext();				
			}
			else{
				entryModel.movePrev();
			}
		}

		if( e.which == 8){
			if(this.getText() === "" && !entryModel.isFirst()){
				e.preventDefault();
				entryModel.removeEntry();	
			}
		}

		entryModel.notify();
		React.findDOMNode(this.refs["entry-"+entryModel.currentEditingNote].refs.textArea).focus();
	},

	componentDidMount: function () {

	},

	render : function() {
		var that = this;

		var renderedEntries = entryModel.notes.map(function(entry, index){
			return (
				<Notette
					key={entry.id}
					description="Note"
					ref={"entry-"+index}
					keyDownHandler={that.keyDownHandler}
					defaultText={entry.content}
				/>
			)	
		});

		return(
			<div>
			<div
				style={{
					margin: "-0.1em 0.1em",
					fontFamily:"Seravek",
					letterSpacing: "-0.07em",
					fontSize: "5em",
					fontWeight:"Bold",
					clear:"both"
				}}
			>
				StackNEVERflow
			</div>
			{renderedEntries}
			</div>
		)
	}
})

var entryModel = new EntryModel('Entry');

function render(){
	React.render(<Entry/>, document.getElementById('content'));
}

entryModel.subscribe(render);
render();