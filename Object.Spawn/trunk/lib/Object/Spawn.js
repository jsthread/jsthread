//@esmodpp
//@version 0.1.0


Object.spawn = function ( obj ) {
    if ( obj instanceof Object ) {
        dummy.prototype = obj;
        return new dummy;
    } else {
        throw new TypeError("not an object: " + obj);
    }
};

function dummy ( ) { }

