
/**
 * stores current editing context, including
 * 1. current curve index
 * 2. current lever index
 * 3. current select point
 * 4. current translate array (temporarily store the original point set of
 * 	  lever or curve)
 * 5. captured context
 */

var Status = Object.freeze({
		Editing : 0,
		Creating : 1,
		MovingCurve : 2,
		MovingLever : 3,
		EditingLever : 4,
		MovingAnchor : 5
	});

class EditorCoreData{
	constructor(){
		
		this.docu = new Document();

		this.status = Status.Editing;

		this.currCurveIndex = null;
		this.currLeverIndex = null;
		this.currPointIndex = null;

		this.transArray = null;

		this.captured = null;

	}

	CurrCurve(){
		return this.docu.curves[this.currCurveIndex];
	}

	CurrLever(){
		return this.docu.curves[this.currCurveIndex].levers[this.currLeverIndex];
	}

	AddCurve(curve){
		this.currCurveIndex = this.docu.curves.push(curve) - 1;
	}

	AddPoint(point){
		if(this.currCurveIndex == null){
			this.AddCurve(new Curve(point));
		} else {
			if(this.SelectControlPoint(point, false) == -1){
				this.currLeverIndex = this.CurrCurve().Add(point);
				console.log(this.currLeverIndex);
			}
		}
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
		this.currPoint = null;
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
				cast = Cast.Lever(lever, point);
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

	PrepareTrans(point){

		var prepareLeverTrans = function(ith, point){
			var curve = this.docu.curves[ith];

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
		}

		for (const [ith, curve] of this.docu.curves.entries()){
			if(Cast.Curve(curve, point) != -1) {
				this.currCurveIndex = ith;
				this.transArray = this.PrepareLeverTrans(ith, point);
				if(transArray.length == 0){
					this.status = Status.MovingCurve;
					this.transArray = this.CurrCurve().ExtractArray();
				}
				break;
			}
		}
	}

}

module.exports = EditorCoreData;