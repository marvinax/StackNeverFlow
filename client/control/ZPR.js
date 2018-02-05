var Vector = require('../model/Vector.js');
var Matrix = require('../model/Matrix.js');

/**
 * Zoom, Pan and Rotate
 */
class ZPR {
	
	constructor(){
		this.zoom = 1;
		this.pan = new Vector(0, 0);
		this.trans = new Matrix();
		this.invTrans = new Matrix();
	}

	/**
	 * for transforming model to screen point
	 * @param {[type]} vec [description]
	 */
	Transform(vec){
		return this.trans.Mult(vec);
	}

	/**
	 * for transforming screen point to model
	 * @param {[type]} vec [description]
	 */
	InvTransform(vec){
		return this.invTrans.Mult(vec);
	}

	/**
	 * for doing zpr operation with mouse event
	 * @param  {[type]} mouseScreenVec [description]
	 * @return {[type]}                [description]
	 */
	Zoom(mouseScreenVec, zoomInc){
		var newZoom = (this.zoom >= 3 && zoomInc > 0) ? 1 : (this.zoom <= 0.6 && zoomInc < 0) ? 1 : 1 + zoomInc;

		var newM1 = new Matrix(),
			newM2 = new Matrix(),
			newM3 = new Matrix();

		newM1.SetPan(mouseScreenVec);
		newM2.SetZoom({x:newZoom, y:newZoom});
		newM3.SetPan({x:-mouseScreenVec.x, y:-mouseScreenVec.y});

		this.trans = newM3.Mult(newM2).Mult(newM1).Mult(this.trans);
		console.log(this.trans.toString());
		this.invTrans = this.trans.Inv();
	}
}

module.exports = ZPR;