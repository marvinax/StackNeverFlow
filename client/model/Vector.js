class Vector{

	constructor(x, y){
		this.x = x;
		this.y = y;
	}

	Copy(){
		return new Vector(this.x, this.y);
	}

	Dist(v){
		var dx = v.x - this.x;
		var dy = v.y - this.y;
		return Math.hypot(dx, dy);
	}

    Dot(v){
        return this.x*v.x + this.y*v.y;
    }

    Cross(v){
    	return this.x*v.y - this.y*v.x;
    }

	Mag(){
        return Math.hypot(this.x, this.y);
	}

	static Dist(v1, v2){
		var dx = v2.x - v1.x;
		var dy = v2.y - v1.y;
		return Math.hypot(dx, dy);
	}

	Normalize() {
		var d = Math.hypot(this.x, this.y);
		return new Vector(this.x/d, this.y/d);
	}

	Sub(v){
		return new Vector(this.x - v.x, this.y - v.y);
	}

    Subl(v){
        this.x -= v.x;
        this.y -= v.y;
    }

	Add(v){
		return new Vector(this.x + v.x, this.y + v.y);
	}

    Addl(v){
        this.x += v.x;
        this.y += v.y;
    }

	Mult(s){
		return new Vector(this.x * s, this.y * s);
	}

    Multl(s){
        this.x *= s;
        this.y *= s;
    }

	Set(x, y){
		if(typeof y !== "undefined"){
			this.x = x;
			this.y = y;
		} else {
			this.x = x.x;
			this.y = x.y;
		}
	}

	Angle(){
		return Math.atan(this.y/this.x);
	}

	get Zero(){
		return new Vector(0, 0);
	}

	LeftPerp(){
		return new Vector(-this.y, this.x);
	}

	RightPerp(){
		return new Vector(this.y, -this.x);	
	}

	toString(){
		return this.x.toFixed(3) + " " + this.y.toFixed(3);
	}
}

module.exports = Vector;