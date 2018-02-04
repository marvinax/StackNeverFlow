var Status = require("./Status.js");

var Curve    = require('./model/Curve.js');
var Cast     = require('./control/Cast.js');

/**
 * stores current editing context, including
 * 1. current curve index
 * 2. current lever index
 * 3. current select point
 * 4. current translate array (temporarily store the original point set of
 * 	  lever or curve)
 * 5. captured context
 */


class EditorCoreData{
	constructor(){
		
		this.docu = new Document();

		this.status = Status.Editing;

		this.currCurveIndex = null;
		this.currLeverIndex = null;
		this.currPointIndex = null;

		this.transArray = [];

		// this.captured = null;

	}

	CurrCurve(){
		return this.docu.curves[this.currCurveIndex];
	}

	CurrLever(){
		return this.docu.curves[this.currCurveIndex].levers[this.currLeverIndex];
	}

	TransCurrCurve(vec){
		this.CurrCurve().TransFromArray(this.transArray, vec);
	}

	TransCurrLever(vec){
		this.CurrLever().TransFromArray(this.transArray, vec);
	}

	AddCurve(curve){
		this.currCurveIndex = this.docu.curves.push(curve) - 1;
	}

	AddPoint(point){
		if(this.currCurveIndex == null){
			this.AddCurve(new Curve());
		}

		this.SelectControlPoint(point, false);
		if(this.currLeverIndex == null){
			this.currLeverIndex = this.CurrCurve().Add({point:point});
		}

		console.log(this.CurrCurve());
	}

	RemoveLever(){
        if(this.currCurveIndex != null){
		    var curve = this.CurrCurve();
		    if(this.currLeverIndex != null){
		        curve.levers.splice(this.currLeverIndex, 1);
		        curve.UpdateOutlines();
		        this.currLeverIndex = null;
		    }

		    if(curve.levers.length == 1){
		        this.curves.splice(this.currCurveIndex, 1);
		        this.currCurveIndex = null;
		    }
		}
	}

	UpdateCurrLever(newPoint){
		this.CurrCurve().UpdateLever(this.currLeverIndex, this.currPointIndex, newPoint);
	}

	Deselect(){
		this.currCurveIndex = null,
		this.currLeverIndex = null,
		this.currPointIndex = null;
	}

	/**
	 * Once a casted control point of a lever found, set up current
	 * lever index and control point index, and set the status
	 * 
	 * NOTE: the editing status is also set here.
	 */
	SelectControlPoint(point, no_center){

		this.currLeverIndex = null;
		if(this.currCurveIndex != null){
			for (const [i, lever] of this.CurrCurve().levers.entries()){
				var cast = Cast.Lever(lever, point);
				if(cast != -1 && cast != (no_center ? 2 : -1)){
					this.currLeverIndex = i;
					this.currPointIndex = cast;
					this.status = Status.EditingLever;
					break;
				}
			}
		}
	}

	/**
	 * before actually transform the curve, the original position or shape
	 * of the curve / lever should be preserved in order to elimiated the 
	 * accumulative error.
	 *
 	 * NOTE: the editing status is also set here.
	 */

	PrepareLeverTrans(curve, ith, point){

		for (const [i, lever] of this.CurrCurve().levers.entries()){
			var cast = Cast.Lever(lever, point);
			if(cast != -1){
				this.currLeverIndex = i;
				this.currPoint = cast;
				this.status = Status.MovingLever;
				this.transArray = this.CurrLever().ExtractArray();
				break;
			}
		}
	};

	PrepareTrans(point){

		// first clear the transArray
		this.transArray = [];

		// check if we are moving a lever, done by a cast test

		// check if we are moving the whole curve, if not moving a lever
		// also done by cast test
		
		console.log(this.currLeverIndex);
		for (const [ith, curve] of this.docu.curves.entries()){
			if(Cast.Curve(curve, point) != -1) {
				this.currCurveIndex = ith;
				this.PrepareLeverTrans(curve, ith, point);
				console.log(this.transArray);
				if(this.transArray.length == 0){
					this.status = Status.MovingCurve;
					this.transArray = this.CurrCurve().ExtractArray();
				}
				break;
			}
		}
	}

}

module.exports = EditorCoreData;