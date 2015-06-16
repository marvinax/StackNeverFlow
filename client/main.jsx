var React = require('react');
var Note = require('./Note.jsx');
var $ = require('jquery');

var NoteHolder = React.createClass({

	move : function(dir){
		if(dir === "forward"){
			this.setState({currentEditingNote : this.state.currentEditingNote + 1});
		} else if (dir === "backward"){
			this.setState({currentEditingNote : this.state.currentEditingNote - 1});
		}
	},

	deleteCurrentNote : function(){
		this.setState({
			notes : this.state.notes.splice(this.state.currentEditingNote, 1),
			currentEditingNote : this.state.currentEditingNote - 1
		})
	},

	focusNote : function(index){
		var realIndex = (index < this.state.notes.length) ? index : this.state.notes.length-1;
		this.refs["entry-"+ realIndex].refs.textArea.focus();
	},

	saveNotes : function(){
		console.log('saving');

		var that = this;
		var notes = Object.keys(this.refs).map(function(key){
			return that.refs[key].refs.textArea.value
		});

		$.post('/save', {
			data : notes.join('#$#')
		}, function(data){
			console.log(data);
		})
	},

	loadNotes : function(){
		console.log('loading');
		$.get('/load', function(data){
			var loadedContent = data.map(function(elem){
				return elem.content;
			});
			loadedContent.reverse();
			if(loadedContent.length != 0){
				this.setState({notes : loadedContent});
			}
		}.bind(this));

	},

	getNoteContent : function(index){
		return this.refs["entry-"+ index].refs.textArea.value;
	},

	getInitialState: function () {
		console.log('called only once');
		return {
			notes : [""],
			currentEditingNote : 0,
		};
	},

	keyDownHandler : function(e){
		if( e.which == 9 ){
			e.preventDefault();

			if (!e.shiftKey){

				if(this.state.currentEditingNote === this.state.notes.length-1){
					this.setState({notes : this.state.notes.concat("Any thoughts?")});
				}
				this.move("forward");

			} else if(this.state.currentEditingNote > 0){

				this.move("backward");

			}
		}
		if(e.which == 8)
			if (this.state.currentEditingNote > 0 && this.getNoteContent(this.state.currentEditingNote) === ""){
				e.preventDefault();
				this.deleteCurrentNote();
			}

		if(e.which == 76 && e.shiftKey && e.metaKey){
			e.preventDefault();
			this.loadNotes();
		}

		if(e.which == 83 && e.shiftKey && e.metaKey){
			e.preventDefault();
			this.saveNotes();
		}

	},

	componentDidMount: function () {
		this.loadNotes();
		this.focusNote(this.state.currentEditingNote);
	},

	componentWillUpdate: function (nextProps, nextState) {
	    console.log(this.state.notes); 
	    console.log(nextState.notes);  
	},

	componentDidUpdate: function (prevProps, prevState) {
		console.log(prevState.notes);
		console.log(this.state.notes);
		this.focusNote(this.state.currentEditingNote);
		// this.forceUpdate();
	},

	render : function() {
		var that = this;
		var renderedEntries = this.state.notes.map(function(note, index){
			return (
				<Note
					key={"key-"+index}
					ref={"entry-"+index}
					keyDownHandler={that.keyDownHandler}
					text={note}
				/>
			)	
		});

		return(
			<div className="note-holder">
				{renderedEntries}
			</div>
		)
	}
})

React.render(<NoteHolder/>, document.getElementById('content'));
