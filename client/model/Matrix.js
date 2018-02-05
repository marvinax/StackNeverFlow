class Matrix{

	constructor(){
		this.elements = [

				1, 0, 0,
				0, 1, 0,
				0, 0, 1

		];
	}


	SetPan(vec){
		this.elements[2] = vec.x;
		this.elements[5] = vec.y;
	}

	SetZoom(vec){
		this.elements[0] = vec.x;
		this.elements[4] = vec.y;
	}

	Mult ( m ) {

		// if m is a matrix, then return a new matrix, which
		// stores the product of *THIS* and *m* (the sequence
		// matters)
		// 
		// if m is a vector, then return a new vector which is
		// the product of this and the vector. Notably the vector
		// is extended with third dimension as weight, but we set
		// it 1. 

		if(m.elements != undefined){
			var te = this.elements.slice();
			var me = m.elements;

			var a11 = te[ 0 ], a12 = te[ 3 ], a13 = te[ 6 ];
			var a21 = te[ 1 ], a22 = te[ 4 ], a23 = te[ 7 ];
			var a31 = te[ 2 ], a32 = te[ 5 ], a33 = te[ 8 ];

			var b11 = me[ 0 ], b12 = me[ 3 ], b13 = me[ 6 ];
			var b21 = me[ 1 ], b22 = me[ 4 ], b23 = me[ 7 ];
			var b31 = me[ 2 ], b32 = me[ 5 ], b33 = me[ 8 ];

			te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31;
			te[ 3 ] = a11 * b12 + a12 * b22 + a13 * b32;
			te[ 6 ] = a11 * b13 + a12 * b23 + a13 * b33;

			te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31;
			te[ 4 ] = a21 * b12 + a22 * b22 + a23 * b32;
			te[ 7 ] = a21 * b13 + a22 * b23 + a23 * b33;

			te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31;
			te[ 5 ] = a31 * b12 + a32 * b22 + a33 * b32;
			te[ 8 ] = a31 * b13 + a32 * b23 + a33 * b33;

			var newM = new Matrix();
			newM.elements = te;
			return newM;

		} else if (m.x != undefined && m.y != undefined){

			var newV = m.Copy(),
				e = this.elements;

			newV.x = e[ 0 ] * m.x + e[ 3 ] * m.y + e[ 2 ];
			newV.y = e[ 1 ] * m.x + e[ 4 ] * m.y + e[ 5 ];

			return newV;
		}
	}

	Inv(){

		var me = this.elements.slice(),

		n11 = me[ 0 ], n21 = me[ 1 ], n31 = me[ 2 ],
		n12 = me[ 3 ], n22 = me[ 4 ], n32 = me[ 5 ],
		n13 = me[ 6 ], n23 = me[ 7 ], n33 = me[ 8 ],

		t11 = n33 * n22 - n32 * n23,
		t12 = n32 * n13 - n33 * n12,
		t13 = n23 * n12 - n22 * n13,

		// since the matrix is always get from the composition of
		// translation / rotation transform, it's guaranteed that
		// it's invertable. So no more determinant check.
		
		detInv = 1/ (n11 * t11 + n21 * t12 + n31 * t13);

		me[ 0 ] = t11 * detInv;
		me[ 1 ] = ( n31 * n23 - n33 * n21 ) * detInv;
		me[ 2 ] = ( n32 * n21 - n31 * n22 ) * detInv;

		me[ 3 ] = t12 * detInv;
		me[ 4 ] = ( n33 * n11 - n31 * n13 ) * detInv;
		me[ 5 ] = ( n31 * n12 - n32 * n11 ) * detInv;

		me[ 6 ] = t13 * detInv;
		me[ 7 ] = ( n21 * n13 - n23 * n11 ) * detInv;
		me[ 8 ] = ( n22 * n11 - n21 * n12 ) * detInv;

		var newM = new Matrix();
		newM.elements = me;
		return newM;
	}

	toString(){
		var e = this.elements;
		return e[0].toFixed(4) + " " + e[1].toFixed(4) + " " + e[2].toFixed(4) + "\n" +
			   e[3].toFixed(4) + " " + e[4].toFixed(4) + " " + e[5].toFixed(4) + "\n" +
			   e[6].toFixed(4) + " " + e[7].toFixed(4) + " " + e[8].toFixed(4);
	}
}

module.exports = Matrix;