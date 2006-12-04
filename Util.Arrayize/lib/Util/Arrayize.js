//@esmodpp
//@version 0.0.0
//@namespace Util.Arrayize



var slice = Array.prototype.slice;

//@export arrayize
function arrayize ( o ) {
    if ( !o ) return [];
    return slice.call(o, 0);
}

