var React = require('react');
var Textarea = require('react-textarea-autosize');

var Note = React.createClass({
    render: function() {

        return (
            <div className="text-holder">
                <Textarea
                    className="text-style"
                    ref="textArea"
                    minRows={3}
                    onKeyDown={this.props.keyDownHandler}
                    defaultValue={this.props.text}
                />
            </div>
        );
    }
});

module.exports = Note;