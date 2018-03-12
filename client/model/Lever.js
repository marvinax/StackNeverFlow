var Vector = require("./Vector.js");

var StrokeMode = Object.freeze({
    FREE : 0,
    PERP : 1
})

var SelectMode = Object.freeze({
	NONE 		 : 0,
	LEVER_SELECT : 1
});

class Lever {

	constructor(input){

        if(input != undefined){

            if(input.end != undefined && input.control != undefined){
                this.end     = new Vector(input.end)
                this.control = new Vector(input.control)
            }
            if(input.point != undefined){
                
                this.end     = new Vector(input.point)
                this.control = new Vector(input.point)
            }

        } else {
			this.end     = new Vector(0, 0)
			this.control = new Vector(0, 0)
		}
	}

    Copy(){
        
        var newLever = new Lever();

        newLever.end     = this.end.Copy()
        newLever.control = this.control.Copy()
        
        return newLever;
    }

    SetControlPoint(ith, newPoint) {
        this.control.Set(newPoint);
    }

    // ExtractArray and TransFromArray should be appear in Dragging handler,
    // to implement the real time update during dragging. When dragging around,
    // the lever should be always translated from same array (or point group)
    // until mouseup.

    ExtractArray(){
    	return [this.end.Copy(),
    			this.control.Copy()];
    }

    TransFromArray(points, inc){
    	this.end     = inc.Add(points[0])
    	this.control = inc.Add(points[1])
    }

    Trans(inc){
    	var array = this.ExtractArray();
    	this.TransFromArray(array, inc);
    }

    TransCreate(inc){
        var lever = this.Copy();
        lever.Trans(inc);
        return lever;
    }
}

module.exports = Lever;