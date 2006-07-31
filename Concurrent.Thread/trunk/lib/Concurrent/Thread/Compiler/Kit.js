//@esmodpp
//@version 0.0.0

//@namespace Concurrent.Thread.Compiler
//@require   Data.Error.IllegalStateException


//@export Kit
var Kit = {};

Kit.codeBug = function ( ) {
    var e = new Data.Error.IllegalStateException("FAILED ASSERTION");
    var s = e.toString();
    if ( e.stack ) s += "\n----------\n" + e.stack;
    alert(s);
    throw e;
}

