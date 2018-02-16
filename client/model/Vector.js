class Vector{

	constructor(x, y){
		if(x.x != undefined && x.y != undefined && y == undefined){
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x;
			this.y = y;
		}
	}

	Copy(){
		return new Vector(this.x, this.y);
	}

	Abs(){
		return new Vector(Math.abs(this.x), Math.abs(this.y));
	}

    static Abs(v){
        return new Vector(Math.abs(v.x), Math.abs(v.y));
    }

	Dist(v){
		var dx = v.x - this.x;
		var dy = v.y - this.y;
		return Math.hypot(dx, dy);
	}

    static Dist(v1, v2){
       return Math.hypot(v2.x - v1.x, v2.y - v1.y);
    }

    Dot(v){
        return this.x*v.x + this.y*v.y;
    }

    static Dot(v1, v2){
        return v1.x*v2.x + v1.y*v1.y; 
    }

    Cross(v){
    	return this.x*v.y - this.y*v.x;
    }

    static Cross(v1, v2){
        return v1.x*v2.y - v1.y*v2.x;
    }

	Mag(){
        return Math.hypot(this.x, this.y);
	}

    static Mag(v){
        return Math.hypot(v.x, v.y);
    }

	Normalize() {
		var d = Math.hypot(this.x, this.y);
		return new Vector(this.x/d, this.y/d);
	}

    static Normalize(v){
        var d = Vector.Mag(v);
        return new Vector(v.x/d, v.y/d);
    }

	Sub(v){
		return new Vector(this.x - v.x, this.y - v.y);
	}

    static Sub(v1, v2){
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    Subl(v){
        this.x -= v.x;
        this.y -= v.y;
    }

	Add(v){
		return new Vector(this.x + v.x, this.y + v.y);
	}

    static Add(v1, v2){
        return new Vector(v1.x + v2.x, v1.y + v2.y); 
    }

    Addl(v){
        this.x += v.x;
        this.y += v.y;
    }

	Mult(s){
		return new Vector(this.x * s, this.y * s);
	}

    static Mult(v, s){
        return new Vector(v.x * s, v.y * s); 
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
		return Math.atan2(this.y, this.x);
	}

    static Angle(v){
        return Math.atan2(v.y, v.x);
    }

	LeftPerp(){
		return new Vector(-this.y, this.x);
	}

    static LeftPerp(v){
        return new Vector(-v.y, v.x);
    }

	RightPerp(){
		return new Vector(this.y, -this.x);	
	}

    static RightPerp(v){
        return new Vector(v.y, -v.x);
    }

	toString(){
		return this.x.toFixed(3) + " " + this.y.toFixed(3);
	}
}

module.exports = Vector;
