var Outline = require('./Outline.js');
var Vector  = require('./Vector.js');
var Lever   = require('./Lever.js');

var CurveMath = require('../math/CurveMath.js');

class Curve {

    constructor(input){

        if(input != undefined){
            this.head = new Lever(input.head);
            this.tail = new Lever(input.tail);
            this.outline = new Outline(input.outline);
        } else {
            this.head = new Lever();
            this.tail = new Lever();
            this.outline = new Outline();            
        }

        this.levers = 0;

        // computational attributes

        this.anchor = new Vector(0, 0)
    }

    Add(mouseV){
        if(this.levers == 0){
            this.head = new Lever(mouseV)
            this.levers = 1
        }else if (this.levers == 1){
            this.tail = new Lever(mouseV)
            this.levers = 2
        }

    }

    UpdateLever(ithLever, ithPoint, value){
        this.levers[ithLever].SetControlPoint(ithPoint, value);
        this.outline.GetOutline(this.levers);
    }

    GetOutlines(){
        this.outline.GetOutline(this.levers);
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
        this.GetOutlines();
    }
}

module.exports = Curve;