var React = require('react');
var Textarea = require('react-textarea-autosize');

const style={
}

const textStyle={
    float : "left",
    verticalAlign:"bottom",
    padding : "0.7em",
    width : "400px",
    borderRadius : "0.5em",
    margin : "0.2em",
    width : "400px",
    border : "none",
    outline : "none",
    resize : "none",
    display : "block",
    fontSize : "1em",
    fontWeight : "lighter",
    fontFamily: "Seravek",
    backgroundColor : "#A9C4D9",
    color : "#010E17"
}

var Notette = React.createClass({
    componentDidMount : function() {
        React.findDOMNode(this.refs.textArea).focus();
    },

    render: function() {
        return (
            <div style={style}>
                <Textarea
                    ref="textArea"
                    minRows={3}
                    style={textStyle}
                    onKeyDown={this.props.keyDownHandler}
                    defaultValue={this.props.defaultText}
                />
            </div>
        );
    }
});

module.exports = Notette;