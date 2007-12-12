//@esmodpp
//@version 0.0.0

//@namespace Util


//@export equivalent
function equivalent ( x, y ) {
    if ( x  &&  typeof x.equals == "function" ) {
        return x.equals(y);
    }
    else {
        return x === y;
    }
}
