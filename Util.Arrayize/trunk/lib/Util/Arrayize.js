//@esmodpp
//@version 0.0.0
//@namespace Util.Arrayize



var slice = Array.prototype.slice;

//@export arrayize
function arrayize ( o ) {
    if ( !o ) return [];
    try {
        return slice.call(o, 0);
    } catch ( e ) {
        var r = [];
        for ( var i=0;  i < o.length;  i++ ) {
            r[i] = o[i];
        }
        return r;
    }
}

