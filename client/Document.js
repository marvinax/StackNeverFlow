
var Vector = require('./Vector.js');
var Lever =  require('./Lever.js');
var Curve = require('./Curve.js');
var CurveSideOutline = require('./CurveSideOutline.js');


class Param{
 	constructor(name, value, min, max){
        this.name = name;
        this.value = value;
        this.min = min;
        this.max = max;
    }
}

class Document{
	constructor(canvas){
		this.canvas = canvas;
		this.curves = [];

		this.datastack = [];
		this.params = [];
		this.exprs = [];

		this.status = "Editing Existing Curves.";
	}

    pop(){
        return this.datastack.pop();
    }
    
    push(data){
        this.datastack.push(data);
    }
    
    eval(expr){
        this.stack = split(this.expr, ' ');
                        
        for(let i = stack.length-1; i >= 0; i--){
            if(this.stack[i].equals("curve")){
				this.push(this.curves[parseInt(stack[i+1])]);
            }
            
            if(stack[i].equals("lever")){
                this.push(this.pop().levers[parseInt(stack[i+1])]);    
            }
            
            if(stack[i].equals("point")){
                this.push(this.pop().points[parseInt(stack[i+1])]);    
            }
            
            if(stack[i].equals("float")){
                this.push (parseFloat(stack[i+1]));
            }
            
            if(stack[i].equals("vec")){
                this.push(new Vector(parseFloat(stack[i+1]), parseFloat(stack[i+2])));
            }
            
            if(stack[i].equals("plus")){
                var p1 = this.pop();
                var p2 = this.pop();
                this.push(Vector.Add(p1, p2));
            }
            if(stack[i].equals("trans")){
                var elem = this.pop();
                var increm = this.pop();
                var array = elem.ExtractArray();
                elem.TranslateFromArray(array, increm);
            }
        }
        
    } 
}

module.exports = Document;