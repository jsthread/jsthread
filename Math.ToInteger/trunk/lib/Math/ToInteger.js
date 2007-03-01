//@esmodpp
//@version 0.0.0
//@namespace Math


// This module provides functions emulating the integral type 
// conversions defined in ECMA-262 3rd.


//@export ToInteger
function ToInteger ( n ) {
    return n < 0 ? ceil(n)
                 : floor(n) || 0;
}


//@export ToInt32
function ToInt32 ( n ) {
    return n | 0;
}


//@export ToUInt32
function ToUInt32 ( n ) {
    return n >>> 0;
}


//@export ToUInt16
function ToUInt16 ( n ) {
    return n & 0xFFFF;
}

